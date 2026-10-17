import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, Users, ArrowRight, Gift } from 'lucide-react';
import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { Button } from '@/components/ui/button.jsx';
import { getText } from '@/utils/getText.js';

export function SetsPage() {
  const [selectedRelation, setSelectedRelation] = useState('all');

  const { data: sets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['setsList'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.SETS.LIST);
      return res.data?.data || [];
    },
  });

  const relationTabs = [
    { id: 'all', name: 'الكل (All Sets)' },
    { id: 'couple', name: 'كابلز (Couples)' },
    { id: 'friends', name: 'أصدقاء (Friends)' },
    { id: 'siblings', name: 'أخوة (Siblings)' },
  ];

  const filteredSets = sets.filter((set) => {
    if (selectedRelation === 'all') return true;
    return set.relationType === selectedRelation;
  });

  return (
    <div className="space-y-8 py-6 dir-rtl text-start max-w-7xl mx-auto px-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-l from-primary/15 via-secondary/40 to-background border border-border/60 p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تشكيلة الأطقم المتناسقة (Matching Sets)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            أطقم الكابلز والأصدقاء — Mates Store
          </h1>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">
            كل قطعة صُممت لتكمل القطعة التي بجانبها. اختر طقمك المفضل، وحدد المقاس واللون المناسب لكل شخص على حدة، واجمع 5% نقاط ولاء مع كل طلب.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {relationTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedRelation(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedRelation === tab.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card rounded-3xl border border-border/60 p-4 space-y-4 animate-pulse">
              <div className="h-60 bg-muted/60 rounded-2xl" />
              <div className="h-5 bg-muted/60 rounded-md w-3/4" />
              <div className="h-4 bg-muted/40 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-border/60 p-8 space-y-4">
          <p className="text-destructive font-bold text-sm">تعذر تحميل أطقم المتجر حالياً.</p>
          <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
            إعادة المحاولة
          </Button>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-3xl border border-border/60 p-8 space-y-3">
          <Users className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-base font-extrabold text-foreground">لا توجد أطقم مطابقة حالياً</h3>
          <p className="text-xs text-muted-foreground">ترقبوا إطلاق تشكيلات جديدة قريباً في Mates Store.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => {
            const setName = getText(set.name) || 'Matching Set';
            const priceEgp = (set.effectivePriceEGP || set.bundlePrice || 0) / 100;
            const pointsEarnedEgp = Math.floor(priceEgp * 5) / 100;
            const relationLabel =
              set.relationType === 'couple'
                ? 'كابلز (Couple)'
                : set.relationType === 'friends'
                ? 'أصدقاء (Friends)'
                : set.relationType === 'siblings'
                ? 'أخوة (Siblings)'
                : 'طقم متناسق';

            const coverImage =
              set.images?.find((img) => img.isCover)?.url ||
              set.images?.[0]?.url ||
              set.items?.[0]?.product?.images?.[0]?.url ||
              null;

            return (
              <div
                key={set._id}
                className="bg-card rounded-3xl border border-border/60 hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md flex flex-col group"
              >
                {/* Image Cover */}
                <div className="relative aspect-4/3 bg-secondary/30 overflow-hidden">
                  {coverImage ? (
                    <img
                      src={coverImage}
                      alt={setName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                      <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Badge */}
                  <div className="absolute top-3 start-3">
                    <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/60 text-[11px] font-extrabold text-foreground shadow-xs">
                      {relationLabel}
                    </span>
                  </div>

                  {/* Loyalty Tag */}
                  <div className="absolute bottom-3 end-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                      <Gift className="w-3 h-3" />
                      <span>+{pointsEarnedEgp.toFixed(2)} EGP points</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                      {setName}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {getText(set.description) || 'Complementary 2-piece set.'}
                    </p>
                  </div>

                  {/* Two Pieces Peek */}
                  {set.items && set.items.length === 2 && (
                    <div className="bg-secondary/30 rounded-2xl p-3 border border-border/40 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Piece 1:</span>
                        <span className="font-bold text-foreground">
                          {getText(set.items[0]?.product?.name) || 'Piece 1'}
                          {set.items[0]?.size?.code ? ` (${set.items[0]?.size?.code})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Piece 2:</span>
                        <span className="font-bold text-foreground">
                          {getText(set.items[1]?.product?.name) || 'Piece 2'}
                          {set.items[1]?.size?.code ? ` (${set.items[1]?.size?.code})` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer Price & Action */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block font-bold">سعر الطقم بالكامل:</span>
                      <span className="text-lg font-black text-primary">{priceEgp.toFixed(2)} ج.م</span>
                    </div>

                    <Link
                      to={`${ROUTE_PATHS.SETS}/${set._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-extrabold transition-all shadow-xs"
                    >
                      <span>تخصيص وطلب</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SetsPage;
