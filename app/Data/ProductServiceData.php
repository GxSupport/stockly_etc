<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class ProductServiceData extends Data
{
    public function __construct(
        public ?string $name,
        public ?string $cost_balance,
        public ?string $quantity_balance,
        public ?string $deprecation_balance,
        public ?string $revaluation_balance,
        public ?string $organization,
//        public ?string $warehouse_frp,
        public ?string $account,
        public ?string $deprecation_account,
        public ?string $basic_resource_code,
        public ?string $warehouse_code,
        public ?string $frp_code,
        public ?string $organization_code
    ){}
}
