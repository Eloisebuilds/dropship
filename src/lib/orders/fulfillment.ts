import { getCJClient } from "@/lib/cj/client";
import type { CJFreightOption } from "@/lib/cj/types";

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  BR: "Brazil",
  JP: "Japan",
  CN: "China",
  CH: "Switzerland",
  IN: "India",
  KR: "South Korea",
};

function countryName(code?: string): string {
  if (!code) return "United States";
  return COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase();
}

interface FulfillmentItem {
  cjVariantId?: string;
  productId?: string;
  quantity: number;
}

interface FulfillmentParams {
  orderId: string;
  items: FulfillmentItem[];
  shipping: {
    countryCode?: string;
    country?: string;
    province?: string;
    city?: string;
    address?: string;
    zip?: string;
    phone?: string;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface FulfillmentResult {
  cjOrderId: string | null;
  cjOrderStatus: string | null;
  cjPayUrl: string | null;
  balancePaid: boolean;
  error?: string;
}

/**
 * Creates the CJ Dropshipping order AFTER the customer has paid via Stripe.
 * Orders are created in balance-payment mode (payType=2); if CJ returns a
 * payment URL we settle it from the merchant balance (best-effort) instead of
 * redirecting the customer. Errors are non-fatal: the order stays paid in our
 * DB and can be settled manually in the CJ dashboard.
 */
/**
 * Queries valid logistics options for the order's destination and picks the
 * cheapest available carrier. Without a valid logistics name the CJ order is
 * created but never gets a shipment order (logisticsMiss=true), so the
 * balance payment can never succeed.
 */
async function getValidFreightOption(cj: NonNullable<ReturnType<typeof getCJClient>>, params: FulfillmentParams): Promise<{ option: CJFreightOption | null; all: string[] }> {
  try {
    const res = await cj.freightCalculate({
      startCountryCode: "CN",
      endCountryCode: params.shipping.countryCode || "US",
      products: params.items.map((item) => ({
        vid: item.cjVariantId || item.productId || "",
        quantity: item.quantity,
      })),
    });
    const options = res.data || [];
    console.log("[fulfillment] freight options ->", JSON.stringify(options.map((o) => ({ name: o.logisticName, price: o.logisticPrice, aging: o.logisticAging }))));
    if (options.length === 0) return { option: null, all: [] };
    const cheapest = options.reduce((best, cur) => (cur.logisticPrice ?? Infinity) < (best.logisticPrice ?? Infinity) ? cur : best);
    console.log("[fulfillment] freight picked ->", cheapest.logisticName, cheapest.logisticPrice);
    return { option: cheapest, all: options.map((o) => o.logisticName) };
  } catch (error) {
    console.log("[fulfillment] freightCalculate failed:", error instanceof Error ? error.message : error);
    return { option: null, all: [] };
  }
}

export async function fulfillWithCJ(params: FulfillmentParams): Promise<FulfillmentResult> {
  const cj = getCJClient();
  if (!cj) {
    return { cjOrderId: null, cjOrderStatus: null, cjPayUrl: null, balancePaid: false };
  }

  try {
    const freight = await getValidFreightOption(cj, params);
    const logisticName = freight.option?.logisticName || "CJPacket Ordinary";

    const result = await cj.createOrder({
      orderNumber: params.orderId,
      shippingCountryCode: params.shipping.countryCode || "US",
      shippingCountry: countryName(params.shipping.countryCode),
      shippingProvince: params.shipping.province || "N/A",
      shippingCity: params.shipping.city || "N/A",
      shippingAddress: params.shipping.address || "N/A",
      shippingCustomerName: params.customer.name,
      shippingPhone: params.shipping.phone || params.customer.phone || "",
      shippingZip: params.shipping.zip || "",
      email: params.customer.email,
      logisticName,
      fromCountryCode: "CN",
      isSandbox: process.env.CJ_SANDBOX_TEST === "1" || process.env.NODE_ENV === "development" ? 1 : 0,
      products: params.items.map((item) => ({
        vid: item.cjVariantId || item.productId || "",
        quantity: item.quantity,
        storeLineItemId: `${params.orderId}-${item.productId}`,
      })),
    });

    const cjOrderId = result.data?.orderId || null;
    const cjOrderStatus = result.data?.orderStatus || "CREATED";
    console.log("[fulfillment] createOrderV3 ->", JSON.stringify(result.data ?? result));

    if (!cjOrderId) {
      return {
        cjOrderId: null,
        cjOrderStatus: null,
        cjPayUrl: null,
        balancePaid: false,
        error: "CJ order created without orderId",
      };
    }

    if (result.data?.logisticsMiss === true) {
      return {
        cjOrderId,
        cjOrderStatus: "NO_LOGISTICS",
        cjPayUrl: null,
        balancePaid: false,
        error: `CJ: no logistics match for destination (requested "${logisticName}", options: ${freight.all.length ? freight.all.join(", ") : "none"})`,
      };
    }

    const cjShipmentOrderId = result.data?.shipmentOrderId || cjOrderId;

    await cj.addCart({ orderNumber: params.orderId, orderId: cjOrderId });
    await cj.confirmCart({ orderNumber: params.orderId, orderId: cjOrderId });
    console.log("[fulfillment] addCart+confirmCart ok, shipmentOrderId =", cjShipmentOrderId);

    let cjPayUrl: string | null = null;
    let balancePaid = false;

    try {
      const parentOrder = await cj.generateParentOrder({
        orderNumber: params.orderId,
        orderId: cjShipmentOrderId,
      });
      cjPayUrl = (parentOrder.data as { cjPayUrl?: string } | null)?.cjPayUrl || null;
      console.log("[fulfillment] generateParentOrder ->", JSON.stringify(parentOrder.data ?? parentOrder));
    } catch (e) {
      console.log("[fulfillment] generateParentOrder failed:", e instanceof Error ? e.message : e);
    }

    try {
      const payResult = await cj.payBalance({ shipmentOrderId: cjShipmentOrderId });
      balancePaid = payResult.result !== false;
      if (!balancePaid) {
        return {
          cjOrderId,
          cjOrderStatus,
          cjPayUrl,
          balancePaid: false,
          error: payResult.message || "CJ balance payment failed",
        };
      }
    } catch (payError) {
      return {
        cjOrderId,
        cjOrderStatus,
        cjPayUrl,
        balancePaid: false,
        error: payError instanceof Error ? payError.message : "CJ balance payment failed",
      };
    }

    return { cjOrderId, cjOrderStatus, cjPayUrl, balancePaid };
  } catch (error) {
    return {
      cjOrderId: null,
      cjOrderStatus: null,
      cjPayUrl: null,
      balancePaid: false,
      error: error instanceof Error ? error.message : "CJ fulfillment failed",
    };
  }
}
