'use client';

import { categories } from '@/lib/categories';

interface CategorySidebarProps {
  selected: string;
  onSelect: (category: string) => void;
  offerCounts?: Record<string, number>;
}

export function CategorySidebar({ selected, onSelect, offerCounts }: CategorySidebarProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
        ক্যাটাগরি
      </h3>
      {categories.map((cat) => {
        const isActive = selected === cat.value;
        const count = offerCounts?.[cat.value] ?? 0;

        return (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${cat.color} text-white shadow-sm`
                : 'hover:bg-muted/60'
            }`}
          >
            {/* Emoji icon */}
            <div className={`w-8 h-8 rounded-md flex items-center justify-center text-base shrink-0 ${
              isActive
                ? 'bg-white/20'
                : 'bg-muted/60'
            }`}>
              {cat.emoji}
            </div>

            {/* Label */}
            <div className="flex-1 text-left min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-foreground'}`}>
                {cat.label}
              </p>
            </div>

            {/* Count badge */}
            {count > 0 && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
