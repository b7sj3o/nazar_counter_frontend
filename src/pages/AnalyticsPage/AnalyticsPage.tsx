import React, { useState, useEffect } from 'react';
import { deleteSale, getSales, getSalesAnalytics } from '../../services/api';
import { ProductSale } from '../../types/product';
import "./AnalyticsPage.scss";
import { useModalMessage } from '../../context/ModalMessageContext';
import { ProductEditModal } from '../../components/ProductEditModal/ProductEditMdal';
import { SalesAnalytics } from '../../types/analytics';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts";

const AnalyticsPage: React.FC = () => {
    const [sales, setSales] = useState<ProductSale[]>([]);
    const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
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
    };

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
        );
    };

    return (
        <div className="sales-analytics-container">
            <div className="analytics-summary">
                <h2 className="analytics-summary-title">Загальна Аналітика</h2>
                <div className="periods">
                    <button className={`period ${period === "day" ? "active" : ""}`} onClick={() => setPeriod("day")}>День</button>
                    <button className={`period ${period === "week" ? "active" : ""}`} onClick={() => setPeriod("week")}>Тиждень</button>
                    <button className={`period ${period === "month" ? "active" : ""}`} onClick={() => setPeriod("month")}>Місяць</button>
                </div>
                <p className="analytics-summary-item">Загальний оборот: {analytics?.totalRevenue} грн</p>
                <p className="analytics-summary-item">Загальний прибуток: {analytics?.totalEarnings} грн</p>
                <p className="analytics-summary-item">Загальна кількість проданих одиниць: {analytics?.totalUnitsSold}</p>
                <p className="analytics-summary-item">Середній чек: {analytics?.averageCheck} грн</p>
            </div>

            {/* Графік динаміки продажів */}
            <h3>Динаміка продажів</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.salesByDate || []}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="revenue" stroke="#4CAF50" name="Оборот" />
                        <Line type="monotone" dataKey="earnings" stroke="#FF9800" name="Прибуток" />
                        <Line type="monotone" dataKey="unitsSold" stroke="#2196F3" name="Продані одиниці" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Графік топ продажів */}
            <h3>Топ продажів</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.topSales || []}>
                        <XAxis dataKey="productName" />
                        <YAxis />
                        <Tooltip />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Bar dataKey="totalSold" fill="#8884d8" name="Продано" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h2>Аналітика Продажів</h2>

            <div>
                {sales.map((sale) => (
                    <div key={sale.id} className="sale-item" id={`sale_${sale.id}`} onClick={() => setSaleDetails(sale)}>
                        <h4>{sale.product_name} - {sale.producer_name} - {sale.product_type} <span className='red'>{sale.amount}</span></h4>
                        <button className="sale-item-delete" onClick={(e) => {e.stopPropagation(); e.currentTarget.disabled = true; handleRemoveSale(sale.id)}}>Видалити</button>
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
