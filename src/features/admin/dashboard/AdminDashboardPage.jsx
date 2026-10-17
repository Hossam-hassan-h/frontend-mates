import { RefreshCw, Package, List, Tag, AlertTriangle, AlertOctagon, Calendar, Coins, ShoppingBag, User } from 'lucide-react';
import { useDashboard } from './useDashboard.js';
import { DateRangeFilter } from './components/DateRangeFilter.jsx';
import { TotalSalesCard } from './components/TotalSalesCard.jsx';
import { TotalOrdersCard } from './components/TotalOrdersCard.jsx';
import { TotalCustomersCard } from './components/TotalCustomersCard.jsx';
import { SalesOverviewChart } from './components/SalesOverviewChart.jsx';
import { OrderStatusChart } from './components/OrderStatusChart.jsx';
import { TopSellingProductsCard } from './components/TopSellingProductsCard.jsx';
import { Loader } from '@/components/feedback/Loader.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { Card } from '@/components/ui/card.jsx';
import { getText } from '@/utils/getText.js';

export function AdminDashboardPage() {
  const { stats, dateRange, setDateRange, isLoading, isFetching, isError, refetch } = useDashboard();

  if (isLoading) {
    return <Loader text="جاري تحميل إحصائيات لوحة التحكم..." />;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message="تعذر تحميل بيانات الإحصائيات، يرجى المحاولة مرة أخرى." />;
  }

  return (
    <div className="min-w-0 space-y-5 animate-fade-in text-start sm:space-y-6 lg:space-y-8" dir="rtl">
      {/* Header & Filter Controls */}
      <div className="flex min-w-0 flex-col justify-between gap-4 border-b border-border/40 pb-4 lg:flex-row lg:items-center lg:pb-5">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">لوحة التحكم والأداء</h1>
          <p className="text-xs text-muted-foreground mt-1">
            متابعة المبيعات، الطلبات، والعملاء في متجر قاسم بالوقت الفعلي
          </p>
        </div>

        <div className="flex min-w-0 w-full items-center gap-2 lg:w-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="shrink-0 rounded-xl border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-secondary"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <DateRangeFilter
            selectedRange={dateRange}
            onSelectRange={setDateRange}
            isFetching={isFetching}
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <TotalSalesCard totalSales={stats?.totalSales} growth={stats?.salesGrowth} />
        <TotalOrdersCard totalOrders={stats?.totalOrders} growth={stats?.ordersGrowth} />
        <TotalCustomersCard totalCustomers={stats?.totalCustomers} growth={stats?.customersGrowth} />
      </div>

      {/* Revenue Sub-Ranges */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <Card className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-bold">مبيعات اليوم</span>
            <span className="text-sm font-black text-foreground">{stats?.revenueToday?.toFixed(2)} egp</span>
          </div>
        </Card>
        <Card className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-bold">مبيعات هذا الأسبوع</span>
            <span className="text-sm font-black text-foreground">{stats?.revenueThisWeek?.toFixed(2)} egp</span>
          </div>
        </Card>
        <Card className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-bold">مبيعات هذا الشهر</span>
            <span className="text-sm font-black text-foreground">{stats?.revenueThisMonth?.toFixed(2)} egp</span>
          </div>
        </Card>
        <Card className="flex min-w-0 items-center gap-3 p-3 sm:p-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground block font-bold">إجمالي قطع المبيعات</span>
            <span className="text-sm font-black text-foreground">{stats?.totalSoldItems} قطعة</span>
          </div>
        </Card>
      </div>

      {/* Inventory & Catalog Statistics */}
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:gap-4">
        <Card className="space-y-1 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-extrabold">إجمالي المنتجات</span>
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-black text-foreground">{stats?.totalProducts}</p>
        </Card>
        <Card className="space-y-1 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-extrabold">التصنيفات</span>
            <List className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-black text-foreground">{stats?.totalCategories}</p>
        </Card>
        <Card className="space-y-1 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-extrabold">منتجات الخصم</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-foreground">{stats?.totalDiscountedProducts}</p>
        </Card>
        <Card className="space-y-1 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-extrabold">نفد المخزون</span>
            <AlertOctagon className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-lg font-black text-red-600">{stats?.productsOutOfStock}</p>
        </Card>
        <Card className="space-y-1 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-extrabold">مخزون منخفض</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-amber-600">{stats?.lowStockProducts}</p>
        </Card>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 lg:gap-6">
        <SalesOverviewChart data={stats?.salesOverview} />
        <OrderStatusChart data={stats?.orderStatusDistribution} />
      </div>

      {/* Top Products Section */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:gap-6">
        <TopSellingProductsCard products={stats?.topSellingProducts} />
      </div>

      {/* Recent Activities Section */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3 lg:gap-6">
        {/* Latest Orders */}
        <Card className="space-y-4 p-4 sm:p-5">
          <h3 className="font-extrabold text-sm border-b border-border/40 pb-2">آخر الطلبات المستلمة</h3>
          <div className="divide-y divide-border/40">
            {stats?.latestOrders?.length > 0 ? (
              stats.latestOrders.map((order) => (
                <div key={order._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{order.customerName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{order.phone}</p>
                  </div>
                  <div className="text-end">
                    <span className="font-black text-foreground block">{order.finalTotal?.toFixed(2)} EGP</span>
                    <span className="text-[10px] text-primary font-bold">{order.orderStatus}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">لا توجد طلبات حديثة</p>
            )}
          </div>
        </Card>

        {/* Latest Customers */}
        <Card className="space-y-4 p-4 sm:p-5">
          <h3 className="font-extrabold text-sm border-b border-border/40 pb-2">أحدث العملاء المسجلين</h3>
          <div className="divide-y divide-border/40">
            {stats?.latestCustomers?.length > 0 ? (
              stats.latestCustomers.map((user) => (
                <div key={user._id} className="flex min-w-0 items-center gap-3 py-2.5 text-xs">
                  <div className="p-1.5 rounded-full bg-secondary text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{user.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">لا يوجد عملاء جدد</p>
            )}
          </div>
        </Card>

        {/* Latest Products */}
        <Card className="space-y-4 p-4 sm:p-5">
          <h3 className="font-extrabold text-sm border-b border-border/40 pb-2">آخر الأصناف المضافة</h3>
          <div className="divide-y divide-border/40">
            {stats?.latestProducts?.length > 0 ? (
              stats.latestProducts.map((prod) => (
                <div key={prod._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src={prod.imageCover || prod.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-foreground">{getText(prod.title || prod.name)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{prod.unit || 'كيلو'}</p>
                    </div>
                  </div>
                  <span className="font-black text-foreground">{prod.price?.toFixed(2)} EGP</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">لا توجد أصناف مضافة حديثاً</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
