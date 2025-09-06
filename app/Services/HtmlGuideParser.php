<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class HtmlGuideParser
{
    public function parseFile(string $filePath): ?array
    {
        if (!File::exists($filePath)) {
            return null;
        }

        $content = File::get($filePath);
        $fileName = pathinfo($filePath, PATHINFO_FILENAME);
        
        $metadata = $this->extractMetadata($content);
        $cleanContent = $this->extractBody($content);
        
        return [
            'slug' => $this->generateSlug($fileName),
            'title' => $metadata['title'] ?? $this->generateTitleFromFilename($fileName),
            'description' => $metadata['description'] ?? 'Руководство пользователя для работы с системой',
            'difficulty' => $metadata['difficulty'] ?? 'Начальный',
            'icon' => $metadata['icon'] ?? 'BookOpen',
            'category' => $metadata['category'] ?? 'Общие',
            'estimatedTime' => $metadata['estimatedTime'] ?? '5 мин',
            'lastModified' => date('Y-m-d', filemtime($filePath)),
            'content' => $cleanContent,
            'type' => 'html',
        ];
    }

    public function extractMetadata(string $htmlContent): array
    {
        $metadata = [];
        
        // Extract metadata from JSON-LD script tag
        if (preg_match('/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s', $htmlContent, $matches)) {
            $jsonData = json_decode($matches[1], true);
            if ($jsonData && isset($jsonData['guide'])) {
                $metadata = array_merge($metadata, $jsonData['guide']);
            }
        }
        
        // Extract metadata from HTML meta tags with guide: prefix
        if (preg_match_all('/<meta name="guide:([^"]+)" content="([^"]*)"[^>]*>/i', $htmlContent, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $metadata[$match[1]] = $match[2];
            }
        }
        
        // Extract standard meta tags
        if (preg_match('/<meta name="description" content="([^"]*)"[^>]*>/i', $htmlContent, $matches)) {
            $metadata['description'] = $matches[1];
        }
        
        // Extract title from title tag if not found in metadata
        if (!isset($metadata['title']) && preg_match('/<title[^>]*>(.*?)<\/title>/i', $htmlContent, $matches)) {
            $metadata['title'] = trim($matches[1]);
        }
        
        return $metadata;
    }

    public function extractBody(string $htmlContent): string
    {
        // Extract content from body tag or return processed content
        if (preg_match('/<body[^>]*>(.*?)<\/body>/s', $htmlContent, $matches)) {
            return trim($matches[1]);
        }
        
        // If no body tag, clean up the content
        $content = $this->cleanHtmlContent($htmlContent);
        
        return trim($content);
    }

    public function addHeadingIds(string $html): string
    {
        // Add IDs to headings for navigation
        return preg_replace_callback(
            '/<h([1-6])(?:\s+[^>]*)?>([^<]*)<\/h[1-6]>/i',
            function ($matches) {
                $level = $matches[1];
                $title = strip_tags($matches[2]);
                $id = $this->generateHeadingId($title);

                return "<h{$level} id=\"{$id}\">{$matches[2]}</h{$level}>";
            },
            $html
        );
    }

    public function generateTableOfContents(string $htmlContent): array
    {
        $headings = [];
        $dom = new \DOMDocument();
        
        // Suppress errors for malformed HTML
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">' . $htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        
        $xpath = new \DOMXPath($dom);
        $headingElements = $xpath->query('//h1 | //h2 | //h3 | //h4 | //h5 | //h6');
        
        foreach ($headingElements as $heading) {
            $level = intval(substr($heading->tagName, 1));
            $title = trim($heading->textContent);
            $id = $heading->getAttribute('id') ?: $this->generateHeadingId($title);
            
            // Skip if empty title or metadata content
            if ($title && !str_contains($title, ':') && strlen($title) > 2) {
                $headings[] = [
                    'level' => $level,
                    'title' => $title,
                    'id' => $id,
                ];
            }
        }
        
        return $headings;
    }

    private function cleanHtmlContent(string $content): string
    {
        // Remove unwanted tags but keep content structure
        $content = preg_replace('/<script[^>]*>.*?<\/script>/s', '', $content);
        $content = preg_replace('/<style[^>]*>.*?<\/style>/s', '', $content);
        $content = preg_replace('/<meta[^>]*>/i', '', $content);
        $content = preg_replace('/<title[^>]*>.*?<\/title>/i', '', $content);
        $content = preg_replace('/<!DOCTYPE[^>]*>/i', '', $content);
        $content = preg_replace('/<html[^>]*>/i', '', $content);
        $content = preg_replace('/<\/html>/i', '', $content);
        $content = preg_replace('/<head[^>]*>.*?<\/head>/s', '', $content);
        
        return $content;
    }

    private function generateHeadingId(string $title): string
    {
        // Convert to lowercase and remove unwanted characters
        $id = mb_strtolower($title, 'UTF-8');
        
        // Replace spaces and special characters with hyphens
        $id = preg_replace('/[^\p{L}\p{N}\s-]/u', '', $id);
        $id = preg_replace('/\s+/', '-', $id);
        $id = preg_replace('/-+/', '-', $id);
        $id = trim($id, '-');
        
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
        
        // Replace common patterns with Russian equivalents
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