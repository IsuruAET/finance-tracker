import { useEffect, useRef, useState } from "react";
import { MdFilterList } from "react-icons/md";
import DateRangePicker, {
  type DateRangePickerRef,
} from "../DateRangePicker/DateRangePicker";
import Select from "../Inputs/Select";

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface FilterSectionProps {
  selectedWalletId: string;
  onWalletChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  walletOptions: SelectOption[];
  walletGroups?: SelectGroup[];
}

const FilterSection = ({
  selectedWalletId,
  onWalletChange,
  walletOptions,
  walletGroups,
}: FilterSectionProps) => {
  const dateRangePickerRef = useRef<DateRangePickerRef>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const handleToggleFilters = () => {
      setMobileFiltersOpen((prev) => !prev);
    };

    window.addEventListener("toggle-filters", handleToggleFilters);

    return () => {
      window.removeEventListener("toggle-filters", handleToggleFilters);
    };
  }, []);

  return (
    <div
      className={`mb-3 sticky top-[56px] sm:top-[64px] z-20 ${
        mobileFiltersOpen ? "block" : "hidden"
      } sm:block`}
    >
      <div className="card px-3 py-2 sm:px-4 sm:py-3 border border-border/80 bg-bg-primary/90 dark:bg-bg-primary/90 backdrop-blur">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2 sm:gap-2 w-full">
          <MdFilterList className="text-text-secondary text-base sm:text-lg shrink-0 transition-colors hidden md:block" />
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <DateRangePicker ref={dateRangePickerRef} />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select
              value={selectedWalletId}
              onChange={onWalletChange}
              placeholder="All wallets"
              options={walletOptions}
              groups={walletGroups}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;

