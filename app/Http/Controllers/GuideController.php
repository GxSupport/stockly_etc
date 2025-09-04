<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use ParsedownExtra;

class GuideController extends Controller
{
    private string $guidesPath;

    public function __construct()
    {
        $this->guidesPath = resource_path('docs/guides');
    }

    public function index()
    {
        $guides = $this->discoverGuides();

        return Inertia::render('user-guides/index', [
            'guides' => $guides,
        ]);
    }

    public function show(string $slug)
    {
        $guide = $this->getGuideBySlug($slug);

        if (! $guide) {
            abort(404, 'Руководство не найдено');
        }

        $parsedown = new ParsedownExtra;
        $parsedown->setSafeMode(false); // Disable safe mode to allow proper HTML rendering
        $parsedown->setMarkupEscaped(false); // Don't escape HTML
        $parsedown->setUrlsLinked(true); // Enable automatic URL linking

        $content = $parsedown->text($guide['content']);

        // Add IDs to headings for table of contents navigation
        $content = $this->addHeadingIds($content);

        return Inertia::render('user-guides/show', [
            'guide' => array_merge($guide, ['content' => $content]),
        ]);
    }

    private function discoverGuides(): array
    {
        $guides = [];

        if (! File::exists($this->guidesPath)) {
            File::makeDirectory($this->guidesPath, 0755, true);
        }

        $files = File::files($this->guidesPath);

        foreach ($files as $file) {
            if ($file->getExtension() === 'md') {
                $guide = $this->parseGuideFile($file);
                if ($guide) {
                    $guides[] = $guide;
                }
            }
        }

        // Sort by title
        usort($guides, fn ($a, $b) => strcmp($a['title'], $b['title']));

        return $guides;
    }

    private function parseGuideFile($file): ?array
    {
        $content = File::get($file);
        $fileName = $file->getFilenameWithoutExtension();

        // Extract metadata from content
        $metadata = $this->extractMetadata($content);
        // Remove YAML frontmatter from content
        $cleanContent = $this->stripFrontmatter($content);
        $slug = $this->generateSlug($fileName);

        return [
            'slug' => $slug,
            'title' => $metadata['title'] ?? $this->generateTitleFromFilename($fileName),
            'description' => $metadata['description'] ?? 'Руководство пользователя для работы с системой',
            'difficulty' => $metadata['difficulty'] ?? 'Начальный',
            'icon' => $metadata['icon'] ?? 'BookOpen',
            'category' => $metadata['category'] ?? 'Общие',
            'estimatedTime' => $metadata['estimatedTime'] ?? '5 мин',
            'lastModified' => date('Y-m-d', $file->getMTime()),
            'content' => $cleanContent,
        ];
    }

    private function getGuideBySlug(string $slug): ?array
    {
        $guides = $this->discoverGuides();

        return collect($guides)->first(fn ($guide) => $guide['slug'] === $slug);
    }

    private function extractMetadata(string $content): array
    {
        $metadata = [];

        // Simple metadata extraction from YAML frontmatter or markdown comments
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n/s', $content, $matches)) {
            $yamlContent = $matches[1];
            $lines = explode("\n", $yamlContent);

            foreach ($lines as $line) {
                if (preg_match('/^(\w+):\s*(.+)$/', trim($line), $lineMatches)) {
                    $metadata[$lineMatches[1]] = trim($lineMatches[2], '"\'');
                }
            }
        }

        return $metadata;
    }

    private function stripFrontmatter(string $content): string
    {
        // Remove YAML frontmatter from content
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n/s', $content)) {
            $content = preg_replace('/^---\s*\n(.*?)\n---\s*\n/s', '', $content);
        }

        // Trim any leading whitespace
        return trim($content);
    }

    private function addHeadingIds(string $html): string
    {
        // Add IDs to headings for navigation
        return preg_replace_callback(
            '/<h([1-6])>(.*?)<\/h[1-6]>/',
            function ($matches) {
                $level = $matches[1];
                $title = strip_tags($matches[2]);
                $id = $this->generateHeadingId($title);

                return "<h{$level} id=\"{$id}\">{$matches[2]}</h{$level}>";
            },
            $html
        );
    }

    private function generateHeadingId(string $title): string
    {
        // Convert to lowercase and remove unwanted characters
        $id = mb_strtolower($title, 'UTF-8');

        // Replace spaces and special characters with hyphens
        $id = preg_replace('/[^\p{L}\p{N}\s-]/u', '', $id); // Keep only letters, numbers, spaces, and hyphens
        $id = preg_replace('/\s+/', '-', $id); // Replace spaces with hyphens
        $id = preg_replace('/-+/', '-', $id); // Replace multiple hyphens with single hyphen
        $id = trim($id, '-'); // Remove leading/trailing hyphens

        return $id;
    }

    private function generateSlug(string $filename): string
    {
        return strtolower(str_replace(['_', ' '], '-', $filename));
    }

    private function generateTitleFromFilename(string $filename): string
    {
        // Convert filename to readable title
        $title = str_replace(['_', '-'], ' ', $filename);
        $title = ucwords($title);

        // Replace common patterns
        $replacements = [
            'User Guide' => 'Руководство пользователя',
            'Management' => 'Управление',
            'Employee' => 'Сотрудники',
            'Document' => 'Документы',
            'Warehouse' => 'Склады',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $title);
    }
}
