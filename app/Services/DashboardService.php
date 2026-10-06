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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function getStatsByRole(User $user): array
    {
        return match ($user->type) {
            'admin' => $this->getAdminStats(),
            'director' => $this->getDirectorStats($user),
            'deputy_director' => $this->getDeputyDirectorStats($user),
            'buxgalter' => $this->getBuxgalterStats($user),
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
        $newUsersThisMonth = User::query()->where('created_at', '>=', $this->startOfMonth())->count();

        $roleNames = UserRoles::query()->pluck('name', 'title');

        $usersByRole = User::query()
            ->selectRaw('type, COUNT(*) as count')
            ->whereNotNull('type')
            ->groupBy('type')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'type' => $item->type,
                'name' => $roleNames[$item->type] ?? $item->type,
                'count' => (int) $item->count,
            ]);

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
                'new_this_month' => $newUsersThisMonth,
            ],
            'users_by_role' => $usersByRole,
            'documents' => [
                ...$this->statusBreakdown(Documents::query()),
                'this_month' => Documents::query()->where('created_at', '>=', $this->startOfMonth())->count(),
            ],
            'documents_by_type' => $this->documentsByType(Documents::query()),
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
    private function getDirectorStats(User $user): array
    {
        $awaitingQuery = DocumentPriority::query()->awaitingApprovalFor($user);

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
                'this_month' => Documents::query()->where('created_at', '>=', $this->startOfMonth())->count(),
            ],
            'documents_status' => $this->statusBreakdown(Documents::query()),
            'documents_by_type' => $this->documentsByType(Documents::query()),
            'recently_finished' => $recentlyFinished,
            'returned_count' => $returnedCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getDeputyDirectorStats(User $user): array
    {
        $awaitingQuery = DocumentPriority::query()->awaitingApprovalFor($user);

        $awaitingCount = $awaitingQuery->count();
        $awaitingDocuments = (clone $awaitingQuery)
            ->with(['document.document_type', 'document.user_info'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $approvedQuery = DocumentPriority::query()
            ->where('user_role', 'deputy_director')
            ->where('user_id', $user->id)
            ->where('is_success', true);

        $totalApproved = (clone $approvedQuery)->count();
        $approvedThisMonth = (clone $approvedQuery)->where('updated_at', '>=', $this->startOfMonth())->count();

        $recentlyProcessed = (clone $approvedQuery)
            ->with(['document.document_type', 'document.user_info'])
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn ($p) => $this->formatPriorityDocument($p));

        $returnedCount = DocumentReturned::query()
            ->where('from_id', $user->id)
            ->count();

        $approvedByType = $this->documentsByType(
            Documents::query()->whereIn('id', (clone $approvedQuery)->select('document_id'))
        );

        return [
            'awaiting_approval' => [
                'count' => $awaitingCount,
                'documents' => $awaitingDocuments,
            ],
            'total_approved' => $totalApproved,
            'approved_this_month' => $approvedThisMonth,
            'approved_by_type' => $approvedByType,
            'recently_processed' => $recentlyProcessed,
            'returned_count' => $returnedCount,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getBuxgalterStats(User $user): array
    {
        $awaitingQuery = DocumentPriority::query()->awaitingApprovalFor($user);

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
            'documents_status' => $this->statusBreakdown(Documents::query()),
            'documents_by_type' => $this->documentsByType(Documents::query()),
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

        $awaitingQuery = DocumentPriority::query()->awaitingApprovalFor($user);

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
            ->orderByDesc('documents_count')
            ->get(['id', 'name', 'phone', 'type']);

        return [
            'team_documents' => $this->statusBreakdown(Documents::query()->whereIn('user_id', $subordinateIds)),
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
        $ownQuery = Documents::query()->where('user_id', $user->id);

        $warehouse = $user->warehouse;

        $recentDocuments = (clone $ownQuery)
            ->with(['document_type'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        $pendingReturns = (clone $ownQuery)
            ->where('is_returned', 1)
            ->with(['document_type', 'notes'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($d) => $this->formatDocument($d));

        $awaitingQuery = DocumentPriority::query()->awaitingApprovalFor($user);

        return [
            'own_documents' => $this->statusBreakdown($ownQuery),
            'documents_by_type' => $this->documentsByType($ownQuery),
            'awaiting_approval' => [
                'count' => $awaitingQuery->count(),
                'documents' => (clone $awaitingQuery)
                    ->with(['document.document_type', 'document.user_info'])
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn ($p) => $this->formatPriorityDocument($p)),
            ],
            'warehouse' => $warehouse,
            'recent_documents' => $recentDocuments,
            'pending_returns' => $pendingReturns,
        ];
    }

    /**
     * Hujjatlarni holatlar bo'yicha bitta so'rovda sanaydi.
     *
     * @param  Builder<Documents>  $query
     * @return array{total: int, draft: int, sent: int, returned: int, finished: int}
     */
    private function statusBreakdown(Builder $query): array
    {
        $row = (clone $query)
            ->toBase()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN is_draft = 1 THEN 1 ELSE 0 END) as draft')
            ->selectRaw('SUM(CASE WHEN is_draft = 0 AND is_finished = 0 AND is_returned = 0 THEN 1 ELSE 0 END) as sent')
            ->selectRaw('SUM(CASE WHEN is_returned = 1 THEN 1 ELSE 0 END) as returned')
            ->selectRaw('SUM(CASE WHEN is_finished = 1 THEN 1 ELSE 0 END) as finished')
            ->first();

        return [
            'total' => (int) ($row->total ?? 0),
            'draft' => (int) ($row->draft ?? 0),
            'sent' => (int) ($row->sent ?? 0),
            'returned' => (int) ($row->returned ?? 0),
            'finished' => (int) ($row->finished ?? 0),
        ];
    }

    /**
     * @param  Builder<Documents>  $query
     * @return list<array{type: int, title: string, count: int}>
     */
    private function documentsByType(Builder $query): array
    {
        $counts = (clone $query)
            ->selectRaw('type, COUNT(*) as documents_count')
            ->groupBy('type')
            ->orderByDesc('documents_count')
            ->pluck('documents_count', 'type');

        $titles = DocumentType::query()->whereIn('id', $counts->keys())->pluck('title', 'id');

        return $counts
            ->map(fn ($count, $type) => [
                'type' => (int) $type,
                'title' => $titles[$type] ?? 'Неизвестный тип',
                'count' => (int) $count,
            ])
            ->values()
            ->all();
    }

    private function startOfMonth(): Carbon
    {
        return now()->startOfMonth();
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
