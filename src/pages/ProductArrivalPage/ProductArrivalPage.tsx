import React, { useState } from "react";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import { Product } from "../../types/product";
import "./ProductArrivalPage.scss";
import { useModalMessage } from "../../context/ModalMessageContext";
import { addArrival } from "../../services/api";

const ProductArrivalPage: React.FC = () => {
    const [selectedProducts, setSelectedProducts] = useState<Array<{ product: Product; amount: number }>>([]);
    const [price, setPrice] = useState<number>(0);
    const { showModal } = useModalMessage();

    const handleChangeProductAmount = (product: Product, amount: number) => {
        setSelectedProducts((prev) => {
            const existingProduct = prev.find((p) => p.product.id === product.id);
            if (existingProduct) {
                return prev.map((p) =>
                    p.product.id === product.id ? { ...p, amount: Math.max(1, p.amount + amount) } : p
                );
            } else {
                return [...prev, { product, amount: 1 }];
            }
        });
    };

    const getProductAmount = (productId: number) => {
        const product = selectedProducts.find((p) => p.product.id === productId);
        return product ? product.amount : 0;
    };

    const handleUpdatePrice = (p: string) => {
        setPrice(parseInt(p))
    }

    const handleRemoveProduct = (id: number) => {
        setSelectedProducts((prev) => prev.filter((item) => item.product.id !== id));
    };

    // TODO: change to product id 
    const handleSubmitArrival = async () => {
        const productsToSend = selectedProducts.map((item => ({
            id: item.product.id,
            amount: item.amount,
        })))

        try {
            const response = await addArrival(productsToSend, price);

            if (response.success) {
                showModal("Прихід успішно додано");
                setSelectedProducts([]);
            } else {
                showModal("Прихід не вдалося додати");
            }
        } catch (error) {
            console.error("Error submitting arrival:", error);
        }
    };

    return (
        <>
            <h1 className="product-arrival-title">Додавання приходу товарів</h1>
            <div className="product-arrival">
    
                {/* Product Search */}
                <ProductSearch 
                    showAddSaleButtons={false}
                    onProductAdd={handleChangeProductAmount} 
                    getProductAmount={getProductAmount}
                />
    
                {/* Selected Products Block */}
                <br />
                <div className="product-arrival__selected">
                    <h2>Вибрані товари</h2>
                    {selectedProducts.length > 0 && (
                        selectedProducts.map((item) => (
                            <div key={item.product.id} className="product-arrival__selected__item">
                                <h3>{item.product.producer_name} - <span>{item.product.name || item.product.resistance_amount} - {item.amount}</span></h3>
                                <div className="product-arrival__selected__details">
                                    <button onClick={() => handleRemoveProduct(item.product.id)}>Видалити</button>
                                </div>
                            </div>
                        ))
                    )}
                    <label>
                        Закупна ціна:
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={price}
                            onChange={(e) => handleUpdatePrice(e.target.value)}
                        />
                    </label>
                    {/* Add Button for Arrival */}
                    {selectedProducts.length > 0 && (
                        <button className="product-arrival__selected__submit" onClick={handleSubmitArrival}>
                            Добавити
                        </button>
                    )}
                </div>
    
            </div>
    
          
        </>
    );
    
};

export default ProductArrivalPage;
