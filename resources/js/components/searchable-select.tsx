import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import * as React from 'react';

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
    allowCustomValue?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = 'Выберите...',
    searchPlaceholder = 'Поиск...',
    className,
    disabled = false,
    allowCustomValue = false,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        return options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    const selectedOption = options.find((option) => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : value || placeholder;
    const hasValue = selectedOption || (allowCustomValue && value);

    // Qo'lda kiritilgan qiymat uchun: search options da yo'q va bo'sh emas
    const showCustomOption =
        allowCustomValue && search.trim() !== '' && !options.some((option) => option.label.toLowerCase() === search.toLowerCase());

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('h-10 w-full justify-between', !hasValue && 'text-muted-foreground', className)}
                    disabled={disabled}
                >
                    <span className="mr-2 flex-1 truncate text-left">{displayValue}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="z-50 w-full p-0" align="start" sideOffset={4}>
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
                    {showCustomOption && (
                        <div
                            className="relative flex cursor-default items-start rounded-sm px-2 py-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                                onValueChange?.(search.trim());
                                setOpen(false);
                                setSearch('');
                            }}
                        >
                            <Plus className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="break-words">
                                Добавить: <strong>{search.trim()}</strong>
                            </span>
                        </div>
                    )}
                    {filteredOptions.length === 0 && !showCustomOption ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">Ничего не найдено</div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    'relative flex cursor-default items-start rounded-sm px-2 py-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground',
                                    value === option.value && 'bg-accent text-accent-foreground',
                                )}
                                onClick={() => {
                                    onValueChange?.(option.value);
                                    setOpen(false);
                                    setSearch('');
                                }}
                            >
                                <Check className={cn('mt-0.5 mr-2 h-4 w-4 flex-shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                <span className="break-words">{option.label}</span>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
