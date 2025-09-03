<?php

namespace App\Http\Controllers;

use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Services\DepListService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function __construct(
        protected DepListService $depListService
    )
    {
    }

    public function index(Request $request)
    {
        $list = $this->depListService->list(
            $request->input('page', 1),
            $request->input('perPage', 10),
            $request->input('search', null)
        );

        return Inertia::render('departments', [
            'departments' => $list['data'],
            'total' => $list['total'],
            'page' => $list['page'],
            'perPage' => $list['perPage'],
            'search' => $request->input('search', null)
        ]);
    }

    public function create()
    {
        return Inertia::render('departments/create');
    }

    public function store(StoreDepartmentRequest $request)
    {
        $data = $request->validated();
        
        $this->depListService->create($data);
        
        return redirect()
            ->route('departments.index')
            ->with('success', 'Отдел успешно создан');
    }
}