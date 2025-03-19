// src/components/Layout.tsx
import React, { useState, useEffect } from "react";
import "./ProductSearch.scss";
import { Product } from "../../types/product";
import { useSelector } from "react-redux";
import { addSale, getProducts } from "../../services/api";
import { useModalMessage } from "../../context/ModalMessageContext";

interface ProductSearchProps {
    showAddSaleButtons?: boolean;
    onProductAdd?: (product: Product, amount: number) => void;
    getProductAmount?: (productId: number) => number;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ showAddSaleButtons = true, onProductAdd, getProductAmount }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [inputQuery, setInputQuery] = useState<string>("");
    const { showModal } = useModalMessage();
    const settings = useSelector((state: any) => state.settings);
    const [isSearchVisible, setSearchVisibility] = useState(settings.isSearchVisible)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProducts = await getProducts();
                setProducts(fetchedProducts);
                setFilteredProducts(fetchedProducts);
                handleInputChange(inputQuery);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (query: string) => {
        if (query.length > 0 && !isSearchVisible) {
            setSearchVisibility(true);
        } else if (query.length === 0 && isSearchVisible) {
            setSearchVisibility(false);
        }

        setInputQuery(query)
        const queries = query.toLowerCase().trim().split(/\s+/);

        const filtered = products.filter((product) => {
            try {
                return queries.every((word) =>
                    // Must-have fields
                    product.product_type_name.toLowerCase().includes(word) ||
                    product.producer_name.toLowerCase().includes(word) ||
    
                    // Non-must-have fields
                    (product.name || "").toLowerCase().includes(word) ||
                    (product.volume_amount || "").toLowerCase().includes(word) ||
                    (product.strength_amount || "").toLowerCase().includes(word) ||
                    (product.cartridge_model_name || "").toLowerCase().includes(word) ||
                    (product.liquid_model_name || "").toLowerCase().includes(word) ||
                    (product.puffs_amount_value || "").toLowerCase().includes(word) ||
                    (product.resistance_amount || "").toLowerCase().includes(word) ||
                    (product.pod_model_name || "").toLowerCase().includes(word)
                )
            } catch {
            }
        }
            
            
        );
        setFilteredProducts(filtered);
    };

    const handleShowSearch = () => {
        setSearchVisibility(!isSearchVisible);
    }

    // TODO: Move it to utils or hooks
    const handleAddSale = async (productId: number, amount: number = 1, price: number) => {
        try {
            if (productId) {
                const response = await addSale(productId, amount, price);
                showModal(response.message);
                if (response.success) {
                    setFilteredProducts(filteredProducts.map((product) => {
                        if (product.id === productId) {
                            return {
                                ...product,
                                amount: product.amount - amount
                            };
                        }
                        return product;
                    }
                    ));
                }
            }
        } catch (error) {
            showModal("Помилка при додаванні продажу. Спробуйте ще раз.");
        }
    };

    const getProductName = (product: Product) => {
        const type = product.product_type_name.toLowerCase();
        
        if (type === "под") {
            return `${product.producer_name} ${product.pod_model_name} - ${product.name}`;
        }
    
        if (type === "картридж") {
            return `${product.producer_name} ${product.cartridge_model_name} - ${product.resistance_amount}`;
        }
    
        return `${product.producer_name} - ${product.name}`;
    }

    const renderProducts = () => {
        return (inputQuery.length >= 1 ? filteredProducts : products).map((product) => (
            <li key={product.id} className="product-search__item">
                <h3 className="product-search__name">
                    {getProductName(product)}
                </h3>
                <p className="product-search__detail">К-сть: {product.amount}</p>
                <p className="product-search__detail">Тип товару: {product.product_type_name}</p>
                {product.volume_amount && (
                    <p className="product-search__detail">Об'єм: {product.volume_amount}</p>
                )}

                <div className="product-search__btns">
                    <button
                        onClick={() => handleAddSale(product.id, 1, product.sell_price)}
                        className="product-search__add-button">
                        Продаж
                    </button>
                    <button
                        onClick={() => handleAddSale(product.id, 1, product.drop_sell_price)}
                        className="product-search__add-button">
                        Продаж (дроп)
                    </button>
                </div>
            </li>
        ));
    };

    const renderProductsList = () => {
        return (inputQuery.length >= 1 ? filteredProducts : products).map((product) => (
            <li key={product.id} className="product-search__item">
                <h3 className="product-search__name">
                    {getProductName(product)}
                </h3>
                <p className="product-search__detail">К-сть: {product.amount}</p>
                <p className="product-search__detail">Закупна ціна: {product.buy_price}</p>
                <p className="product-search__detail">Тип товару: {product.product_type_name}</p>
                {product.volume_amount && (
                    <p className="product-search__detail">Об'єм: {product.volume_amount}</p>
                )}

                {onProductAdd && (
                    <div className="product-search__change">
                        <button
                        onClick={() => onProductAdd(product, -1)}
                        className="product-search__add-button">
                        -
                        </button>
                        <p>{getProductAmount && getProductAmount(product.id)}</p>
                        <button
                            onClick={() => onProductAdd(product, 1)}
                            className="product-search__add-button">
                            +
                        </button>    
                    </div>
                )}
            </li>
        ));
    };

    return (
        <div className="product-search">
            <div className="product-search__header">
                <input
                    type="text"
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Пошук продуктів"
                    className="product-search__input"
                />
                <button className="product-search__button" type="submit" onClick={handleShowSearch}>
                    {isSearchVisible ? (
                        <img src="/images/eye.png" alt="Сховати форму" title="Сховати форму" />
                    ) : (
                        <img src="/images/no-eye.png" alt="Показати форму" title="Показати форму" />
                    )}
                </button>
            </div>

            <ul className="product-search__results">
                {isSearchVisible ? (
                    inputQuery.length >= 1 && filteredProducts.length === 0 ? (
                        <h1>Not found</h1>
                    ) : (
                        showAddSaleButtons ? (
                            renderProducts()
                        ) : (
                            renderProductsList()
                        )
                    )
                ) : null}
            </ul>
        </div>
    );
};

export default ProductSearch;
