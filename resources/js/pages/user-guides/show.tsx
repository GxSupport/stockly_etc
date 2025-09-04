import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Clock,
    Calendar,
    ThumbsUp,
    ThumbsDown,
    BookOpen,
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
    content: string;
}

interface UserGuideShowProps {
    guide: Guide;
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

export default function UserGuideShow({ guide }: UserGuideShowProps) {
    const [readingProgress, setReadingProgress] = useState(0);
    const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

    const IconComponent = iconMap[guide.icon as keyof typeof iconMap] || BookOpen;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Руководство пользователя',
            href: '/user-guides',
        },
        {
            title: guide.title,
            href: `/user-guides/${guide.slug}`,
        },
    ];

    // Calculate reading progress based on scroll
    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setReadingProgress(Math.min(100, Math.max(0, scrolled)));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Extract table of contents from HTML content, not raw markdown
    const generateTableOfContents = (htmlContent: string) => {
        const headings: { level: number; title: string; id: string }[] = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

        headingElements.forEach((heading) => {
            const level = parseInt(heading.tagName.charAt(1));
            const title = heading.textContent?.trim() || '';
            const id = heading.id || title.toLowerCase()
                .replace(/[^\p{L}\p{N}\s-]/gu, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '');

            // Skip if this is just metadata or frontmatter content
            if (title && !title.includes('title:') && !title.includes('description:')) {
                headings.push({ level, title, id });
            }
        });

        return headings;
    };

    const tableOfContents = generateTableOfContents(guide.content);

    const handleFeedback = (type: 'helpful' | 'not-helpful') => {
        setFeedback(type);
        // Here you could send feedback to backend
        console.log(`Feedback: ${type} for guide: ${guide.slug}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={guide.title} />

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Table of Contents Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="lg:sticky lg:top-24 space-y-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pb-8">
                            {/* Guide Info Card */}
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">Руководство</div>
                                            <div className="text-xs text-muted-foreground">{guide.category}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Прогресс чтения</span>
                                            <span className="text-sm font-medium">{Math.round(readingProgress)}%</span>
                                        </div>
                                        <Progress value={readingProgress} className="h-2" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Время:</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{guide.estimatedTime}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Обновлено:</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(guide.lastModified).toLocaleDateString('ru-RU')}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Сложность:</span>
                                            <Badge
                                                variant="secondary"
                                                className={`text-xs ${difficultyColors[guide.difficulty]}`}
                                            >
                                                {guide.difficulty}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Table of Contents */}
                            {tableOfContents.length > 0 && (
                                <Card className="border-l-4 border-l-primary">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                                            <BookOpen className="h-5 w-5" />
                                            Содержание
                                        </h3>
                                        <nav className="space-y-1">
                                            {tableOfContents.map((heading, index) => (
                                                <a
                                                    key={index}
                                                    href={`#${heading.id}`}
                                                    className={`block text-sm hover:text-primary hover:bg-primary/5 transition-all py-2 px-2 rounded-md ${
                                                        heading.level === 1
                                                            ? 'font-bold text-foreground text-base'
                                                            : heading.level === 2
                                                            ? 'font-medium text-foreground'
                                                            : heading.level === 3
                                                            ? 'ml-3 text-muted-foreground'
                                                            : heading.level === 4
                                                            ? 'ml-6 text-muted-foreground text-xs'
                                                            : 'ml-9 text-muted-foreground text-xs'
                                                    }`}
                                                >
                                                    {heading.title}
                                                </a>
                                            ))}
                                        </nav>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="space-y-4">
                                <Link href="/user-guides">
                                    <Button variant="ghost" size="sm" className="hover:bg-accent">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Назад к руководствам
                                    </Button>
                                </Link>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge
                                            variant="secondary"
                                            className={categoryColors[guide.category] || categoryColors['Общие']}
                                        >
                                            {guide.category}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className={difficultyColors[guide.difficulty]}
                                        >
                                            {guide.difficulty}
                                        </Badge>
                                    </div>

                                    <h1 className="text-3xl font-bold">{guide.title}</h1>

                                    <p className="text-lg text-muted-foreground">
                                        {guide.description}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <Card>
                                <CardContent className="p-8">
                                    <div
                                        className="prose prose-lg prose-gray dark:prose-invert max-w-none
                                                   prose-headings:scroll-mt-8 prose-headings:font-bold prose-headings:text-foreground
                                                   prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:border-b prose-h1:pb-4 prose-h1:border-border
                                                   prose-h2:text-2xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:border-b prose-h2:pb-3 prose-h2:border-border
                                                   prose-h3:text-xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-foreground
                                                   prose-h4:text-lg prose-h4:mb-3 prose-h4:mt-6 prose-h4:text-foreground
                                                   prose-h5:text-base prose-h5:mb-2 prose-h5:mt-5 prose-h5:text-foreground
                                                   prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-4 prose-h6:text-foreground
                                                   prose-p:mb-4 prose-p:leading-relaxed prose-p:text-foreground prose-p:text-base
                                                   prose-ul:mb-6 prose-ul:list-disc prose-ul:pl-6 prose-ul:text-foreground
                                                   prose-ol:mb-6 prose-ol:list-decimal prose-ol:pl-6 prose-ol:text-foreground
                                                   prose-li:mb-2 prose-li:leading-relaxed prose-li:text-foreground
                                                   prose-strong:font-semibold prose-strong:text-foreground
                                                   prose-em:italic prose-em:text-foreground
                                                   prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground
                                                   prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                                                   prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:text-foreground
                                                   prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                                                   prose-table:border-collapse prose-table:w-full prose-table:text-foreground
                                                   prose-th:border prose-th:p-3 prose-th:bg-muted prose-th:font-semibold prose-th:text-foreground
                                                   prose-td:border prose-td:p-3 prose-td:text-foreground
                                                   prose-img:rounded-lg prose-img:shadow-md
                                                   prose-hr:border-t prose-hr:border-border prose-hr:my-8"
                                        dangerouslySetInnerHTML={{ __html: guide.content }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Feedback Section */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-medium mb-4">Было ли это руководство полезным?</h3>
                                    <div className="flex gap-3">
                                        <Button
                                            variant={feedback === 'helpful' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleFeedback('helpful')}
                                            className="flex items-center gap-2"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            Полезно
                                        </Button>
                                        <Button
                                            variant={feedback === 'not-helpful' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleFeedback('not-helpful')}
                                            className="flex items-center gap-2"
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            Не помогло
                                        </Button>
                                    </div>
                                    {feedback && (
                                        <p className="text-sm text-muted-foreground mt-3">
                                            Спасибо за ваш отзыв! Мы используем его для улучшения документации.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
