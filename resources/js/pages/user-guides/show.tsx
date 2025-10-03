import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    Bookmark,
    BookmarkCheck,
    BookOpen,
    Building2,
    Calendar,
    ClipboardList,
    Clock,
    FileText,
    HelpCircle,
    Printer,
    Share,
    ThumbsDown,
    ThumbsUp,
    Users,
    Warehouse,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    Начальный: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Средний: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    Продвинутый: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const categoryColors = {
    'Управление персоналом': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Документооборот: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Складское хозяйство': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    Общие: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export default function UserGuideShow({ guide }: UserGuideShowProps) {
    const [readingProgress, setReadingProgress] = useState(0);
    const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [currentHeading, setCurrentHeading] = useState<string>('');
    const contentRef = useRef<HTMLDivElement>(null);

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

    // Calculate reading progress and current heading based on scroll
    useEffect(() => {
        const handleScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            setReadingProgress(Math.min(100, Math.max(0, scrolled)));

            // Update current heading
            if (contentRef.current) {
                const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
                let current = '';

                headings.forEach((heading) => {
                    const rect = heading.getBoundingClientRect();
                    if (rect.top <= 100) {
                        current = heading.textContent || '';
                    }
                });

                setCurrentHeading(current);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [guide.content]);

    // Extract table of contents from HTML content
    const generateTableOfContents = (htmlContent: string) => {
        const headings: { level: number; title: string; id: string }[] = [];

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

            headingElements.forEach((heading) => {
                const level = parseInt(heading.tagName.charAt(1));
                const title = heading.textContent?.trim() || '';
                let id = heading.id;

                // Generate ID if not present
                if (!id && title) {
                    id = title
                        .toLowerCase()
                        .replace(/[^\p{L}\p{N}\s-]/gu, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }

                // Skip metadata, emojis-only titles, or very short titles
                if (
                    title &&
                    !title.includes('title:') &&
                    !title.includes('description:') &&
                    title.length > 2 &&
                    !/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\s]*$/u.test(title)
                ) {
                    headings.push({ level, title, id: id || '' });
                }
            });
        } catch (error) {
            console.error('Error parsing HTML content for TOC:', error);
        }

        return headings;
    };

    const tableOfContents = generateTableOfContents(guide.content);

    const handleFeedback = (type: 'helpful' | 'not-helpful') => {
        setFeedback(type);
        // Here you could send feedback to backend
        console.log(`Feedback: ${type} for guide: ${guide.slug}`);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // Here you could save bookmark to localStorage or backend
        const bookmarks = JSON.parse(localStorage.getItem('guide-bookmarks') || '[]');
        if (isBookmarked) {
            const filtered = bookmarks.filter((slug: string) => slug !== guide.slug);
            localStorage.setItem('guide-bookmarks', JSON.stringify(filtered));
        } else {
            bookmarks.push(guide.slug);
            localStorage.setItem('guide-bookmarks', JSON.stringify(bookmarks));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: guide.title,
                    text: guide.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Initialize bookmark state from localStorage
    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('guide-bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(guide.slug));
    }, [guide.slug]);

    // Initialize interactive elements after HTML content loads
    useEffect(() => {
        if (contentRef.current && guide.type === 'html') {
            // Add copy buttons to code blocks
            const codeBlocks = contentRef.current.querySelectorAll('.code-block');
            codeBlocks.forEach((block) => {
                const copyBtn = block.querySelector('.copy-button') as HTMLElement;
                if (copyBtn && !copyBtn.hasAttribute('data-initialized')) {
                    copyBtn.setAttribute('data-initialized', 'true');
                    copyBtn.addEventListener('click', () => {
                        const code = block.querySelector('code')?.textContent || '';
                        navigator.clipboard.writeText(code).then(() => {
                            copyBtn.textContent = 'Скопировано';
                            setTimeout(() => {
                                copyBtn.textContent = 'Копировать';
                            }, 2000);
                        });
                    });
                }
            });
        }
    }, [guide.content, guide.type]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={guide.title} />

            <div className="mx-auto max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Table of Contents Sidebar */}
                    <div className="order-2 lg:order-1 lg:col-span-1">
                        <div className="space-y-4 pb-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
                            {/* Guide Info Card */}
                            <Card>
                                <CardContent className="space-y-4 p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Руководство</div>
                                            <div className="text-xs text-muted-foreground">{guide.category}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Прогресс чтения</span>
                                            <span className="text-sm font-medium">{Math.round(readingProgress)}%</span>
                                        </div>
                                        <Progress value={readingProgress} className="h-2" />
                                        {currentHeading && (
                                            <div className="truncate text-xs text-muted-foreground" title={currentHeading}>
                                                <span className="font-medium">Сейчас:</span> {currentHeading}
                                            </div>
                                        )}
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
                                            <Badge variant="secondary" className={`text-xs ${difficultyColors[guide.difficulty]}`}>
                                                {guide.difficulty}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 border-t border-border pt-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" onClick={handleBookmark} className="text-xs">
                                                {isBookmarked ? <BookmarkCheck className="mr-1 h-3 w-3" /> : <Bookmark className="mr-1 h-3 w-3" />}
                                                {isBookmarked ? 'Сохранено' : 'Сохранить'}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
                                                <Share className="mr-1 h-3 w-3" />
                                                Поделиться
                                            </Button>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={handlePrint} className="w-full text-xs">
                                            <Printer className="mr-1 h-3 w-3" />
                                            Печать
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Table of Contents */}
                            {tableOfContents.length > 0 && (
                                <Card className="border-l-4 border-l-primary">
                                    <CardContent className="p-6">
                                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-primary">
                                            <BookOpen className="h-5 w-5" />
                                            Содержание
                                        </h3>
                                        <nav className="space-y-1">
                                            {tableOfContents.map((heading, index) => (
                                                <a
                                                    key={index}
                                                    href={`#${heading.id}`}
                                                    className={`block rounded-md px-2 py-2 text-sm transition-all hover:bg-primary/5 hover:text-primary ${
                                                        heading.level === 1
                                                            ? 'text-base font-bold text-foreground'
                                                            : heading.level === 2
                                                              ? 'font-medium text-foreground'
                                                              : heading.level === 3
                                                                ? 'ml-3 text-muted-foreground'
                                                                : heading.level === 4
                                                                  ? 'ml-6 text-xs text-muted-foreground'
                                                                  : 'ml-9 text-xs text-muted-foreground'
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
                    <div className="order-1 lg:order-2 lg:col-span-3">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="space-y-4">
                                <Link href="/user-guides">
                                    <Button variant="ghost" size="sm" className="hover:bg-accent">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Назад к руководствам
                                    </Button>
                                </Link>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary" className={categoryColors[guide.category] || categoryColors['Общие']}>
                                            {guide.category}
                                        </Badge>
                                        <Badge variant="secondary" className={difficultyColors[guide.difficulty]}>
                                            {guide.difficulty}
                                        </Badge>
                                    </div>

                                    <h1 className="text-3xl font-bold">{guide.title}</h1>

                                    <p className="text-lg text-muted-foreground">{guide.description}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <Card>
                                <CardContent className="p-8">
                                    <div
                                        ref={contentRef}
                                        className="guide-container max-w-none text-foreground"
                                        dangerouslySetInnerHTML={{ __html: guide.content }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Feedback Section */}
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="mb-4 font-medium">Было ли это руководство полезным?</h3>
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
                                        <p className="mt-3 text-sm text-muted-foreground">
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
