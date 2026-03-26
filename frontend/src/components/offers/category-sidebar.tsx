'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { categories } from '@/lib/categories';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryIconMap } from '@/components/icons/categories';

interface CategorySidebarProps {
  selected: string;
  onSelect: (category: string) => void;
  offerCounts?: Record<string, number>;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function CollapsedTooltip({ targetRef, label, count }: { targetRef: React.RefObject<HTMLButtonElement | null>; label: string; count: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !targetRef.current) return null;

  const rect = targetRef.current.getBoundingClientRect();

  return createPortal(
    <div
      className="fixed px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md whitespace-nowrap z-9999 shadow-lg pointer-events-none"
      style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
    >
      {label}
      {count > 0 && <span className="ml-1.5 text-[10px] opacity-70">({count})</span>}
      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary" />
    </div>,
    document.body
  );
}

export function CategorySidebar({ selected, onSelect, offerCounts, onCollapsedChange }: CategorySidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    onCollapsedChange?.(next);
  };

  return (
    <div className={`transition-all duration-300 ${collapsed ? 'w-16' : 'w-full'}`}>
      {/* Header */}
      <div className={`flex items-center mb-3 ${collapsed ? 'justify-center' : 'justify-between px-3'}`}>
        {!collapsed && (
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            ক্যাটাগরি
          </h3>
        )}
        <button
          onClick={toggleCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground transition-colors cursor-pointer"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Category items */}
      <div className="space-y-1">
        {categories.map((cat) => {
          const isActive = selected === cat.value;
          const count = offerCounts?.[cat.value] ?? 0;

          return (
            <CategoryItem
              key={cat.value}
              cat={cat}
              isActive={isActive}
              count={count}
              collapsed={collapsed}
              hovered={hoveredItem === cat.value}
              onSelect={() => onSelect(cat.value)}
              onHover={(h) => setHoveredItem(h ? cat.value : null)}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryItem({
  cat,
  isActive,
  count,
  collapsed,
  hovered,
  onSelect,
  onHover,
}: {
  cat: (typeof categories)[number];
  isActive: boolean;
  count: number;
  collapsed: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button
        ref={btnRef}
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        className={`w-full flex items-center gap-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer ${
          collapsed ? 'justify-center px-1' : 'px-3'
        } ${
          isActive
            ? 'bg-primary/15 text-primary shadow-sm'
            : 'hover:bg-muted/60'
        }`}
      >
        <div className="relative shrink-0">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
            isActive ? 'bg-primary-foreground/20' : 'bg-muted/60'
          }`}>
            {(() => {
              const Icon = categoryIconMap[cat.value];
              return Icon ? <Icon className="w-5 h-5" /> : <span className="text-base">{cat.emoji}</span>;
            })()}
          </div>
          {collapsed && count > 0 && (
            <span className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full px-0.5 ${
              isActive ? 'bg-primary-foreground/80 text-primary' : 'bg-primary/20 text-primary'
            }`}>
              {count}
            </span>
          )}
        </div>

        {!collapsed && (
          <div className="flex-1 text-left min-w-0">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`}>
              {cat.label}
            </p>
          </div>
        )}

        {!collapsed && count > 0 && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
            isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
          }`}>
            {count}
          </span>
        )}
      </button>

      {collapsed && hovered && (
        <CollapsedTooltip targetRef={btnRef} label={cat.label} count={count} />
      )}
    </div>
  );
}
