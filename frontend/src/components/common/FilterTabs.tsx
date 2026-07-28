interface FilterTab<T extends string> {
  label: string;
  value: T;
}

interface FilterTabsProps<T extends string> {
  options: readonly FilterTab<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterTabsProps<T>) {
  return (
    <div className="filter-tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            className={
              isSelected
                ? "filter-tabs__button filter-tabs__button--selected"
                : "filter-tabs__button"
            }
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
