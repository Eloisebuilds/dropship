import {
  CJTokenResponse,
  CJProductListResponse,
  CJProductDetail,
  CJVariant,
  CJInventoryItem,
  CJOrderCreateResponse,
} from "./types";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";

export class CJClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private openId: number | null = null;
  private tokenExpiresAt: Date | null = null;
  private refreshExpiresAt: Date | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    isAuth: boolean = false
  ): Promise<T> {
    await this.ensureToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (!isAuth && this.accessToken) {
      headers["CJ-Access-Token"] = this.accessToken;
    }

    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (data.code && data.code !== 200) {
      // If token expired, try refreshing once
      if (data.code === 1600001 && !isAuth) {
        await this.refreshAccessToken();
        headers["CJ-Access-Token"] = this.accessToken!;
        const retryRes = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        const retryData = await retryRes.json();
        if (retryData.code && retryData.code !== 200) {
          throw new Error(`CJ API error (retry): ${retryData.message} (code: ${retryData.code})`);
        }
        return retryData as T;
      }
      throw new Error(`CJ API error: ${data.message} (code: ${data.code})`);
    }

    return data as T;
  }

  async ensureToken(): Promise<void> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return;
    }
    if (this.refreshToken && this.refreshExpiresAt && this.refreshExpiresAt > new Date()) {
      await this.refreshAccessToken();
      return;
    }
    await this.getAccessToken();
  }

  async getAccessToken(): Promise<void> {
    const data = await this.request<CJTokenResponse>(
      "POST",
      "/authentication/getAccessToken",
      { apiKey: this.apiKey },
      true
    );
    this.accessToken = data.data.accessToken;
    this.refreshToken = data.data.refreshToken;
    this.openId = data.data.openId;
    this.tokenExpiresAt = new Date(data.data.accessTokenExpiryDate);
    this.refreshExpiresAt = new Date(data.data.refreshTokenExpiryDate);
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) throw new Error("No refresh token available");
    const data = await this.request<CJTokenResponse>(
      "POST",
      "/authentication/refreshAccessToken",
      { refreshToken: this.refreshToken },
      true
    );
    this.accessToken = data.data.accessToken;
    this.refreshToken = data.data.refreshToken;
    this.tokenExpiresAt = new Date(data.data.accessTokenExpiryDate);
    this.refreshExpiresAt = new Date(data.data.refreshTokenExpiryDate);
  }

  async searchProducts(keyword: string, page: number = 1, size: number = 20) {
    const params = new URLSearchParams({
      keyWord: keyword,
      page: page.toString(),
      size: size.toString(),
      features: "enable_description,enable_category",
    });
    return this.request<CJProductListResponse>("GET", `/product/listV2?${params}`);
  }

  async getProductDetails(pid: string): Promise<CJProductDetail> {
    const params = new URLSearchParams({ pid });
    const res = await this.request<{ code: number; result: boolean; data: CJProductDetail }>("GET", `/product/getDetails?${params}`);
    return res.data;
  }

  async getVariants(pid: string): Promise<CJVariant[]> {
    const params = new URLSearchParams({ pid });
    const res = await this.request<{ code: number; result: boolean; data: CJVariant[] }>("GET", `/product/variant/list?${params}`);
    return res.data || [];
  }

  async getInventory(pid: string): Promise<Record<string, CJInventoryItem[]>> {
    const params = new URLSearchParams({ pid });
    const res = await this.request<{ code: number; result: boolean; data: Record<string, CJInventoryItem[]> }>("GET", `/product/stock/getInventoryByPid?${params}`);
    return res.data || {};
  }

  async createOrder(params: {
    orderNumber: string;
    shippingCountryCode: string;
    shippingCountry: string;
    shippingProvince: string;
    shippingCity: string;
    shippingAddress: string;
    shippingCustomerName: string;
    shippingPhone: string;
    shippingZip?: string;
    email?: string;
    logisticName: string;
    fromCountryCode: string;
    products: { vid: string; quantity: number; storeLineItemId?: string }[];
    platform?: string;
    isSandbox?: number;
  }) {
    return this.request<CJOrderCreateResponse>("POST", "/shopping/order/createOrderV3", {
      ...params,
      orderFlow: 1,
      payType: 2,
      shopLogisticsType: 2,
      isSandbox: params.isSandbox ?? 0,
      platform: params.platform || "Api",
    });
  }

  async addCart(orderData: { orderNumber: string; orderId: string }) {
    return this.request<{ code: number; result: boolean; data: Record<string, unknown> }>("POST", "/shopping/order/addCart", orderData);
  }

  async confirmCart(orderData: { orderNumber: string; orderId: string }) {
    return this.request<{ code: number; result: boolean; data: Record<string, unknown> }>("POST", "/shopping/order/addCartConfirm", orderData);
  }

  async generateParentOrder(orderData: { orderNumber: string; orderId: string }) {
    return this.request<{ code: number; result: boolean; data: Record<string, unknown> }>("POST", "/shopping/order/saveGenerateParentOrder", orderData);
  }

  async payBalance(orderData: { orderId: string; payType: number }) {
    return this.request<{ code: number; result: boolean; data: Record<string, unknown> }>("POST", "/pay/payBalanceV2", {
      ...orderData,
      payPassword: "",
      payType: orderData.payType || 1,
    });
  }

  async getOrderDetail(orderId: string) {
    const params = new URLSearchParams({ orderId });
    return this.request<{ code: number; result: boolean; data: Record<string, unknown> }>("GET", `/shopping/order/getOrderDetail?${params}`);
  }

  getOpenId(): number | null {
    return this.openId;
  }

  getAccessTokenValue(): string | null {
    return this.accessToken;
  }

  getRefreshTokenValue(): string | null {
    return this.refreshToken;
  }

  getTokenExpiry(): Date | null {
    return this.tokenExpiresAt;
  }

  getRefreshExpiry(): Date | null {
    return this.refreshExpiresAt;
  }
}

let clientInstance: CJClient | null = null;

export function getCJClient(): CJClient | null {
  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) return null;
  if (!clientInstance) {
    clientInstance = new CJClient(apiKey);
  }
  return clientInstance;
}
