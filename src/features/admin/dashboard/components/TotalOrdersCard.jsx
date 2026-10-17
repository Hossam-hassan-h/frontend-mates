import { ShoppingBag, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card.jsx';

export function TotalOrdersCard({ totalOrders = 0, growth = '+0%' }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground">عدد الطلبات</p>
            <h3 className="text-xl font-extrabold text-foreground sm:text-2xl">
              {totalOrders.toLocaleString('ar-EG')} طلب
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{growth} مقارنة بالفترة السابقة</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default TotalOrdersCard;
