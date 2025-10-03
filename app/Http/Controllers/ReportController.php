<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('reports');
    }

    public function products(): Response
    {
        return Inertia::render('reports/products', [
            'date' => date('d.m.Y'),
        ]);
    }
}
