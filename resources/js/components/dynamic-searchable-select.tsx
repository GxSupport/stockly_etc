import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface DynamicSearchableSelectOption {
    id: string;
    code?: string;
    title: string;
}

interface DynamicSearchableSelectProps {
    value?: string;
    onValueChange?: (value: string, option?: DynamicSearchableSelectOption) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    className?: string;
    searchUrl: string;
    initialOptions?: DynamicSearchableSelectOption[];
    selectedOption?: DynamicSearchableSelectOption;
    paginated?: boolean;
    pageSize?: number;
}

export function DynamicSearchableSelect({
    value,
    onValueChange,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyText = 'No results found.',
    disabled = false,
    className,
    searchUrl,
    initialOptions = [],
    selectedOption,
    paginated = false,
    pageSize = 20,
}: DynamicSearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<DynamicSearchableSelectOption[]>(initialOptions);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const selectedOptionData = selectedOption || options.find((option) => option.id === value);

    const fetchOptions = async (query: string, pageToLoad: number, append: boolean) => {
        try {
            const response = await fetch(`${searchUrl}?search=${encodeURIComponent(query)}&limit=${pageSize}&page=${pageToLoad}`);
            if (response.ok) {
                const data = await response.json();
                const formattedOptions = data.map((item: any) => ({
                    id: item.id.toString(),
                    code: item.code,
                    title: item.title,
                }));
                setOptions((prev) => (append ? [...prev, ...formattedOptions] : formattedOptions));
                setPage(pageToLoad);
                setHasMore(paginated && formattedOptions.length === pageSize);
            }
        } catch (error) {
            console.error('Error searching options:', error);
        }
    };

    const searchWarehouses = async (query: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            await fetchOptions(query, 0, false);
            setLoading(false);
        }, 300);
    };

    const loadMore = async () => {
        if (loadingMore || loading || !hasMore) return;
        setLoadingMore(true);
        await fetchOptions(searchQuery, page + 1, true);
        setLoadingMore(false);
    };

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 40) {
            loadMore();
        }
    };

    useEffect(() => {
        if (open && options.length === 0) {
            searchWarehouses('');
        }
    }, [open]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        searchWarehouses(query);
    };

    const handleSelect = (selectedValue: string) => {
        if (selectedValue === value) {
            onValueChange?.('', undefined);
        } else {
            onValueChange?.(
                selectedValue,
                options.find((option) => option.id === selectedValue),
            );
        }
        setOpen(false);
    };

    const getDisplayText = () => {
        if (selectedOptionData) {
            return selectedOptionData.code ? `${selectedOptionData.code} - ${selectedOptionData.title}` : selectedOptionData.title;
        }
        return placeholder;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between', className)}
                    disabled={disabled}
                >
                    <span className="truncate">{getDisplayText()}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <div className="p-2">
                    <Input placeholder={searchPlaceholder} value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className="mb-2" />
                    <div className="max-h-60 overflow-auto" onScroll={handleScroll}>
                        {loading ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="ml-2 text-sm">Загрузка...</span>
                            </div>
                        ) : options.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">{emptyText}</div>
                        ) : (
                            <div className="space-y-1">
                                {options.map((option) => {
                                    const displayText = option.code ? `${option.code} - ${option.title}` : option.title;

                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleSelect(option.id)}
                                            className={cn(
                                                'flex cursor-pointer items-center rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground',
                                                value === option.id && 'bg-accent text-accent-foreground',
                                            )}
                                        >
                                            <Check className={cn('mr-2 h-4 w-4', value === option.id ? 'opacity-100' : 'opacity-0')} />
                                            <span className="truncate text-sm">{displayText}</span>
                                        </div>
                                    );
                                })}
                                {loadingMore && (
                                    <div className="flex items-center justify-center px-2 py-2 text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Загрузка...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
