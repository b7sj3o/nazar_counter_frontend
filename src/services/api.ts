import axios from "axios";
import {
    ProductTree,
    Product,
    ArrivalProducts,
    OptProducts,
    ProductSale,
    EditingProductData,
    EditingProductsData,
} from "../types/product";
import { ProductForeignKeys, ProductForm, ResponseModel } from "../types/product-form";
import { MessageResponse } from "../types/layout";
import { SalesAnalytics } from "../types/analytics";

const api = axios.create({
    baseURL:
        process.env.REACT_APP_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

type Result<T, E> = { success: true; data: T } | { success: false; error: E };

// ------- GET -------

// Get all the products
export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get("products/");
    return response.data;
};

// Get all not required fields that exist in product, so we can do select-option in the most effective way
export const getProductForeignKeys = async (): Promise<ProductForeignKeys> => {
    const response = await api.get<ProductForeignKeys>("product-foreign-keys/");
    return response.data;
};

// filter products by [name, producer, puffs amount, ...]
export const filterProducts = async (query: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`filter-products?query=${query}`);
    return response.data;
};

export const getProductTree = async (): Promise<ProductTree> => {
    const response = await api.get<ProductTree>("product-tree/");
    return response.data;
};

export const getSales = async (period: string = ""): Promise<ProductSale[]> => {
    const response = await api.get<ProductSale[]>(`get-sales?period=${period}`);
    return response.data;
};

// check if there is a product by given barcode
export const findProductByBarcode = async (barcode: string): Promise<Result<Product, string>> => {
    try {
        const response = await api.get<Product>(`check-barcode?barcode=${barcode}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        const message = error.response?.data?.message || "An error occurred.";
        return { success: false, error: message };
    }
};

export const getSalesAnalytics = async (period: "day" | "week" | "month" = "month"): Promise<SalesAnalytics> => {
    const response = await api.get<SalesAnalytics>(`sales-analytics?period=${period}`);
    return response.data;
};

// ------- CREATE -------

// Create product
export const createProduct = async (product: ProductForm): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>("create-product/", product);
    return response.data;
};

// add arrival
export const addArrival = async (products: ArrivalProducts[], buy_price: number): Promise<{ success: boolean; data: string }> => {
    try {
        const response = await api.post("add-arrival/", { products, buy_price });
        return { success: true, data: response.data };
    } catch (error: any) {
        const message = error.response?.data?.message || "An error occurred.";
        return { success: false, data: message };
    }
};

// add opt
export const addOpt = async (
    products: OptProducts[]
): Promise<{ success: boolean; data: string }> => {
    try {
        const response = await api.post("add-opt/", { products });
        return { success: true, data: response.data };
    } catch (error: any) {
        const message = error.response?.data?.message || "An error occurred.";
        return { success: false, data: message };
    }
};

export const addSale = async (
    product_id: number,
    amount: number,
    price: number
): Promise<MessageResponse> => {
    try {
        const response = await api.post<MessageResponse>("add-sale/", {
            product_id,
            amount,
            price,
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return { message: error.response.data.message };
        }
        return { message: "An error occurred." };
    }
};

export const createMultipleProducts = async (products: string): Promise<ResponseModel> => {
    try {
        const response = await api.post("create-multiple-products/", products);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return { message: error.response.data.message };
        }
        return { message: "Трапилась помилка.", success: false };
    }
};

// ------- UPDATE -------

export const updateProduct = async (product: EditingProductData): Promise<ResponseModel> => {
    try {
        const response = await api.put(`update-product/${product.id}/`, product);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return { message: error.response.data.message };
        }
        return { message: "Трапилась помилка.", success: false };
    }
};

export const updateProducts = async (data: EditingProductsData): Promise<ResponseModel> => {
    try {
        const response = await api.put(`update-products/`, data);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return { message: error.response.data.message };
        }
        return { message: "Трапилась помилка.", success: false };
    }
};

// ------- DELETE -------

export const deleteProduct = async (product_id: number): Promise<ResponseModel> => {
    try {
        const response = await api.delete(`delete-product/${product_id}/`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return { message: error.response.data.message };
        }
        return { message: "Трапилась помилка.", success: false };
    }
};

export const deleteSale = async (sale_id: number): Promise<ResponseModel> => {
    try {
        const response = await api.delete(`delete-sale/${sale_id}/`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            return { message: error.response.data.message };
        }
        return { message: "Трапилась помилка.", success: false };
    }
};
