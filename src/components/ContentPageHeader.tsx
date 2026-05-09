

import { store } from "@/store/store";
import { FC, useRef, useLayoutEffect, useState } from "react";
import { observer } from "mobx-react-lite";

interface FilterTabsProps {
  options: readonly { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

export const FilterTabs = observer<FilterTabsProps>(({ options, value, onChange }) => {
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (btn: HTMLButtonElement, key: string) => {
    onChange(key);
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const btnCenter = btnRect.left - containerRect.left + btnRect.width / 2;
    const scrollX = container.scrollLeft + btnCenter - containerWidth / 2;

    container.scrollTo({
      left: scrollX,
      behavior: "smooth"
    });
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeBtn = container.querySelector(`button[data-active="true"]`);
    if (activeBtn) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = (activeBtn as HTMLElement).getBoundingClientRect();
      setIndicator({
        left: btnRect.left - containerRect.left,
        width: btnRect.width
      });
    }
  }, [value, options, store.lang]);

  return (
    <div ref={containerRef}
      style={{ margin: "-1rem -1.5rem", padding: "1rem 1.5rem" }}
      className="flex flex-nowrap items-center gap-6 relative overflow-x-auto scrollbar-hide">
      {options.map(({ key, label }) => (
        <button
          key={key}
          data-active={value === key}
          onClick={(e) => handleTabClick(e.currentTarget, key)}
          style={{ padding: "8px 8px", cursor: 'pointer' }}
          className={`
            text-sm font-light transition-colors whitespace-nowrap rounded-md
            ${value === key
              ? "text-highlight bg-white/10 md:text-highlight md:bg-transparent"
              : "text-content/65 hover:text-subtitle hover:bg-white/20 md:text-content/65 md:bg-transparent"
            }
          `}
        >
          {store.t(label)}
        </button>
      ))}
      {indicator && (
        <div
          className="absolute bottom-[12px] h-0.5 bg-highlight/80 transition-all duration-300 ease-out md:block hidden"
          style={{
            left: indicator.left,
            width: indicator.width
          }}
        />
      )}
    </div>
  );
});


interface FilterOption {
  key: string;
  label: string;
}

interface ContentPageHeaderProps {
  title: string;
  subtitle: string;
  filterOptions: readonly FilterOption[];
  filterKey: string;
  onFilterChange: (newFilter: string) => void;
  sortByLatest: boolean;
  onSortToggle: () => void;
  latestLabel?: string;
  defaultLabel?: string;
  hideSortButton?: boolean;
}

const SortToggleButton = observer(({
  sortByLatest,
  onSortToggle,
  latestLabel = "Latest",
  defaultLabel = "Best",
  hideOnMobile,
}: {
  sortByLatest: boolean;
  onSortToggle: () => void;
  latestLabel?: string;
  defaultLabel?: string;
  hideOnMobile?: boolean;
}) => (
  <button
    onClick={onSortToggle}
    className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded transition-colors justify-center ${hideOnMobile ? "hidden md:flex" : "md:hidden"
      } ${sortByLatest
        ? "bg-highlight/50 text-subtitle"
        : "bg-white/10 text-subtitle"
      }`}
    style={{ cursor: "pointer", minWidth: "4rem" }}
  >
    {store.t(sortByLatest ? latestLabel : defaultLabel)}
  </button>
));

export const ContentPageHeader = observer(({
  title,
  subtitle,
  filterOptions,
  filterKey,
  onFilterChange,
  sortByLatest,
  onSortToggle,
  latestLabel = "Latest",
  defaultLabel = "Best",
  hideSortButton = false,
}: ContentPageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4">
        <div>
          <h1 className="text-3xl text-highlight font-light">{store.t(title)}</h1>
          <p className="text-subtitle mt-1">{store.t(subtitle)}</p>
        </div>
        {!hideSortButton && (
          <SortToggleButton
            sortByLatest={sortByLatest}
            onSortToggle={onSortToggle}
            latestLabel={latestLabel}
            defaultLabel={defaultLabel}
          />
        )}
      </div>
      <div className="flex items-center gap-4">
        <FilterTabs options={filterOptions} value={filterKey} onChange={onFilterChange} />
        {!hideSortButton && (
          <SortToggleButton
            sortByLatest={sortByLatest}
            onSortToggle={onSortToggle}
            latestLabel={latestLabel}
            defaultLabel={defaultLabel}
            hideOnMobile
          />
        )}
      </div>
    </div>
  );
});
