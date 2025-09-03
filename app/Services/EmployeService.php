<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserRoles;
use App\Models\UserWarehouse;
use Illuminate\Database\Eloquent\Collection;

class EmployeService
{
    public function list($page,$perPage,$search = null)
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
    public function createEmployee(array $data): User
    {
        $user = new User();
        $user->name = $data['name'];
        $user->phone = $data['phone'];
        $user->password = bcrypt($data['password']);
        $user->type = $data['role_id'];
        $user->dep_code = $data['dep_code'];
        $user->save();
        if ($user->type == 'frp') {
            $warehouse_id = $data['dep_code'];
            $this->addOrCheckUserWarehouse($user->id, $warehouse_id);
        }
        (new SmsService($user->phone, $this->generateOtpMessage(
            $data['phone'],
            $data['password']
        )))->sendSms();

        return $user;
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
        $u_warehouse = new UserWarehouse();
        $u_warehouse->user_id = $user_id;
        $u_warehouse->warehouse_id = $warehouse_id;
        $u_warehouse->save();
    }


}
