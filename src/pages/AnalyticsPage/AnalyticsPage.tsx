import React, { useState, useEffect } from 'react';
import { getSales } from '../../services/api';
import { ProductSale, SalesSummary } from '../../types/product';
import "./AnalyticsPage.scss";
import { useModalMessage } from '../../context/ModalMessageContext';
import { ProductEditModal } from '../../components/ProductEditModal/ProductEditMdal';

const AnalyticsPage: React.FC = () => {
    const [sales, setSales] = useState<ProductSale[]>([]);
    const [salesSummary, setSalesSummary] = useState<SalesSummary>({ total_revenue: 0, total_amount: 0, total_earning: 0 });
    const [showAllSales, setShowAllSales] = useState(false);
    const { showModal } = useModalMessage();
    const [saleDetails, setSaleDetails] = useState<ProductSale | null>(null);

    useEffect(() => {
        const fetchSales = async () => {
            const filteredSales = await getSales();
            setSales(filteredSales);
        };


        fetchSales();
    }, []);


    const handleToggleShowAll = () => {
        setShowAllSales(!showAllSales);
    };

    const handleRemoveSale = (id: number) => {
        showModal("Ця функція ще не реалізована");
    }

    const renderSaleDetails = () => {

        if (!saleDetails) return null;

        return (
            <ProductEditModal
                title='Деталі продажу'
                onClose={() => setSaleDetails(null)}
                >
                <div className="sale-details">
                    <p>Назва: {saleDetails.product_name}</p>
                    <p>Виробник: {saleDetails.producer_name}</p>
                    <p>Тип продукту: {saleDetails.product_type}</p>
                    <p>Кількість проданого: {saleDetails.amount}</p>
                    <p>Ціна продажу: {saleDetails.sell_price} грн</p>
                    <p>Дата: {new Date(saleDetails.date).toLocaleDateString('uk-UA')}</p>
                </div>
            </ProductEditModal>
            
        )
    }

    return (
        <div className="sales-analytics-container">
            <h2>Аналітика Продажів</h2>
        
            <div className="sales-list">
                {(showAllSales ? sales : sales.slice(0, 10)).map((sale) => (
                    <div key={sale.id} className="sale-item" onClick={() => setSaleDetails(sale)}>
                        <h4>{sale.product_name} - {sale.producer_name} - {sale.product_type}</h4>
                        <button className="sale-item-delete" onClick={(e) => {e.stopPropagation(); handleRemoveSale(sale.id)}}>Видалити</button>
                        {/* <p>Кількість проданого: {sale.amount}</p>
                        <p>Ціна продажу: {sale.sell_price} грн</p>
                        <p>Дата: {new Date(sale.date).toLocaleDateString('uk-UA')}</p> */}
                    </div>
                ))}
            </div>
            {sales.length > 10 && (
                <button onClick={handleToggleShowAll} className='show-all-button'>
                    {showAllSales ? 'Показати менше' : 'Показати всі'}
                </button>
            )}

            {saleDetails && renderSaleDetails()}
        </div>
    );
};

export default AnalyticsPage;
