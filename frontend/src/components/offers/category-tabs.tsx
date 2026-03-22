'use client';

import { categories } from '@/lib/categories';

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
  offerCounts?: Record<string, number>;
}

export function CategoryTabs({ selected, onSelect, offerCounts }: CategoryTabsProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pt-2 pb-2 scrollbar-hide -mx-4 px-4">
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        const count = offerCounts?.[cat.value];
        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className="flex flex-col items-center gap-1.5 shrink-0 relative"
          >
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-br ${cat.color} ring-2 ring-primary ring-offset-2 scale-105`
                : 'bg-muted/60 ring-1 ring-border'
            }`}>
              <span className={isActive ? 'drop-shadow-md' : 'opacity-70'}>{cat.emoji}</span>
              {/* Count badge */}
              {count !== undefined && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-bold min-w-4 h-4 flex items-center justify-center rounded-full px-1">
                  {count}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {cat.labelShort}
            </span>
          </button>
        );
      })}
    </div>
  );
}
