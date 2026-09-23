<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\StoreRequest;
use App\Http\Requests\Employee\UpdateRequest;
use App\Models\User;
use App\Services\DepListService;
use App\Services\EmployeService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeController extends Controller
{
    public function __construct(
        protected EmployeService $employeService,
        protected DepListService $depListService
    ) {}

    public function index(Request $request)
    {
        $list = $this->employeService->list(
            $request->input('page', 1),
            $request->input('perPage', 10),
            $request->input('search', null)
        );

        $roleStatistics = $this->employeService->getRoleStatistics();

        return Inertia::render('employees', [
            'employees' => $list['data'],
            'total' => $list['total'],
            'page' => $list['page'],
            'perPage' => $list['perPage'],
            'search' => $request->input('search', null),
            'roleStatistics' => $roleStatistics,
        ]);
    }

    public function create()
    {
        $dep_list = $this->depListService->getDepList();
        $supervisors = $this->employeService->getSeniorList();

        return Inertia::render('employees/create', [
            'dep_list' => $dep_list,
            'supervisors' => $supervisors,
        ]);
    }

    /**
     * @throws Exception
     */
    public function store(StoreRequest $request)
    {
        $data = $request->validated();
        $data['phone'] = preg_replace('/\D/', '', $data['phone']);

        $exists = $this->employeService->getEmployeeByPhone($data['phone']);
        if ($exists) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Пользователь с таким телефоном уже существует');
        }
        $user = $this->employeService->createEmployee($data);
        if (! $user) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Ошибка при создании сотрудника');
        }

        return redirect()
            ->route('employees.index')
            ->with('success', 'Сотрудник успешно создан');
    }

    public function show(User $employee)
    {
        return Inertia::render('employees/show', [
            'employee' => $employee->load('role'),
        ]);
    }

    public function edit(User $employee)
    {
        $dep_list = $this->depListService->getDepList();
        $senior_list = $this->employeService->getSeniorList();

        return Inertia::render('employees/edit', [
            'employee' => $employee->load('warehouse'),
            'dep_list' => $dep_list,
            'senior_list' => $senior_list,
        ]);
    }

    public function searchWarehouses(Request $request): JsonResponse
    {
        $search = (string) $request->input('search', '');
        $limit = min(max(1, (int) $request->input('limit', 20)), 50);
        $page = max(0, (int) $request->input('page', 0));

        $warehouses = $this->employeService->searchWarehouses($search, $limit, $page);

        return response()->json($warehouses);
    }

    public function update(UpdateRequest $request, User $employee)
    {
        try {
            $data = $request->validated();
            if (isset($data['phone'])) {
                $data['phone'] = preg_replace('/\D/', '', $data['phone']);
            }

            $this->employeService->updateEmployee($employee, $data);

            return redirect()
                ->route('employees.index')
                ->with('success', 'Сотрудник успешно обновлен');
        } catch (Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(User $employee)
    {
        $this->employeService->deleteEmployee($employee);

        return redirect()
            ->route('employees.index')
            ->with('success', 'Сотрудник успешно удален');
    }
}
