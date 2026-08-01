import { getCJClient } from "@/lib/cj/client";

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
      shippingCountry: params.shipping.country || "United States",
      shippingProvince: params.shipping.province || "N/A",
      shippingCity: params.shipping.city || "N/A",
      shippingAddress: params.shipping.address || "N/A",
      shippingCustomerName: params.customer.name,
      shippingPhone: params.shipping.phone || params.customer.phone || "",
      shippingZip: params.shipping.zip || "",
      email: params.customer.email,
      logisticName: "CJPacket Ordinary",
      fromCountryCode: "CN",
      isSandbox: process.env.NODE_ENV === "development" ? 1 : 0,
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

    await cj.addCart({ orderNumber: params.orderId, orderId: cjOrderId });
    await cj.confirmCart({ orderNumber: params.orderId, orderId: cjOrderId });

    let cjPayUrl: string | null = null;
    let balancePaid = false;

    try {
      const parentOrder = await cj.generateParentOrder({
        orderNumber: params.orderId,
        orderId: cjOrderId,
      });
      cjPayUrl = (parentOrder.data as { cjPayUrl?: string } | null)?.cjPayUrl || null;
    } catch {
      // Parent order generation is best-effort in balance-payment mode.
    }

    if (cjPayUrl) {
      try {
        const payResult = await cj.payBalance({ shipmentOrderId: cjOrderId });
        balancePaid = payResult.result !== false;
        if (!balancePaid) {
          throw new Error(payResult.message || "CJ balance payment failed");
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
