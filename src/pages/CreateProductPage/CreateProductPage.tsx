import React, { useEffect, useState } from "react";
import "./CreateProductPage.scss";
import { createMultipleProducts, createProduct, getProductForeignKeys } from "../../services/api";
import { ProductForm, ProductForeignKeys, Producer } from '../../types/product-form';
import { useModalMessage } from "../../context/ModalMessageContext";
import { useLocation } from 'react-router-dom';

const CreateProductPage: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const barcodeFromScanner = searchParams.get("scannerBarcode");

    const [formData, setFormData] = useState<ProductForm>({
        product_type: "",
        producer: "",
        name: '',
        buy_price: 0,
        sell_price: 0,
        amount: 0,
        drop_sell_price: 0,
        barcode: ""
    });

    const [productForeignKeys, setProductForeignKeys] = useState<ProductForeignKeys>();
    const [filteredProducers, setFilteredProducers] = useState<Producer[]>([]);
    const { showModal } = useModalMessage();
    const [selectedForm, setSelectedForm] = useState("form-one");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProductForeignKeys = await getProductForeignKeys();
                setProductForeignKeys(fetchedProductForeignKeys);

                if (barcodeFromScanner) {
                    setFormData((prevData) => ({
                        ...prevData,
                        barcode: barcodeFromScanner
                    }));
                }

            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        fetchData();
    }, [barcodeFromScanner, showModal]);

    useEffect(() => {
        if (formData.product_type) {
            filterProducers(formData.product_type)
        }
    }, [formData.product_type]);

    useEffect(() => {
        const formOne = document.getElementById("form-one");
        const formMany = document.getElementById("form-many");
        if (formOne && formMany) {
            if (selectedForm === "form-one") {
                formOne.style.display = "block";
                formMany.style.display = "none";
            } else {
                formOne.style.display = "none";
                formMany.style.display = "block";
            }
        }
    }, [selectedForm]);


    const filterProducers = (type: string) => {
        if (productForeignKeys) {
            const filtered = productForeignKeys.producers.filter((producer) =>
                producer.producer_type__value.toLowerCase() === type.toLowerCase()
            );
            setFilteredProducers(filtered);
        }
    };


    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = e.target.value;

        setFormData((prevData) => ({
            ...prevData,
            product_type: selectedType,
            producer: "",
            volume: "",
            strength: "",
            puffs_amount: "",
            resistance: "",
            pod_model: "",
            liquidModel: "",
            cartridgeModel: "",
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await createProduct(formData);
            showModal(response.message);

            setFormData({
                product_type: "",
                producer: "",
                name: '',
                buy_price: 0,
                sell_price: 0,
                amount: 0,
                drop_sell_price: 0,
                barcode: ""
            });
            setFilteredProducers([]);

        } catch (error) {
            showModal(`creating product: ${error}`);
        }
    };

    const handleCreateMultiple = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const productsInput = form.elements.namedItem("products") as HTMLTextAreaElement;
        const productsText = productsInput.value;

        productsInput.value = "";
        try {
            const response = await createMultipleProducts(productsText);
            showModal(response.message);
        } catch (error) {
            showModal(`Помилка: ${error}`);
        }
    }

    const handleChangeForm = (e: any, formName: string) => {
        if (e.target.classList.contains("active")) {
            return;
        }

        const switchers = document.querySelectorAll(".switcher-value");
        if (switchers) {
            switchers.forEach((switcher) => {
                switcher.classList.toggle("active");
            });
        }

        setSelectedForm(formName);
    }

    const renderFormReadyLiquid = () => {
        return (
            <>
                <div className="form-group">
                    <label>Об'єм:</label>
                    <select name="volume" value={formData.volume} onChange={handleChange} required>
                        <option value="" disabled>--------</option>
                        {productForeignKeys?.volumes.map(volume => (
                            <option key={volume.id} value={volume.value}>{volume.value}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Міцність:</label>
                    <select name="strength" value={formData.strength} onChange={handleChange} required>
                        <option value="" disabled>--------</option>
                        {productForeignKeys?.strengths.map(strength => (
                            <option key={strength.id} value={strength.value}>{strength.value}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Смак рідини:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
            </>
        );
    }

    const renderFormMixLiquid = () => {
        return (
            <>
                <div className="form-group">
                    <label>Модель рідини:</label>
                    <select name="liquidModel" value={formData.liquidModel} onChange={handleChange} required>
                        <option value="" disabled>--------</option>
                        {productForeignKeys?.liquid_models.map(liquid_model => (
                            <option key={liquid_model.id} value={liquid_model.value}>{liquid_model.value}</option>
                        ))}
                    </select>
                </div>
                {renderFormReadyLiquid()}
            </>
        );
    }

    const renderFormDisposable = () => {
        return (
            <>
            <div className="form-group">
                <label>Кількість тяг:</label>
                <select name="puffs_amount" value={formData.puffs_amount} onChange={handleChange} required>
                    <option value="" disabled>--------</option>
                    {productForeignKeys?.puffs_amounts.map(puffs_amount => (
                        <option key={puffs_amount.id} value={puffs_amount.value}>{puffs_amount.value}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Смак одноразки:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            </>
        );
    }

    const renderFormCartridge = () => {
        return (
            <>
            <div className="form-group">
            <label>Модель картриджу:</label>
                <select name="cartridgeModel" value={formData.cartridgeModel} onChange={handleChange} required>
                    <option value="" disabled>--------</option>
                    {productForeignKeys?.cartridge_models.map(cartridge_model => (
                        <option key={cartridge_model.id} value={cartridge_model.value}>{cartridge_model.value}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Опір:</label>
                <select name="resistance" value={formData.resistance} onChange={handleChange} required>
                    <option value="" disabled>--------</option>
                    {productForeignKeys?.resistances.map(resistance => (
                        <option key={resistance.id} value={resistance.value}>{resistance.value}</option>
                    ))}
                </select>
            </div>
            </>
        );
    }

    const renderFormPod = () => {
        return (
            <>
            <div className="form-group">
                <label>Модель поду:</label>
                <select name="pod_model" value={formData.pod_model} onChange={handleChange}>
                    <option value="">--------</option>
                    {productForeignKeys?.pod_models.map(model => (
                        <option key={model.id} value={model.value}>{model.value}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label>Колір поду: </label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
        </>
        );
    }



    return (
        <>
        <div className="switcher">
            <div className="switcher-value active" onClick={(e) => handleChangeForm(e, "form-one")}>Створити один продукт</div>
            <div className="switcher-value" onClick={(e) => handleChangeForm(e, "form-many")}>Створити декілька продуктів</div>
        </div>
        
        <div className="form-container" id="form-one">
            <br />
            <h2>Створити один продукт</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Тип продукту:</label>
                    <select name="product_type" value={formData.product_type} onChange={handleTypeChange} required>
                        <option value="" disabled>--------</option>
                        {productForeignKeys?.product_types.map(type => (
                            <option key={type.id} value={type.value}>{type.value}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Виробник:</label>
                    <select name="producer" value={formData.producer} onChange={handleChange} required>
                        <option value="" disabled>--------</option>
                        {filteredProducers.map(producer => (
                            <option key={producer.id} value={producer.value}>{producer.value}</option>
                        ))}
                    </select>
                </div>

                {formData.product_type === 'Готова рідина' && (
                    <>
                        {renderFormReadyLiquid()}
                    </>
                )}

                {formData.product_type === 'Самозаміс' && (
                    <>
                        {renderFormMixLiquid()}
                    </>
                )}

                {formData.product_type === 'Одноразка' && (
                    <>
                        {renderFormDisposable()}
                    </>
                )}

                {formData.product_type === 'Картридж' && (
                    <>
                        {renderFormCartridge()}
                    </>
                )}

                {formData.product_type === 'Под' && (
                    <>
                        {renderFormPod()}
                    </>
                )}

                
                <div className="form-group">
                    <label>Закупочна ціна:</label>
                    <input type="tel" name="buy_price" value={formData.buy_price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Продажна ціна:</label>
                    <input type="tel" name="sell_price" value={formData.sell_price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Дроп ціна:</label>
                    <input type="tel" name="drop_sell_price" value={formData.drop_sell_price} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>К-сть:</label>
                    <input type="tel" name="amount" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Штрих-код:</label>
                    <input type="tel" name="barcode" value={formData.barcode} onChange={handleChange} />
                </div>
                <button type="submit" className="submit-btn">Create Product</button>
            </form>
        </div>
        
        <div className="form-container" id="form-many">
            <br />
            <h1 className="form-title">Створити декілька продуктів</h1>
            <br />
            <strong className="form-instructions form-instructions-main">Формат для кожної групи продуктів: <br />(Вказувати через кому, замість стрілки)</strong>
            <br />
            <strong className="form-instructions">Готова рідина</strong> &gt; виробник &gt; мл &gt; смак &gt; закупочна ціна &gt; продажна ціна &gt; дроп ціна &gt; к-сть<br />
            <strong className="form-instructions">Самозаміс</strong> &gt; виробник &gt; модель &gt; мл &gt; смак &gt; закупочна ціна &gt; продажна ціна &gt; дроп ціна &gt; к-сть<br />
            <strong className="form-instructions">Под</strong> &gt; виробник &gt; модель &gt; кольори &gt; закупочна ціна &gt; продажна ціна &gt; дроп ціна &gt; к-сть<br />
            <strong className="form-instructions">Картридж</strong> &gt; виробник &gt; модель &gt; опір &gt; закупочна ціна &gt; продажна ціна &gt; дроп ціна &gt; к-сть<br />
            <strong className="form-instructions">Одноразка</strong> &gt; виробник &gt; кількість тяг &gt; смак &gt; закупочна ціна &gt; продажна ціна &gt; дроп ціна &gt; к-сть
            <br /><br />

            <form className="multiple-products-form" onSubmit={handleCreateMultiple}>
                <textarea 
                    name="products" 
                    placeholder="Продукти" 
                    className="products-textarea"
                    >
                </textarea>
                <button type="submit" className="submit-btn">Створити продукти</button>
            </form>
        </div>
        </>
    );
}

export default CreateProductPage;