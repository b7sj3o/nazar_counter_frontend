import React, { useState, useEffect } from "react";
import { addSale, getProductTree, updateProduct, deleteProduct, updateProducts } from "../../services/api";
import { useModalMessage } from "../../context/ModalMessageContext";
import { ProductTree, ProductInfo } from "../../types/product";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import ModalUpdate, { UPDATES } from "../../components/Modal/ModalUpdate/ModalUpdate";
import "./HomePage.scss";
import { Link } from "react-router-dom";
import { ProductEditModal } from "../../components/ProductEditModal/ProductEditMdal";


interface EditingProductState {
    product?: ProductInfo | ProductInfo[];
    type?: "single" | "row" | "sale";
    buy_price?: number;
    sell_price?: number;
    drop_sell_price?: number;
}

const HomePage: React.FC = () => {
    const [productTree, setProductTree] = useState<ProductTree>({});
    const [path, setPath] = useState<string[]>([]);
    const [productsTriggered, setProductsTriggered] = useState(false);
    const [editingProduct, setEditingProduct] = useState<EditingProductState>({});
    const { showModal } = useModalMessage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProducts = await getProductTree();
                setProductTree(fetchedProducts);
            } catch (error) {
                showModal("Помилка завантаження даних. Скоріш за все, сервер не відповідає. Спробуйте пізніше.");
            }
        };
        fetchData();
    }, [productsTriggered]);

    // ======= HANDLERS =======

    const handleItemClick = (key: string) => setPath([...path, key]);
    const handleGoBack = () => setPath(path.slice(0, -1));
    const handleGoHome = () => setPath([]);

    // TODO: Move it to utils or hooks
    const handleAddSale = async (productId: number, amount: number = 1, price: number) => {
        try {
            if (productId) {
                const response = await addSale(productId, amount, price);
                showModal(response.message);
                setProductsTriggered(!productsTriggered);
            }
        } catch (error) {
            showModal("Помилка при додаванні продажу. Спробуйте ще раз.");
        }
    };

    const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingProduct.product && !Array.isArray(editingProduct.product)) {
            setEditingProduct({
                ...editingProduct,
                product: {
                    ...editingProduct.product,
                    [e.target.name]: parseInt(e.target.value)
                }
            });
        } else if (editingProduct.product && Array.isArray(editingProduct.product)) {
            setEditingProduct({
                ...editingProduct,
                [e.target.name]: parseInt(e.target.value)

            });
        }
    };

    // ======= HELPERS =======
    
    const moveToLevel = (key: string) => {
        const index = path.indexOf(key);
        setPath(path.slice(0, index + 1));
    };

    const closeEditProduct = () => {
        setEditingProduct({});
        document.body.style.overflow = 'auto';
    };

    const getCurrentLevel = () => {
        let currentLevel: any = productTree;
        for (const key of path) {
            if (currentLevel && typeof currentLevel === "object") {
                currentLevel = currentLevel[key];
            }
        }
        return currentLevel;
    };

    // ======= SUBMIT =======

    const submitEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct.product) {
            if (editingProduct.type === "row" && Array.isArray(editingProduct.product)) {
                const defaultBuyPrice = editingProduct.product[0].buy_price;
                const defaultSellPrice = editingProduct.product[0].sell_price;
                const defaultDropSellPrice = editingProduct.product[0].drop_sell_price;

                const ids = editingProduct.product.map((product: ProductInfo) => product.id);
                const data = {
                    ids,
                    buy_price: editingProduct.buy_price || defaultBuyPrice,
                    sell_price: editingProduct.sell_price || defaultSellPrice,
                    drop_sell_price: editingProduct.drop_sell_price || defaultDropSellPrice
                };
                const response = await updateProducts(data);
                showModal(response.message);
                closeEditProduct();
                setProductsTriggered(!productsTriggered);

            } else if (editingProduct.type === "single" && !Array.isArray(editingProduct.product)) {
                const response = await updateProduct(editingProduct.product);

                showModal(response.message);
                closeEditProduct();
                setProductsTriggered(!productsTriggered);
            }
        }
    };

    const submitDeleteProduct = async () => {
        if (editingProduct.product && !Array.isArray(editingProduct.product)) {
            const response = await deleteProduct(editingProduct.product!.id);

            showModal(response.message);
            setProductsTriggered(!productsTriggered);
            closeEditProduct();
        }
    };

    // ======= RENDER =======

    const renderCurrentLevel = () => {
        if (Array.isArray(currentLevel)) {
            return renderProductList(currentLevel);
        } else {
            return renderObject(currentLevel);
        }
    };

    const renderObject = (currentLevel: any) => {
        if (!currentLevel) return null;
        
        return Object.entries(currentLevel).map(([key, value]) => {
            return (
                <div
                    key={key}
                    className="button-item"
                    onClick={() => handleItemClick(key)}
                >
                    <h3>{key}</h3>
                    {Array.isArray(value) ? (
                        <div className="product-item-edit" onClick={(e) => {
                            e.stopPropagation(); setEditingProduct({product: value, type: "row"})
                        }}>
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
                        <div className="product-item-edit" onClick={() => setEditingProduct({product, type: "single"})}>
                            <img src="images/dots.png" alt="" />
                        </div>
                        <div className="product-item-details">
                            <h4>{product.resistance ? product.resistance : product.name}</h4>
                            <p>Кількість: {product.amount}</p>
                            <p>Ціна: {product.sell_price}</p>
                            <br />
                            <button onClick={() => handleAddSale(product.id, 1, product.sell_price)} disabled={product.amount === 0}>
                                Продати одну
                            </button>
                            <button onClick={() => handleAddSale(product.id, 1, product.drop_sell_price)} disabled={product.amount === 0}>
                                Продати одну дроп
                            </button>
                            <button onClick={() => setEditingProduct({product: {...product, amount: 1}, type: "sale"})} disabled={product.amount === 0}>
                                Кастом продажа
                            </button>
                        </div>
                        
                    </div>
                ))}
            </div>
        );
    };

    const renderSaleEdit = (product: ProductInfo) => (
        <ProductEditModal 
            title="Добавити продажу" 
            onClose={closeEditProduct} 
        >
            <form onSubmit={(e) => { e.preventDefault(); handleAddSale(product.id, product.amount, product.sell_price); closeEditProduct(); }}>
                <div className="form-group">
                    <label htmlFor="amount">Кількість</label>
                    <input type="text" name="amount" placeholder="Кількість" defaultValue={1} onChange={handleEditProductChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="sell_price">Ціна продажу</label>
                    <input type="text" name="sell_price" placeholder="Ціна продажу" defaultValue={product.sell_price} onChange={handleEditProductChange} />
                </div>
                <button type="submit" className="product-edit-submit">Добавити продажу</button>
            </form>
        </ProductEditModal>
    );
    
    const renderSingleEdit = (product: ProductInfo) => (
        <ProductEditModal 
            title="Редагувати продукт" 
            onClose={closeEditProduct} 
        >
            <form onSubmit={submitEditProduct}>
                <div className="form-group">
                    <label htmlFor="amount">Кількість</label>
                    <input type="text" name="amount" placeholder="Кількість" defaultValue={product.amount} onChange={handleEditProductChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="buy_price">Ціна закупівлі</label>
                    <input type="text" name="buy_price" placeholder="Ціна закупівлі" defaultValue={product.buy_price} onChange={handleEditProductChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="sell_price">Ціна продажу</label>
                    <input type="text" name="sell_price" placeholder="Ціна продажу" defaultValue={product.sell_price} onChange={handleEditProductChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="drop_sell_price">Ціна продажу дроп</label>
                    <input type="text" name="drop_sell_price" placeholder="Ціна продажу дроп" defaultValue={product.drop_sell_price} onChange={handleEditProductChange} />
                </div>
                <button type="submit" className="product-edit-submit">Редагувати продукт</button>
                <button type="button" className="product-edit-delete" onClick={submitDeleteProduct}>Видалити продукт</button>
            </form>
        </ProductEditModal>
    );
    
    const renderRowEdit = (product: ProductInfo) => (
        <ProductEditModal 
            title="Редагувати лінійку продуктів" 
            onClose={closeEditProduct} 
        >
            <form onSubmit={submitEditProduct}>
                <div className="form-group">
                    <label htmlFor="buy_price">Ціна закупівлі</label>
                    <input type="text" name="buy_price" placeholder="Ціна закупівлі" defaultValue={product.buy_price} onChange={handleEditProductChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="sell_price">Ціна продажу</label>
                    <input type="text" name="sell_price" placeholder="Ціна продажу" defaultValue={product.sell_price} onChange={handleEditProductChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="drop_sell_price">Ціна продажу дроп</label>
                    <input type="text" name="drop_sell_price" placeholder="Ціна продажу дроп" defaultValue={product.drop_sell_price} onChange={handleEditProductChange} />
                </div>
                <button type="submit" className="product-edit-submit">Редагувати продукт</button>
            </form>
        </ProductEditModal>
    );
    
    const renderEditProduct = () => {
        if (!editingProduct.product) return null;
        
        document.body.style.overflow = 'hidden';

        if (!Array.isArray(editingProduct.product)) {
            if (editingProduct.type === "sale") return renderSaleEdit(editingProduct.product);
            if (editingProduct.type === "single") return renderSingleEdit(editingProduct.product);
        } else {
            return renderRowEdit(editingProduct.product[0]);
        }
    
        return null;
    };

    const currentLevel = getCurrentLevel();

    return (
        <div className="container">
            <ProductSearch />
            <ModalUpdate />
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
            {editingProduct && renderEditProduct()}

            <small className="version"><Link to="/versions">v.{UPDATES[UPDATES.length-1].version}</Link></small>
        </div>
        
    );
};

export default HomePage;
