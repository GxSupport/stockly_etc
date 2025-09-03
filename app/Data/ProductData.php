<?php

namespace App\Data\Controller;

use Spatie\LaravelData\Data;

class ProductData extends Data
{
    public function __construct(
        public string $name,
        public string $warehouse,
        public string $measure,
        public float $price,
        public string $count,
        public string $nomenclature
    ){}
}
