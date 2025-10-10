<?php

namespace App\Services;

use App\Models\DepList;
use App\Models\Employee;
use App\Models\User;
use App\Models\UserRoles;
use App\Models\UserWarehouse;
use App\Models\Warehouse;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;

class EmployeService
{
    public function list($page, $perPage, $search = null)
    {
        $query = User::query();
        $query->with(['role']);
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $total = $query->count();
        $employees = $query->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->orderBy('id', 'desc')
            ->get();

        return [
            'data' => $employees,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ];
    }

    public function getRoleList(): Collection
    {
        return UserRoles::all();
    }

    /**
     * @throws Exception
     */
    public function createEmployee(array $data): User
    {

        if ($data['dep_code']) {
            $this->checkDepCode($data['dep_code']);
        }

        $user = User::query()->create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'password' => bcrypt($data['password']),
            'type' => $data['role_id'],
            'dep_code' => $data['dep_code'],
            'senior_id' => $data['senior_id'] ?? null,
        ]);

        if ($user['type'] == 'frp' && isset($data['warehouse_id'])) {
            $this->addOrCheckUserWarehouse($user->id, $data['warehouse_id']);
        }

        (new SmsService($user->phone, $this->generateOtpMessage(
            $data['phone'],
            $data['password']
        )))->sendSms();

        return $user;
    }

    //    public function checkDepCode(string $dep_code): void
    //    {
    //        $dep = DepList::where([
    //            'dep_code' => $dep_code,
    //            'is_active' => true,
    //        ])->first();
    //
    //        if (is_null($dep)) {
    //            throw new \Exception('Department code does not exist or is inactive.');
    //        }
    //    }

    public function getEmployeeById($id): ?User
    {
        return User::where('id', $id)->first();
    }

    public function getEmployeeByPhone($phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function generateOtpMessage($phone, $password): string
    {
        return "https://stockly.uz saytiga kirish uchun login:  $phone, parol: $password
Для входа в сайт введите Логин: $phone, Пароль: $password. https://stockly.uz Учета движения ТМЦ";
    }

    public function addOrCheckUserWarehouse($user_id, $warehouse_id): void
    {
        $this->deleteOldUserWarehouse($user_id);
        $this->saveUserWarehouse($user_id, $warehouse_id);
    }

    public function deleteOldUserWarehouse($user_id): void
    {
        UserWarehouse::query()->where('user_id', $user_id)->delete();
    }

    public function saveUserWarehouse($user_id, $warehouse_id): void
    {
        //        $u_warehouse = new UserWarehouse;
        //        $u_warehouse->user_id = $user_id;
        //        $u_warehouse->warehouse_id = $warehouse_id;
        //        $u_warehouse->save();
        UserWarehouse::query()->create([
            'user_id' => $user_id,
            'warehouse_id' => $warehouse_id,
        ]);
    }

    public function updateEmployee(User $employee, array $data): User
    {
        try {
            // Validate department code if provided
            if (isset($data['dep_code']) && ! empty($data['dep_code'])) {
                $this->checkDepCode($data['dep_code']);
            }

            // Update basic fields with proper empty checks
            if (isset($data['name']) && ! empty($data['name'])) {
                $employee->name = $data['name'];
            }

            if (isset($data['phone']) && ! empty($data['phone'])) {
                $employee->phone = $data['phone'];
            }

            if (isset($data['password']) && ! empty($data['password'])) {
                $employee->password = bcrypt($data['password']);
            }

            if (isset($data['role_id']) && ! empty($data['role_id'])) {
                $employee->type = $data['role_id'];
            }

            if (isset($data['dep_code']) && ! empty($data['dep_code'])) {
                $employee->dep_code = $data['dep_code'];
            }

            if (isset($data['chat_id'])) {
                $employee->chat_id = $data['chat_id'];
            }

            if (isset($data['type']) && ! empty($data['type'])) {
                $employee->type = $data['type'];
            }

            if (isset($data['senior_id'])) {
                $employee->senior_id = $data['senior_id'];
            }

            if (isset($data['is_active'])) {
                $employee->is_active = $data['is_active'];
            }

            $employee->save();

            // Handle warehouse assignment logic
            $currentType = $employee->type;

            // If user is 'frp' type, handle warehouse assignment
            if ($currentType === 'frp') {
                if (! empty($data['warehouse_id'])) {
                    $this->addOrCheckUserWarehouse($employee->id, $data['warehouse_id']);
                }
            } else {
                // Remove warehouse assignment if user type is not 'frp'
                $this->deleteOldUserWarehouse($employee->id);
            }

            return $employee;

        } catch (QueryException $e) {
            throw new \Exception('Database error occurred while updating employee: '.$e->getMessage());
        }
    }

    public function checkDepCode(string $dep_code): void
    {
        $dep = DepList::where([
            'dep_code' => $dep_code,
            'is_active' => true,
        ])->first();

        if (is_null($dep)) {
            throw new \Exception('Department code does not exist or is inactive.');
        }
    }

    public function deleteEmployee(User $employee): bool
    {
        // Delete associated warehouse assignments
        $this->deleteOldUserWarehouse($employee->id);

        // Delete the employee
        return $employee->delete();
    }

    public function getWarehouseList(): Collection
    {
        return \App\Models\Warehouse::all();
    }

    public function searchWarehouses(string $search = '', int $limit = 10): Collection
    {
        $query = \App\Models\Warehouse::query()
            ->where('is_active', true)
            ->select(['id', 'code', 'title']);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        return $query->limit($limit)->get();
    }

    public function getSeniorList(): Collection
    {
        return User::where('is_active', 1)->
        where('type', 'header_frp')
            ->get(['id', 'name']);
    }

    public function getRoleStatistics()
    {
        return User::query()
            ->selectRaw('type, COUNT(*) as count')
            ->whereNotNull('type')
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                // Load role relationship for each group
                $role = UserRoles::where('title', $item->type)->first();

                return [
                    'role_id' => $item->type,
                    'role_name' => $role?->name ?? 'Не указано',
                    'count' => $item->count,
                ];
            });
    }
}
