import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { 
    BookOpen, 
    Clock, 
    Search, 
    Users, 
    ClipboardList, 
    Warehouse, 
    Building2, 
    Archive, 
    FileText,
    HelpCircle 
} from 'lucide-react';

interface Guide {
    slug: string;
    title: string;
    description: string;
    difficulty: 'Начальный' | 'Средний' | 'Продвинутый';
    icon: string;
    category: string;
    estimatedTime: string;
    lastModified: string;
}

interface UserGuidesProps {
    guides: Guide[];
}

const iconMap = {
    BookOpen,
    Users,
    ClipboardList,
    Warehouse,
    Building2,
    Archive,
    FileText,
    HelpCircle,
};

const difficultyColors = {
    'Начальный': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Средний': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Продвинутый': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const categoryColors = {
    'Управление персоналом': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Документооборот': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Складское хозяйство': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    'Общие': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Руководство пользователя',
        href: '/user-guides',
    },
];

export default function UserGuidesIndex({ guides }: UserGuidesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

    // Filter guides based on search and filters
    const filteredGuides = guides.filter(guide => {
        const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             guide.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || guide.category === selectedCategory;
        const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;
        
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Get unique categories and difficulties
    const categories = Array.from(new Set(guides.map(g => g.category)));
    const difficulties = Array.from(new Set(guides.map(g => g.difficulty)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Руководство пользователя" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Руководство пользователя</h1>
                            <p className="text-muted-foreground mt-2">
                                Изучите как эффективно работать с системой Stockly
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{filteredGuides.length}</div>
                            <div className="text-sm text-muted-foreground">
                                {filteredGuides.length === 1 ? 'руководство' : 
                                 filteredGuides.length < 5 ? 'руководства' : 'руководств'}
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Поиск по названию или описанию..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Category Filter */}
                            <div className="flex gap-1">
                                <Button
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    Все категории
                                </Button>
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>

                            {/* Difficulty Filter */}
                            <div className="flex gap-1">
                                <Button
                                    variant={selectedDifficulty === null ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedDifficulty(null)}
                                >
                                    Все уровни
                                </Button>
                                {difficulties.map(difficulty => (
                                    <Button
                                        key={difficulty}
                                        variant={selectedDifficulty === difficulty ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedDifficulty(difficulty)}
                                    >
                                        {difficulty}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guides Grid */}
                {filteredGuides.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Руководства не найдены</h3>
                        <p className="text-muted-foreground">
                            Попробуйте изменить поисковый запрос или фильтры
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGuides.map((guide) => {
                            const IconComponent = iconMap[guide.icon as keyof typeof iconMap] || BookOpen;
                            
                            return (
                                <Card key={guide.slug} className="group hover:shadow-md transition-all duration-200">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <IconComponent className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex flex-col gap-1 items-end">
                                                <Badge 
                                                    variant="secondary" 
                                                    className={difficultyColors[guide.difficulty]}
                                                >
                                                    {guide.difficulty}
                                                </Badge>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <CardTitle className="group-hover:text-primary transition-colors">
                                                {guide.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                {guide.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{guide.estimatedTime}</span>
                                            </div>
                                            <Badge 
                                                variant="outline"
                                                className={categoryColors[guide.category] || categoryColors['Общие']}
                                            >
                                                {guide.category}
                                            </Badge>
                                        </div>

                                        <Link href={`/user-guides/${guide.slug}`}>
                                            <Button className="w-full group-hover:bg-primary/90 transition-colors">
                                                Читать руководство
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}