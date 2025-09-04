<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class CompositionData extends Data
{
    public function __construct(
        public string $account_dt,
        public string $account_kt,
        public string $subconto_dt1,
        public string $subconto_kt1,
        public string $subconto_kt3,
        public float $sum_turnover,
        public float $quantity_turnover_kt
    ) {}
}
