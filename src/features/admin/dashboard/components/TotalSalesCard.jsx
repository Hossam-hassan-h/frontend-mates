import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card.jsx';

export function TotalSalesCard({ totalSales = 0, growth = '+0%' }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground">Total Sales</p>
            <h3 className="text-xl font-extrabold text-foreground sm:text-2xl">
              {totalSales.toLocaleString('ar-EG')} EGP
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{growth} vs previous period</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default TotalSalesCard;
