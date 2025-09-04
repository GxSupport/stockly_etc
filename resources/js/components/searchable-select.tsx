import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Выберите...",
  searchPlaceholder = "Поиск...",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate text-left flex-1 mr-2">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50" align="start" sideOffset={4}>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="max-h-80 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Ничего не найдено
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-default select-none items-start rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onValueChange?.(option.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 mt-0.5 flex-shrink-0",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="break-words">{option.label}</span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}