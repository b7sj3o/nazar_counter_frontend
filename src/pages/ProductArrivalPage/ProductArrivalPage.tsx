import React, { useState } from "react";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import { Product } from "../../types/product";
import "./ProductArrivalPage.scss";
import { useModalMessage } from "../../context/ModalMessageContext";
import { addArrival } from "../../services/api";

const ProductArrivalPage: React.FC = () => {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [amount, setQuantity] = useState<number>(1);
    const [price, setPrice] = useState<number>(0);
    const [arrivalProducts, setArrivalProducts] = useState<Array<{ product: Product; amount: number; price: number }>>([]);
    const { showModal } = useModalMessage();

    const handleAddProduct = (product: Product) => {
        if (!selectedProducts.find((p) => p.id === product.id)) {
            setSelectedProducts((prev) => [...prev, product]);
        }
    };

    const handleUpdateQuantity = (q: string) => {
        setQuantity(parseInt(q))
    }

    const handleUpdatePrice = (p: string) => {
        setPrice(parseInt(p))
    }

    const handleRemoveProduct = (id: number) => {
        setSelectedProducts((prev) => prev.filter((item) => item.id !== id));
    };

    const handleSubmitSelectedProducts = () => {
        const newProducts = selectedProducts.filter((product) => 
            !arrivalProducts.some((arrProduct) => arrProduct.product.id === product.id)
        );

        if (newProducts.length) {
            const newArrivalProducts = newProducts.map((product) => ({
                product,
                amount,
                price
            }));
            
            setArrivalProducts([
                ...arrivalProducts,
                ...newArrivalProducts
            ]);

            setSelectedProducts([]);
        } else {
            showModal("Такий товар вже є в таблиці!")
        }

    };

    // TODO: change to product id 
    const handleSubmitArrival = async () => {
        const productsToSend = arrivalProducts.map(({ product, amount, price }) => ({
            id: product.id,
            amount,
            price,
        }));

        try {
            const response = await addArrival(productsToSend);

            if (response.success) {
                alert("Arrival successfully added!");
                setSelectedProducts([]);
            } else {
                alert("Error adding arrival.");
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
                    showAddButton={true}
                    onProductAdd={handleAddProduct} 
                />
    
                {/* Selected Products Block */}
                <br />
                <div className="product-arrival__selected">
                    <h2>Вибрані товари</h2>
                    {selectedProducts.length > 0 && (
                        selectedProducts.map((product) => (
                            <div key={product.id} className="product-arrival__selected__item">
                                <h3>{product.producer_name} - <span>{product.name}</span></h3>
                                <div className="product-arrival__selected__details">
                                    <button onClick={() => handleRemoveProduct(product.id)}>Видалити</button>
                                </div>
                            </div>
                        ))
                    )}
                    <label>
                        Кількість:
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => handleUpdateQuantity(e.target.value)}
                        />
                    </label>
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
                        <button className="product-arrival__selected__submit" onClick={handleSubmitSelectedProducts}>
                            Добавити
                        </button>
                    )}
                </div>
    
            </div>
    
            {/* Arrival Products Block */}
            <div className="product-arrival__arrival">
                <h2>Прихід товарів</h2>
                <table className="product-arrival__table">
                    <thead>
                        <tr>
                            <th>Назва товару</th>
                            <th>Кількість</th>
                            <th>Закупна ціна</th>
                        </tr>
                    </thead>
                    <tbody>
                        {arrivalProducts.map(({ product, amount, price }) => (
                            <tr key={product.id} className="product-arrival__item">
                                <td>{product.producer_name} - {product.name}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        value={amount}
                                        onChange={(e) => {
                                            const updatedArrival = arrivalProducts.map((arrProduct) => 
                                                arrProduct.product.id === product.id
                                                    ? { ...arrProduct, amount: +e.target.value }
                                                    : arrProduct
                                            );
                                            setArrivalProducts(updatedArrival);
                                        }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={price}
                                        onChange={(e) => {
                                            const updatedArrival = arrivalProducts.map((arrProduct) => 
                                                arrProduct.product.id === product.id
                                                    ? { ...arrProduct, price: +e.target.value }
                                                    : arrProduct
                                            );
                                            setArrivalProducts(updatedArrival);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Submit Button */}
                {arrivalProducts.length > 0 && (
                    <button className="product-arrival__submit" onClick={handleSubmitArrival}>
                        Додати прихід
                    </button>
                )}
            </div>
        </>
    );
    
};

export default ProductArrivalPage;
