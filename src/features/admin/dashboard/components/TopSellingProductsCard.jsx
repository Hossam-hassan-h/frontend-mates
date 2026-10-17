import { Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { getText } from '@/utils/getText.js';

export function TopSellingProductsCard({ products = [] }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 p-4 sm:p-6 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-extrabold sm:text-base">
          <Award className="w-5 h-5 text-amber-500" />
          المنتجات الأكثر مبيعاً
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border/60">
        {products.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">لا توجد بيانات متاحة</div>
        ) : (
          products.map((item, index) => (
            <div key={item.id || index} className="flex min-w-0 items-center justify-between gap-3 p-3 transition-colors hover:bg-secondary/30 sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-foreground">{getText(item.name)}</h4>
                  <p className="truncate text-xs text-muted-foreground">{getText(item.category)}</p>
                </div>
              </div>
              <div className="shrink-0 text-end">
                <Badge variant="secondary" className="font-bold">
                  {item.quantitySold} مباع
                </Badge>
                <p className="text-xs font-semibold text-muted-foreground mt-1">
                  {item.revenue} EGP
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default TopSellingProductsCard;
