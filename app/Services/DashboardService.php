<?php

namespace App\Services;

use App\Models\DepList;
use App\Models\DocumentPriority;
use App\Models\DocumentReturned;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\Warehouse;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function getStatsByRole(User $user): array
    {
        return match ($user->type) {
            'admin' => $this->getAdminStats(),
            'director' => $this->getDirectorStats(),
            'deputy_director' => $this->getDeputyDirectorStats($user),
            'buxgalter' => $this->getBuxgalterStats(),
            'header_frp' => $this->getHeaderFrpStats($user),
            'frp' => $this->getFrpStats($user),
            default => [],
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function getAdminStats(): array
    {
        $totalUsers = User::query()->count();
        $activeUsers = User::query()->where('is_active', 1)->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        $usersByRole = User::query()
            ->selectRaw('type, COUNT(*) as count')
            ->whereNotNull('type')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $role = UserRoles::query()->where('title', $item->type)->first();

                return [
                    'type' => $item->type,
                    'name' => $role?->name ?? $item->type,
                    'count' => $item->count,
                ];
            });

        $totalDocuments = Documents::query()->count();
        $draftDocuments = Documents::query()->where('is_draft', 1)->count();
        $sentDocuments = Documents::query()->where('is_draft', 0)->where('is_finished', 0)->where('is_returned', 0)->count();
        $returnedDocuments = Documents::query()->where('is_returned', 1)->count();
        $finishedDocuments = Documents::query()->where('is_finished', 1)->count();

        $recentUsers = User::query()
            ->with('role')
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'phone', 'type', 'created_at']);

        return [
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'inactive' => $inactiveUsers,
            ],
            'users_by_role' => $usersByRole,
            'documents' => [
                'total' => $totalDocuments,
                'draft' => $draftDocuments,
                'sent' => $sentDocuments,
                'returned' => $returnedDocuments,
                'finished' => $finishedDocuments,
            ],
            'recent_users' => $recentUsers,
            'system' => [
                'warehouses' => Warehouse::query()->count(),
                'departments' => DepList::query()->count(),
                'document_types' => DocumentType::query()->count(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getDirectorStats(): array
    {
        $awaitingQuery = DocumentPriority::query()
            ->where('user_role', 'director')
            ->where('is_success', false)
            ->where('is_active', 1)
            ->whereHas('document', function ($q) {
                $q->where('is_draft', 0)->where('is_returned', 0);
            })
            ->whereRaw('ordering = (SELECT status FROM documents WHERE documents.id = document_priority.document_id)');

        $awaitingCount = $awaitingQuery->count();
        $awaitingDocuments = (clone $awaitingQuery)
            ->with(['document.document_type', 'document.user_info'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $totalDocuments = Documents::query()->count();
        $finishedDocuments = Documents::query()->where('is_finished', 1)->count();
        $inProgressDocuments = Documents::query()->where('is_finished', 0)->where('is_draft', 0)->count();

        $documentsByType = Documents::query()
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $docType = DocumentType::query()->find($item->type);

                return [
                    'type' => $item->type,
                    'title' => $docType?->title ?? 'Неизвестный тип',
                    'count' => $item->count,
                ];
            });

        $recentlyFinished = Documents::query()
            ->where('is_finished', 1)
            ->with(['document_type', 'user_info'])
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        $returnedCount = Documents::query()->where('is_returned', 1)->count();

        return [
            'awaiting_approval' => [
                'count' => $awaitingCount,
                'documents' => $awaitingDocuments,
            ],
            'documents_total' => [
                'total' => $totalDocuments,
                'finished' => $finishedDocuments,
                'in_progress' => $inProgressDocuments,
            ],
            'documents_by_type' => $documentsByType,
            'recently_finished' => $recentlyFinished,
            'returned_count' => $returnedCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getDeputyDirectorStats(User $user): array
    {
        $awaitingQuery = DocumentPriority::query()
            ->where('user_role', 'deputy_director')
            ->where('user_id', $user->id)
            ->where('is_success', false)
            ->where('is_active', 1)
            ->whereHas('document', function ($q) {
                $q->where('is_draft', 0)->where('is_returned', 0);
            })
            ->whereRaw('ordering = (SELECT status FROM documents WHERE documents.id = document_priority.document_id)');

        $awaitingCount = $awaitingQuery->count();
        $awaitingDocuments = (clone $awaitingQuery)
            ->with(['document.document_type', 'document.user_info'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $totalApproved = DocumentPriority::query()
            ->where('user_role', 'deputy_director')
            ->where('user_id', $user->id)
            ->where('is_success', true)
            ->count();

        $recentlyProcessed = DocumentPriority::query()
            ->where('user_role', 'deputy_director')
            ->where('user_id', $user->id)
            ->where('is_success', true)
            ->with(['document.document_type', 'document.user_info'])
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $returnedCount = DocumentReturned::query()
            ->where('from_id', $user->id)
            ->count();

        return [
            'awaiting_approval' => [
                'count' => $awaitingCount,
                'documents' => $awaitingDocuments,
            ],
            'total_approved' => $totalApproved,
            'recently_processed' => $recentlyProcessed,
            'returned_count' => $returnedCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getBuxgalterStats(): array
    {
        $awaitingQuery = DocumentPriority::query()
            ->where('user_role', 'buxgalter')
            ->where('is_success', false)
            ->where('is_active', 1)
            ->whereHas('document', function ($q) {
                $q->where('is_draft', 0)->where('is_returned', 0);
            })
            ->whereRaw('ordering = (SELECT status FROM documents WHERE documents.id = document_priority.document_id)');

        $awaitingCount = $awaitingQuery->count();
        $awaitingDocuments = (clone $awaitingQuery)
            ->with(['document.document_type', 'document.user_info'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $totalProcessed = DocumentPriority::query()
            ->where('user_role', 'buxgalter')
            ->where('is_success', true)
            ->count();

        $documentsByType = Documents::query()
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $docType = DocumentType::query()->find($item->type);

                return [
                    'type' => $item->type,
                    'title' => $docType?->title ?? 'Неизвестный тип',
                    'count' => $item->count,
                ];
            });

        $finishedTotalAmount = Documents::query()
            ->where('is_finished', 1)
            ->sum('total_amount');

        $inProgressTotalAmount = Documents::query()
            ->where('is_finished', 0)
            ->where('is_draft', 0)
            ->sum('total_amount');

        $recentlyFinished = Documents::query()
            ->where('is_finished', 1)
            ->with(['document_type', 'user_info'])
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        return [
            'awaiting_approval' => [
                'count' => $awaitingCount,
                'documents' => $awaitingDocuments,
            ],
            'total_processed' => $totalProcessed,
            'documents_by_type' => $documentsByType,
            'financial_summary' => [
                'finished_amount' => $finishedTotalAmount,
                'in_progress_amount' => $inProgressTotalAmount,
            ],
            'recently_finished' => $recentlyFinished,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getHeaderFrpStats(User $user): array
    {
        $subordinateIds = User::query()
            ->where('senior_id', $user->id)
            ->pluck('id');

        $teamTotal = Documents::query()->whereIn('user_id', $subordinateIds)->count();
        $teamDraft = Documents::query()->whereIn('user_id', $subordinateIds)->where('is_draft', 1)->count();
        $teamSent = Documents::query()->whereIn('user_id', $subordinateIds)->where('is_draft', 0)->where('is_finished', 0)->where('is_returned', 0)->count();
        $teamReturned = Documents::query()->whereIn('user_id', $subordinateIds)->where('is_returned', 1)->count();
        $teamFinished = Documents::query()->whereIn('user_id', $subordinateIds)->where('is_finished', 1)->count();

        $awaitingQuery = DocumentPriority::query()
            ->where('user_role', 'header_frp')
            ->where('user_id', $user->id)
            ->where('is_success', false)
            ->where('is_active', 1)
            ->whereHas('document', function ($q) {
                $q->where('is_draft', 0)->where('is_returned', 0);
            })
            ->whereRaw('ordering = (SELECT status FROM documents WHERE documents.id = document_priority.document_id)');

        $awaitingCount = $awaitingQuery->count();
        $awaitingDocuments = (clone $awaitingQuery)
            ->with(['document.document_type', 'document.user_info'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $ownTotal = Documents::query()->where('user_id', $user->id)->count();
        $ownDraft = Documents::query()->where('user_id', $user->id)->where('is_draft', 1)->count();
        $ownFinished = Documents::query()->where('user_id', $user->id)->where('is_finished', 1)->count();

        $teamMembers = User::query()
            ->where('senior_id', $user->id)
            ->withCount('documents')
            ->get(['id', 'name', 'phone', 'type']);

        return [
            'team_documents' => [
                'total' => $teamTotal,
                'draft' => $teamDraft,
                'sent' => $teamSent,
                'returned' => $teamReturned,
                'finished' => $teamFinished,
            ],
            'awaiting_approval' => [
                'count' => $awaitingCount,
                'documents' => $awaitingDocuments,
            ],
            'own_documents' => [
                'total' => $ownTotal,
                'draft' => $ownDraft,
                'finished' => $ownFinished,
            ],
            'team_members' => $teamMembers,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getFrpStats(User $user): array
    {
        $ownTotal = Documents::query()->where('user_id', $user->id)->count();
        $ownDraft = Documents::query()->where('user_id', $user->id)->where('is_draft', 1)->count();
        $ownSent = Documents::query()->where('user_id', $user->id)->where('is_draft', 0)->where('is_finished', 0)->where('is_returned', 0)->count();
        $ownReturned = Documents::query()->where('user_id', $user->id)->where('is_returned', 1)->count();
        $ownFinished = Documents::query()->where('user_id', $user->id)->where('is_finished', 1)->count();

        $warehouse = $user->warehouse;

        $recentDocuments = Documents::query()
            ->where('user_id', $user->id)
            ->with(['document_type'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        $pendingReturns = Documents::query()
            ->where('user_id', $user->id)
            ->where('is_returned', 1)
            ->with(['document_type', 'notes'])
            ->latest()
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        return [
            'own_documents' => [
                'total' => $ownTotal,
                'draft' => $ownDraft,
                'sent' => $ownSent,
                'returned' => $ownReturned,
                'finished' => $ownFinished,
            ],
            'warehouse' => $warehouse,
            'recent_documents' => $recentDocuments,
            'pending_returns' => $pendingReturns,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatDocument(Documents $document): array
    {
        return [
            'id' => $document->id,
            'number' => $document->number,
            'type_title' => $document->document_type?->title ?? 'Неизвестный тип',
            'total_amount' => $document->total_amount,
            'is_finished' => $document->is_finished,
            'is_draft' => $document->is_draft,
            'is_returned' => $document->is_returned,
            'user_name' => $document->user_info?->name ?? '',
            'created_at' => $document->created_at?->format('d.m.Y'),
            'updated_at' => $document->updated_at?->format('d.m.Y'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatPriorityDocument(DocumentPriority $priority): array
    {
        $doc = $priority->document;

        return [
            'id' => $doc?->id,
            'number' => $doc?->number,
            'type_title' => $doc?->document_type?->title ?? 'Неизвестный тип',
            'total_amount' => $doc?->total_amount,
            'is_finished' => $doc?->is_finished,
            'is_draft' => $doc?->is_draft,
            'is_returned' => $doc?->is_returned,
            'user_name' => $doc?->user_info?->name ?? '',
            'created_at' => $doc?->created_at?->format('d.m.Y'),
            'updated_at' => $doc?->updated_at?->format('d.m.Y'),
        ];
    }
}
