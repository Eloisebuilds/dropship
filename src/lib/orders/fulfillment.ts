import { getCJClient } from "@/lib/cj/client";

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
export async function fulfillWithCJ(params: FulfillmentParams): Promise<FulfillmentResult> {
  const cj = getCJClient();
  if (!cj) {
    return { cjOrderId: null, cjOrderStatus: null, cjPayUrl: null, balancePaid: false };
  }

  try {
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
      logisticName: "CJPacket Ordinary",
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

    if (!cjOrderId) {
      return {
        cjOrderId: null,
        cjOrderStatus: null,
        cjPayUrl: null,
        balancePaid: false,
        error: "CJ order created without orderId",
      };
    }

    const cjShipmentOrderId = result.data?.shipmentOrderId || cjOrderId;

    await cj.addCart({ orderNumber: params.orderId, orderId: cjOrderId });
    await cj.confirmCart({ orderNumber: params.orderId, orderId: cjOrderId });

    let cjPayUrl: string | null = null;
    let balancePaid = false;

    try {
      const parentOrder = await cj.generateParentOrder({
        orderNumber: params.orderId,
        orderId: cjShipmentOrderId,
      });
      cjPayUrl = (parentOrder.data as { cjPayUrl?: string } | null)?.cjPayUrl || null;
    } catch {
      // Parent order generation is best-effort; balance payment still applies.
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
