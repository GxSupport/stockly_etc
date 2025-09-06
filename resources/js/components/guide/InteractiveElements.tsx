import { useState, useEffect } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Copy to Clipboard Hook
export const useCopyToClipboard = () => {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(text);
            setTimeout(() => setCopiedText(null), 2000);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    };

    return { copyToClipboard, copiedText };
};

// Code Block with Copy Button
interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
    showLineNumbers?: boolean;
}

export const InteractiveCodeBlock = ({ 
    code, 
    language = 'text', 
    title,
    showLineNumbers = false 
}: CodeBlockProps) => {
    const { copyToClipboard, copiedText } = useCopyToClipboard();
    const [isVisible, setIsVisible] = useState(true);

    const handleCopy = () => {
        copyToClipboard(code);
    };

    const lines = code.split('\n');

    return (
        <div className="code-block my-6">
            <div className="code-header">
                <div className="flex items-center gap-2">
                    {title && <span className="text-sm font-medium text-gray-300">{title}</span>}
                    <span className="code-language">{language}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsVisible(!isVisible)}
                        className="text-gray-300 hover:text-white p-1 h-auto"
                    >
                        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="copy-button flex items-center gap-2 text-gray-300 hover:text-white"
                    >
                        {copiedText === code ? (
                            <>
                                <Check className="h-4 w-4" />
                                Скопировано
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Копировать
                            </>
                        )}
                    </Button>
                </div>
            </div>
            {isVisible && (
                <div className="code-content">
                    {showLineNumbers ? (
                        <div className="flex">
                            <div className="flex flex-col pr-4 border-r border-gray-700 text-gray-500 text-sm font-mono select-none">
                                {lines.map((_, index) => (
                                    <span key={index} className="leading-6">
                                        {index + 1}
                                    </span>
                                ))}
                            </div>
                            <pre className="flex-1 pl-4">
                                <code className="text-sm font-mono text-gray-100 whitespace-pre">
                                    {code}
                                </code>
                            </pre>
                        </div>
                    ) : (
                        <pre>
                            <code className="text-sm font-mono text-gray-100 whitespace-pre">
                                {code}
                            </code>
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};

// Screenshot Annotation Component
interface AnnotationProps {
    x: number;
    y: number;
    text: string;
    type?: 'info' | 'warning' | 'success' | 'error';
}

export const ScreenshotAnnotation = ({ x, y, text, type = 'info' }: AnnotationProps) => {
    const [isVisible, setIsVisible] = useState(true);

    const typeStyles = {
        info: 'bg-blue-500 before:border-t-blue-500',
        warning: 'bg-yellow-500 before:border-t-yellow-500',
        success: 'bg-green-500 before:border-t-green-500',
        error: 'bg-red-500 before:border-t-red-500',
    };

    return isVisible ? (
        <div
            className={`callout ${typeStyles[type]} cursor-pointer`}
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => setIsVisible(false)}
            title="Нажмите, чтобы скрыть"
        >
            {text}
        </div>
    ) : null;
};

// Highlight Box Component
interface HighlightBoxProps {
    type: 'info' | 'warning' | 'success' | 'error';
    title?: string;
    children: React.ReactNode;
    collapsible?: boolean;
}

export const HighlightBox = ({ 
    type, 
    title, 
    children, 
    collapsible = false 
}: HighlightBoxProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const typeStyles = {
        info: 'highlight-box info',
        warning: 'highlight-box warning',
        success: 'highlight-box success',
        error: 'highlight-box danger',
    };

    const typeIcons = {
        info: '💡',
        warning: '⚠️',
        success: '✅',
        error: '❌',
    };

    return (
        <div className={typeStyles[type]}>
            {title && (
                <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold flex items-center gap-2">
                        <span>{typeIcons[type]}</span>
                        {title}
                    </h5>
                    {collapsible && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 h-auto"
                        >
                            {isCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            )}
            {!isCollapsed && <div>{children}</div>}
        </div>
    );
};

// Progress Steps Component
interface ProgressStepsProps {
    steps: string[];
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export const ProgressSteps = ({ steps, currentStep, onStepClick }: ProgressStepsProps) => {
    return (
        <div className="progress-indicator">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                    <button
                        className={`progress-step ${
                            index < currentStep 
                                ? 'completed' 
                                : index === currentStep 
                                ? 'active' 
                                : 'pending'
                        }`}
                        onClick={() => onStepClick?.(index)}
                        title={step}
                        disabled={!onStepClick}
                    >
                        {index < currentStep ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            index + 1
                        )}
                    </button>
                    {index < steps.length - 1 && (
                        <div className={`progress-connector ${
                            index < currentStep ? 'completed' : ''
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );
};

// Tabbed Content Component
interface Tab {
    id: string;
    title: string;
    content: React.ReactNode;
}

interface TabbedContentProps {
    tabs: Tab[];
    defaultTab?: string;
}

export const TabbedContent = ({ tabs, defaultTab }: TabbedContentProps) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className="tabbed-content">
            <div className="tab-headers">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-header ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.title}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {activeTabContent}
            </div>
        </div>
    );
};