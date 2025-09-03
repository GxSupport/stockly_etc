<?php

namespace App\Http\Controllers;

use App\Http\Requests\Employee\StoreRequest;
use App\Services\DepListService;
use App\Services\EmployeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeController extends Controller
{
    public function __construct(
        protected EmployeService $employeService,
        protected DepListService $depListService
    )
    {
    }
    public function index(Request $request){
        $list=$this->employeService->list(
            $request->input('page',1),
            $request->input('perPage',10),
            $request->input('search',null)
        );
        return Inertia::render('employees',[
            'employees'=>$list['data'],
            'total'=>$list['total'],
            'page'=>$list['page'],
            'perPage'=>$list['perPage'],
            'search'=>$request->input('search',null)
        ]);
    }

    public function create(){
        $dep_list=$this->depListService->getDepList();
        $roles_list=$this->employeService->getRoleList();
        return Inertia::render('employees/create',[
            'dep_list'=>$dep_list,
            'roles_list'=>$roles_list
        ]);
    }
    public function store(StoreRequest $request){
        $data=$request->validated();
        $data['phone']=preg_replace('/\D/','',$data['phone']);
        $this->employeService->createEmployee($data);
        return redirect()
            ->route('employees.index')
            ->with('success','Сотрудник успешно создан');

    }
}
