<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected DashboardService $dashboardService) {}

    public function index(): Response
    {
        $user = auth()->user();
        $stats = $this->dashboardService->getStatsByRole($user);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'userRole' => $user->type,
        ]);
    }
}
