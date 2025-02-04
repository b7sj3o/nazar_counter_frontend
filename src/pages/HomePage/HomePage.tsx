// src/pages/HomePage.tsx
import React, { useState, useEffect } from "react";
import { addSale, getProductTree } from "../../services/api";
import { useModalMessage } from "../../context/ModalMessageContext";
import { useNavigate } from 'react-router-dom';
import {
    ProductTree,
    ProductInfo,
    ProductTypeGroup,
    VolumeGroupedProducts,
    DisposableProduct,
    CartridgeProduct,
    PodProduct,
} from "../../types/product";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import "./HomePage.scss";

const HomePage: React.FC = () => {
    const [productTree, setProductTree] = useState<ProductTree>({});
    const [path, setPath] = useState<string[]>([]);
    const [saleTriggered, setSaleTriggered] = useState(false);
    const { showModal } = useModalMessage(); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProducts = await getProductTree();
                setProductTree(fetchedProducts);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        fetchData();
    }, [saleTriggered]);

    const getCurrentLevel = () => {
        let currentLevel: any = productTree;
        for (const key of path) {
            if (currentLevel && typeof currentLevel === "object") {
                currentLevel = currentLevel[key];
            }
        }
        return currentLevel;
    };

    const handleItemClick = (key: string) => {
        setPath([...path, key]);
    };

    const handleGoBack = () => {
        setPath(path.slice(0, -1));
    };

    const handleGoHome = () => {
        setPath([])
    }

    const renderObject = (
        currentLevel:
            | ProductTree
            | ProductTypeGroup
            | VolumeGroupedProducts
            | DisposableProduct
            | CartridgeProduct
            | PodProduct
    ) => {
        console.log(currentLevel);
        return Object.entries(currentLevel).map(([key, value]) => (
            <div
                key={key}
                className="button-item"
                onClick={() => handleItemClick(key)}
            >
                <h3>{key}</h3>
            </div>
        ));
    };

    const renderProductList = (currentLevel: ProductInfo[]) => {
        return (
            <>
                <div className="product-item-container">
                    {currentLevel.map((product: ProductInfo) => (
                        <div key={product.id} className={`product-item ${product.amount === 0 ? "product-item__empty" : ""}`}>
                            <h4>{product.name}</h4>
                            <p>Кількість: {product.amount}</p>
                            <p>Ціна: {product.sell_price}</p>
                            <br />
                            <button onClick={() => handleAddSale(product)} disabled={product.amount === 0}>
                                Добавити продажу
                            </button>
                        </div>
                    ))}
                </div>
                <button className="create-product-button" onClick={() => handleCreateProduct(currentLevel[0].barcode)}>
                    Створити продукт
                </button>
            </>
        );
    };
    

    const handleCreateProduct = (productBarcode: string) => {
        if (productBarcode) {
            navigate(`/create-product?productBarcode=${productBarcode}`);
        } else {
            navigate("/create-product");
        }
    };


    const handleAddSale = async (product: ProductInfo) => {
        try {
            if (product.id) {
                const response = await addSale(product.id, 1);
                showModal(response.message);
                setSaleTriggered(!saleTriggered);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const renderCurrentLevel = () => {
        if (Array.isArray(currentLevel)) {
            return renderProductList(currentLevel);
        } else {
            return renderObject(currentLevel);
        }
    };

    const moveToLevel = (key: string) => {
        const index = path.indexOf(key);
        setPath(path.slice(0, index + 1));
    };

    const test = () => {
        console.log("TEST");
        console.log(currentLevel)
        console.log(productTree)
        showModal("TEST");
    }

    const currentLevel = getCurrentLevel();

    return (
        <div className="container">
        <ProductSearch />
        <div className="products-container">
            <h2 className="title">Товар</h2>
            
            {path.length > 0 && (
                <>
                <div className="path-container">
                    <div className="path">
                        {/* "home" doesn't exist so indexOf will return -1 end it will clear path fully :)) */}
                        <h4 onClick={() => moveToLevel("home")}>Головна</h4>
                        {path.map((key) => (
                            <h4 key={key} onClick={() => moveToLevel(key)}>{key}</h4>
                        ))}
                    </div>
                </div>
                <div className="product-btns">
                    <button className="back-button" onClick={handleGoBack}>
                        Назад
                    </button>
                    <button className="back-button" onClick={handleGoHome}>
                        Головна
                    </button>
                </div>
                </>
            )}
            <button onClick={test}>TEST</button>
            <div className="buttons-container">{renderCurrentLevel()}</div>
        </div>
        </div>
    );
};

export default HomePage;