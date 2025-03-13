import React, { useState, useEffect } from 'react';
import { deleteSale, getSales, getSalesAnalytics } from '../../services/api';
import { ProductSale } from '../../types/product';
import "./AnalyticsPage.scss";
import { useModalMessage } from '../../context/ModalMessageContext';
import { ProductEditModal } from '../../components/ProductEditModal/ProductEditMdal';
import { SalesAnalytics } from '../../types/analytics';


const AnalyticsPage: React.FC = () => {
    const [sales, setSales] = useState<ProductSale[]>([]);
    const [analytics, setAnalytics] = useState<SalesAnalytics>();
    const [period, setPeriod] = useState<"day" | "week" | "month">("day");
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

    useEffect(() => {
        const fetchAnalytics = async () => {
            const analyticsData = await getSalesAnalytics(period);
            setAnalytics(analyticsData);
        };
        fetchAnalytics();
    }, [period]);

    const handleToggleShowAll = () => {
        setShowAllSales(!showAllSales);
    };

    const handleRemoveSale = async (id: number) => {
        try {
            const response = await deleteSale(id);
            if (response.success) {
                const saleBlock = document.querySelector(`#sale_${id}`) as HTMLElement;
                saleBlock.style.animation = 'fadeOout 0.5s forwards';
                setTimeout(() => {
                    setSales(sales.filter(sale => sale.id !== id));
                }, 500);
            } 
            showModal(response.message);
        } catch (e){
            console.log(e)
            showModal('Трапилась помилка. Спробуйте ще раз.');
        }

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
                    <p>Заробіток: {saleDetails.sell_price - saleDetails.buy_price} грн</p>
                    <p>Дата: {new Date(saleDetails.date).toLocaleDateString('uk-UA')}, {new Date(saleDetails.date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </ProductEditModal>
        )
    }

    const groupSalesByDate = (sales: ProductSale[]) => {
        return sales.reduce((acc, sale) => {
            const date = new Date(sale.date).toLocaleDateString('uk-UA');
            if (!acc[date]) {
                acc[date] = { sales: [], totalEarnings: 0, totalRevenue: 0 };
            }
            acc[date].sales.push(sale);
            acc[date].totalEarnings += (sale.sell_price - sale.buy_price);
            acc[date].totalRevenue += sale.sell_price;
            return acc;
        }, {} as Record<string, { sales: ProductSale[], totalEarnings: number, totalRevenue: number }>);
    };

    const groupedSales = groupSalesByDate(sales);

    return (
        <div className="sales-analytics-container">
            <div className="analytics-summary">
                <h2 className="analytics-summary-title">Загальна Аналітика</h2>
                <p className="analytics-summary-item">Загальний оборот: {analytics?.totalRevenue} грн</p>
                <p className="analytics-summary-item">Загальний прибуток: {analytics?.totalEarnings} грн</p>
                <p className="analytics-summary-item">Загальна кількість проданих одиниць: {analytics?.totalUnitsSold}</p>
                <p className="analytics-summary-item">Середній чек: {analytics?.averageCheck} грн</p>
            </div>
            
            <h2>Аналітика Продажів</h2>
        
            <div>
                {Object.entries(groupedSales).map(([date, salesOnDate]) => (
                    <div key={date} className="sales-list">
                        <h3 className='sales-list-date'>{date}</h3>
                        <h4 className='sales-list-earnings'>Оборот: {salesOnDate.totalRevenue} грн</h4>
                        <h4 className='sales-list-earnings'>Заробіток: {salesOnDate.totalEarnings} грн</h4>
                        {(showAllSales ? salesOnDate.sales : salesOnDate.sales.slice(0, 10)).map((sale) => (
                            <div key={sale.id} className="sale-item" id={`sale_${sale.id}`} onClick={() => setSaleDetails(sale)}>
                                <h4>{sale.product_name} - {sale.producer_name} - {sale.product_type} <span className='red'>{sale.amount}</span></h4>
                                <button className="sale-item-delete" onClick={(e) => {e.stopPropagation(); e.currentTarget.disabled = true; handleRemoveSale(sale.id)}}>Видалити</button>
                            </div>
                        ))}
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
