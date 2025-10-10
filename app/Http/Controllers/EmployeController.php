<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\StoreRequest;
use App\Http\Requests\Employee\UpdateRequest;
use App\Models\User;
use App\Services\DepListService;
use App\Services\EmployeService;
use Exception;
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
        $roles_list = $this->employeService->getRoleList();
        $warehouses = $this->employeService->getWarehouseList();
        $supervisors = $this->employeService->getSeniorList();

        return Inertia::render('employees/create', [
            'dep_list' => $dep_list,
            'roles_list' => $roles_list,
            'warehouses' => $warehouses,
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
        $roles_list = $this->employeService->getRoleList();
        $senior_list = $this->employeService->getSeniorList();

        return Inertia::render('employees/edit', [
            'employee' => $employee->load(['role', 'warehouse']),
            'dep_list' => $dep_list,
            'roles_list' => $roles_list,
            'senior_list' => $senior_list,
        ]);
    }

    public function searchWarehouses(Request $request)
    {
        $search = $request->input('search', '');
        $limit = $request->input('limit', 10);

        $warehouses = $this->employeService->searchWarehouses($search, $limit);

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
        } catch (\Exception $e) {
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
