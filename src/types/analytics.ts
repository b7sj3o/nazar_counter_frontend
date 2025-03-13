export interface SalesAnalytics {
    totalRevenue: number; // Загальний оборот
    totalEarnings: number; // Загальний прибуток
    totalUnitsSold: number; // Загальна кількість проданих одиниць
    averageCheck: number; // Середній чек
    salesByDate: {
        date: string;
        revenue: number;
        earnings: number;
        unitsSold: number;
    }[]; // Продажі по датах

    topSales: {
        productName: string;
        totalSold: number;
        totalRevenue: number;
        totalEarnings: number;
    }[]; // Топ продажів
}
