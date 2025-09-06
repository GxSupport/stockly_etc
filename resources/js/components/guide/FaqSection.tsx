import { useState, useMemo } from 'react';
import { Search, Plus, Minus, HelpCircle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    priority?: 'high' | 'medium' | 'low';
    type?: 'info' | 'warning' | 'success' | 'error';
    tags?: string[];
}

interface FaqSectionProps {
    title?: string;
    description?: string;
    items: FaqItem[];
    searchPlaceholder?: string;
    showCategories?: boolean;
}

const FaqSection = ({ 
    title = "Часто задаваемые вопросы",
    description = "Найдите ответы на популярные вопросы",
    items, 
    searchPlaceholder = "Поиск по вопросам...",
    showCategories = true 
}: FaqSectionProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    // Get unique categories
    const categories = useMemo(() => {
        const cats = Array.from(new Set(items.map(item => item.category)));
        return ['all', ...cats];
    }, [items]);

    // Filter items based on search and category
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = !searchQuery || 
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
    }, [items, searchQuery, selectedCategory]);

    const toggleItem = (itemId: string) => {
        setOpenItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const expandAll = () => {
        setOpenItems(new Set(filteredItems.map(item => item.id)));
    };

    const collapseAll = () => {
        setOpenItems(new Set());
    };

    const getItemIcon = (type?: string) => {
        switch (type) {
            case 'warning': return <AlertCircle className="h-5 w-5 text-orange-500" />;
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'info': return <Info className="h-5 w-5 text-blue-500" />;
            default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'all': 'Все вопросы',
            'setup': 'Настройка',
            'troubleshooting': 'Устранение неполадок',
            'features': 'Функции',
            'general': 'Общие',
            'technical': 'Технические',
        };
        return labels[category] || category;
    };

    return (
        <div className="guide-faq">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
            </div>

            {/* Search */}
            <div className="faq-search relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                {/* Categories */}
                {showCategories && (
                    <div className="faq-categories">
                        {categories.map(category => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                                className="text-xs"
                            >
                                {getCategoryLabel(category)}
                                {category !== 'all' && (
                                    <span className="ml-2 bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full text-xs">
                                        {items.filter(item => item.category === category).length}
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Expand/Collapse All */}
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={expandAll}>
                        Развернуть все
                    </Button>
                    <Button variant="ghost" size="sm" onClick={collapseAll}>
                        Свернуть все
                    </Button>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
                Найдено {filteredItems.length} {filteredItems.length === 1 ? 'вопрос' : 'вопросов'}
                {searchQuery && ` по запросу "${searchQuery}"`}
            </div>

            {/* FAQ Items */}
            <div className="faq-items space-y-4">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Вопросы не найдены</h3>
                        <p className="text-muted-foreground">
                            Попробуйте изменить поисковый запрос или выберите другую категорию
                        </p>
                    </div>
                ) : (
                    filteredItems.map((item) => {
                        const isOpen = openItems.has(item.id);
                        
                        return (
                            <div
                                key={item.id}
                                className={`faq-item ${isOpen ? 'open' : ''} slide-in`}
                                style={{ animationDelay: `${filteredItems.indexOf(item) * 0.1}s` }}
                            >
                                <button
                                    className="faq-question w-full"
                                    onClick={() => toggleItem(item.id)}
                                    aria-expanded={isOpen}
                                >
                                    <div className="flex items-start gap-3">
                                        {getItemIcon(item.type)}
                                        <div className="flex-1 text-left">
                                            <h3 className="font-medium text-foreground">
                                                {item.question}
                                            </h3>
                                            {item.category && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground mt-1">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="faq-toggle ml-2">
                                        {isOpen ? (
                                            <Minus className="h-5 w-5" />
                                        ) : (
                                            <Plus className="h-5 w-5" />
                                        )}
                                    </div>
                                </button>
                                
                                <div className={`faq-answer overflow-hidden transition-all duration-300 ${
                                    isOpen ? 'max-h-96 pt-4' : 'max-h-0'
                                }`}>
                                    <div 
                                        className="text-sm max-w-none pl-8 text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                    
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3 pl-8">
                                            {item.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FaqSection;