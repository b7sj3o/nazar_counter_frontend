import React, { useState, useEffect } from "react";
import { addSale, getProductTree, updateProduct, deleteProduct } from "../../services/api";
import { useModalMessage } from "../../context/ModalMessageContext";
import {
    ProductTree,
    ProductInfo,
} from "../../types/product";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import "./HomePage.scss";
import { ResponseModel } from "../../types/product-form";

const HomePage: React.FC = () => {
    const [productTree, setProductTree] = useState<ProductTree>({});
    const [path, setPath] = useState<string[]>([]);
    const [productsTriggered, setProductsTriggered] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductInfo | null>(null);
    const [editingProductRow, setEditingProductRow] = useState<ProductInfo[] | null>(null);
    const { showModal } = useModalMessage();

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
    }, [productsTriggered]);

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

    const renderObject = (currentLevel: any) => {
        return Object.entries(currentLevel).map(([key, value]) => {
            return (
                <div
                    key={key}
                    className="button-item"
                    onClick={() => handleItemClick(key)}
                >
                    <h3>{key}</h3>
                    {Array.isArray(value) ? (
                        <div className="product-item-edit" onClick={(e) => {e.stopPropagation(); setEditingProductRow(value)}}>
                            <img src="images/dots.png" alt="" />
                        </div>
                    ) : null}
                </div>
            );
        });
    };

    const renderProductList = (currentLevel: ProductInfo[]) => {
        return (
            <div className="product-item-container">
                {currentLevel.map((product: ProductInfo) => (
                    <div key={product.id} className={`product-item ${product.amount === 0 ? "product-item__empty" : ""}`}>
                        <div className="product-item-edit" onClick={() => setEditingProduct(product)}>
                            <img src="images/dots.png" alt="" />
                        </div>
                        <div className="product-item-details">
                            <h4>{product.resistance ? product.resistance : product.name}</h4>
                            <p>Кількість: {product.amount}</p>
                            <p>Ціна: {product.sell_price}</p>
                            <br />
                            <button onClick={() => handleAddSale(product)} disabled={product.amount === 0}>
                                Добавити продажу
                            </button>
                        </div>
                        
                    </div>
                ))}
            </div>
        );
    };

    const renderEditProduct = () => {
        if (editingProduct) {
            return (
                <div className="product-edit-container" onClick={closeEditProduct}>
                    <div className="product-edit" onClick={(e) => e.stopPropagation()}>
                        <h3>Редагувати продукт</h3>
                        <img src="images/close.png" alt="Close" className="product-edit-close" onClick={closeEditProduct} />
                        <form onSubmit={submitEditProduct}>
                            <div className="form-group">
                                <label htmlFor="amount">Кількість</label>
                                <input type="text" name="amount" placeholder="Кількість" defaultValue={editingProduct.amount} onChange={handleEditProductChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="buy_price">Ціна закупівлі</label>
                                <input type="text" name="buy_price" placeholder="Ціна закупівлі" defaultValue={editingProduct.buy_price} onChange={handleEditProductChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="sell_price">Ціна продажу</label>
                                <input type="text" name="sell_price" placeholder="Ціна продажу" defaultValue={editingProduct.sell_price} onChange={handleEditProductChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="drop_sell_price">Ціна продажу дроп</label>
                                <input type="text" name="drop_sell_price" placeholder="Ціна продажу дроп" defaultValue={editingProduct.drop_sell_price} onChange={handleEditProductChange}/>
                            </div>
                            <button type="submit" className="product-edit-submit">Редагувати продукт</button>
                            <button type="button" className="product-edit-delete" onClick={submitDeleteProduct}>Видалити продукт</button>
                        </form>
                    </div>
                </div>
            );
        } else if (editingProductRow) {
            return (
                <div className="product-edit-container" onClick={closeEditProduct}>
                    <div className="product-edit" onClick={(e) => e.stopPropagation()}>
                        <h3>Редагувати лінійку продуктів</h3>
                        <img src="images/close.png" alt="Close" className="product-edit-close" onClick={closeEditProduct} />
                        <form onSubmit={submitEditProduct}>
                            <div className="form-group">
                                <label htmlFor="buy_price">Ціна закупівлі</label>
                                <input type="text" name="buy_price" placeholder="Ціна закупівлі" defaultValue={editingProductRow[0].buy_price} onChange={handleEditProductChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="sell_price">Ціна продажу</label>
                                <input type="text" name="sell_price" placeholder="Ціна продажу" defaultValue={editingProductRow[0].sell_price} onChange={handleEditProductChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="drop_sell_price">Ціна продажу дроп</label>
                                <input type="text" name="drop_sell_price" placeholder="Ціна продажу дроп" defaultValue={editingProductRow[0].drop_sell_price} onChange={handleEditProductChange}/>
                            </div>
                            <button type="submit" className="product-edit-submit">Редагувати продукт</button>
                        </form>
                    </div>
                </div>
            );
        }
    }

    const closeEditProduct = () => {
        setEditingProduct(null);
        setEditingProductRow(null);
    }

    const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingProduct) {
            setEditingProduct({
                ...editingProduct,
                [e.target.name]: e.target.value
            });
        }
    };

    const submitEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            const response = await updateProduct(editingProduct);
            showModal(response.message);
        } else if (editingProductRow) {
            // const response = await updateProduct();
            // showModal(response.message);
            showModal("Я ще це не доробив!")

        }

        setProductsTriggered(!productsTriggered);
        setEditingProduct(null);
        setEditingProductRow(null);
        setPath([]);
    }

    const submitDeleteProduct = async () => {
        const response = await deleteProduct(editingProduct!.id);
        setProductsTriggered(!productsTriggered);
        setEditingProduct(null);
        setEditingProductRow(null);
        setPath([]);
        showModal(response.message);
    }

    const handleAddSale = async (product: ProductInfo) => {
        try {
            if (product.id) {
                const response = await addSale(product.id, 1);
                showModal(response.message);
                setProductsTriggered(!productsTriggered);
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
                <div className="buttons-container">{renderCurrentLevel()}</div>
            </div>
            {renderEditProduct()}
        </div>
        
    );
};

export default HomePage;