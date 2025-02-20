export interface Product {
    id: number;
    product_type_name: string;
    producer_name: string;
    volume_amount?: string;
    strength_amount?: string;
    liquid_model_name?: string;
    cartridge_model_name?: string;
    puffs_amount_value?: string;
    resistance_amount?: string;
    pod_model_name?: string;
    name: string;
    buy_price: number;
    sell_price: number;
    drop_sell_price: number;
    amount: number;
    barcode: string;
}


export interface ArrivalProducts {
    id: number;
    amount: number;
    price: number;
}

export interface OptProducts extends ArrivalProducts {};

export interface ProductInfo {
    id: number;
    name: string;
    barcode: string;
    amount: number;
    buy_price: number;
    sell_price: number;
    drop_sell_price: number;
    resistance?: string; // Тому що у картриджів немає name
}

export interface EditingProductData {
    id: number;
    amount?: number;
    buy_price?: number;
    sell_price?: number;
    drop_sell_price?: number;
}

export interface EditingProductsData {
    ids: number[];
    buy_price: number;
    sell_price: number;
    drop_sell_price: number;
}

export interface DisposableProduct {
    [puffsAmount: string]: ProductInfo[];
}

export interface CartridgeProduct {
    [resistance: string]: ProductInfo[];
}

export interface CartridgeModelGroupedProducts {
    [cartridge_model: string]: CartridgeProduct[];
}

export interface PodProduct {
    [podModel: string]: ProductInfo[];
}

export interface ReadyLiquidProduct {
    [volume: string]: StrengthGroupedProducts[];
}

export interface VolumeGroupedProducts {
    [volume: string]: StrengthGroupedProducts[];
}

export interface StrengthGroupedProducts {
    [strength: string]: ProductInfo[];
}

export interface MixLiquidProduct {
    [liquid_model: string]: VolumeGroupedProducts[];
}

export interface ProductTypeGroup {
    [producer: string]: ReadyLiquidProduct | MixLiquidProduct | DisposableProduct | CartridgeProduct | PodProduct;
}

export interface ProductTree {
    [productType: string]: ProductTypeGroup;
}

export interface ProductSearchProps {
    showAddButton?: boolean;
    onProductAdd?: (product: Product) => void;
}

// types/api.ts
export interface ProductSale {
    id: number;
    product_name: string;
    product_type: string;
    producer_name: string;
    sell_price: number;
    amount: number;
    date: string;
}

export interface SalesSummary {
    total_revenue: number;
    total_amount: number;
    total_earning: number;
}
