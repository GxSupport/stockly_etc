import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Step {
    title: string;
    content: string;
    screenshot?: string;
    annotations?: Array<{
        x: number;
        y: number;
        text: string;
        type?: 'info' | 'warning' | 'success' | 'error';
    }>;
    code?: {
        language: string;
        content: string;
    };
    tips?: string[];
}

interface StepByStepGuideProps {
    title: string;
    description: string;
    steps: Step[];
    estimatedTime?: string;
}

const StepByStepGuide = ({ title, description, steps, estimatedTime }: StepByStepGuideProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [isAutoPlay, setIsAutoPlay] = useState(false);

    const progress = ((currentStep + 1) / steps.length) * 100;

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const markStepComplete = () => {
        setCompletedSteps(new Set([...completedSteps, currentStep]));
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const currentStepData = steps[currentStep];

    return (
        <div className="guide-tutorial">
            {/* Overview */}
            <div className="guide-overview">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            📚 {title}
                        </h2>
                        <p className="text-blue-800 dark:text-blue-200 mb-4">{description}</p>
                    </div>
                    {estimatedTime && (
                        <div className="text-right">
                            <div className="text-sm text-blue-600 dark:text-blue-300">Время выполнения</div>
                            <div className="font-semibold text-blue-900 dark:text-blue-100">{estimatedTime}</div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        Шаг {currentStep + 1} из {steps.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-800 dark:text-blue-200">Прогресс:</span>
                        <div className="w-32">
                            <Progress value={progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Step Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToPreviousStep}
                            disabled={currentStep === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Назад
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={goToNextStep}
                            disabled={currentStep === steps.length - 1}
                        >
                            Далее
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={completedSteps.has(currentStep) ? 'default' : 'outline'}
                            size="sm"
                            onClick={markStepComplete}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            {completedSteps.has(currentStep) ? 'Выполнено' : 'Отметить как выполнено'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Current Step */}
            <div className="step fade-in">
                <div className="step-header">
                    <div className="step-number">
                        {completedSteps.has(currentStep) ? (
                            <Check className="h-5 w-5" />
                        ) : (
                            currentStep + 1
                        )}
                    </div>
                    <h3>{currentStepData.title}</h3>
                </div>

                <div className="step-content">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Screenshot Section */}
                        {currentStepData.screenshot && (
                            <div className="screenshot-container">
                                <img
                                    src={currentStepData.screenshot}
                                    alt={`Шаг ${currentStep + 1} скриншот`}
                                    className="w-full h-auto"
                                />
                                
                                {/* Annotations */}
                                <div className="annotations">
                                    {currentStepData.annotations?.map((annotation, index) => (
                                        <div
                                            key={index}
                                            className={`callout callout--${annotation.type || 'red'}`}
                                            style={{
                                                left: `${annotation.x}px`,
                                                top: `${annotation.y}px`,
                                            }}
                                        >
                                            {annotation.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="step-description">
                            <div 
                                className="max-w-none text-foreground"
                                dangerouslySetInnerHTML={{ __html: currentStepData.content }}
                            />

                            {/* Code Block */}
                            {currentStepData.code && (
                                <div className="code-block mt-6">
                                    <div className="code-header">
                                        <span className="code-language">{currentStepData.code.language}</span>
                                        <button
                                            className="copy-button"
                                            onClick={() => copyToClipboard(currentStepData.code!.content)}
                                        >
                                            Копировать
                                        </button>
                                    </div>
                                    <div className="code-content">
                                        <code>{currentStepData.code.content}</code>
                                    </div>
                                </div>
                            )}

                            {/* Tips */}
                            {currentStepData.tips && currentStepData.tips.length > 0 && (
                                <div className="highlight-box info mt-6">
                                    <h4 className="font-semibold mb-2">💡 Советы:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {currentStepData.tips.map((tip, index) => (
                                            <li key={index} className="text-sm">{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="progress-indicator">
                {steps.map((_, index) => (
                    <div key={index} className="flex items-center">
                        <button
                            className={`progress-step ${
                                completedSteps.has(index) 
                                    ? 'completed' 
                                    : index === currentStep 
                                    ? 'active' 
                                    : 'pending'
                            }`}
                            onClick={() => setCurrentStep(index)}
                            title={`Шаг ${index + 1}: ${steps[index].title}`}
                        >
                            {completedSteps.has(index) ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                index + 1
                            )}
                        </button>
                        {index < steps.length - 1 && (
                            <div className={`progress-connector ${
                                completedSteps.has(index) ? 'completed' : ''
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepByStepGuide;