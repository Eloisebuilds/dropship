export interface CJTokenResponse {
  code: number;
  result: boolean;
  message: string;
  data: {
    openId: number;
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
    createDate: string;
  };
}

export interface CJProductListItem {
  id: string;
  nameEn: string;
  sku: string;
  spu: string;
  bigImage: string;
  sellPrice: string;
  nowPrice: string;
  categoryId: string;
  threeCategoryName: string;
  description: string;
  warehouseInventoryNum: number;
  deliveryCycle: string;
  saleStatus: string;
}

export interface CJProductListResponse {
  code: number;
  result: boolean;
  data: {
    content: {
      productList: CJProductListItem[];
      relatedCategoryList: object[];
      keyWord: string;
    }[];
    pageSize: number;
    pageNumber: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface CJVariant {
  vid: string;
  pid?: string;
  variantName?: string;
  variantNameEn?: string;
  variantSku: string;
  variantImage?: string;
  variantKey?: string;
  variantSellPrice: string;
  variantValue1?: string;
  variantValue2?: string;
  variantValue3?: string;
  variantWeight?: number;
  variantLength?: number;
  variantWidth?: number;
  variantHeight?: number;
  variantVolume?: number;
  createTime?: string;
}

export interface CJProductDetail {
  pid: string;
  productName?: string;
  productNameEn?: string;
  productSku?: string;
  bigImage?: string;
  productImageSet?: string[];
  productWeight?: string;
  sellPrice?: number;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  variants?: CJVariant[];
  productProEnSet?: string[];
  materialNameEnSet?: string[];
  packingWeight?: string;
  listedNum?: number;
  status?: string;
}

export interface CJVariantInventory {
  countryCode: string;
  totalInventory: number;
  cjInventory?: number;
  factoryInventory?: number;
  verifiedWarehouse?: number;
}

export interface CJVariantInventoryEntry {
  vid: string;
  inventory: CJVariantInventory[];
}

export interface CJInventoryByPidData {
  inventories: {
    areaEn: string;
    areaId: number;
    countryCode: string;
    totalInventoryNum: number;
    cjInventoryNum?: number;
    factoryInventoryNum?: number;
  }[];
  variantInventories: CJVariantInventoryEntry[];
}

export interface CJInventoryByPidResponse {
  code: number;
  result: boolean;
  message: string;
  data: CJInventoryByPidData;
}

export interface CJOrderCreateResponse {
  code: number;
  result: boolean;
  data: {
    orderId: string;
    orderNumber: string;
    shipmentOrderId: string;
    productAmount: string;
    postageAmount: string;
    orderAmount: string;
    cjPayUrl: string;
    orderStatus: string;
    productInfoList: {
      storeLineItemId: string;
      lineItemId: string;
      variantId: string;
      quantity: number;
    }[];
  };
}

export interface CJWebhookPayload {
  messageId: string;
  type: "PRODUCT" | "VARIANT" | "STOCK" | "ORDER" | "LOGISTIC" | "MAKEUP" | "PRIVATE_ORDER" | "ORDERSPLIT" | "SOURCINGCREATE";
  messageType: "INSERT" | "UPDATE" | "DELETE";
  params: Record<string, unknown>;
}

export interface SyncedProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  gallery: string[];
  category: string;
  badge?: string;
  cjProductId: string;
  cjVariantId: string;
  cjSku: string;
  inventory: number;
  cjSellPrice: number;
  marginPercent: number;
  lastSyncedAt: string;
}
