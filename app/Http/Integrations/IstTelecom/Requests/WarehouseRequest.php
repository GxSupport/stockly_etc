<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use Saloon\Enums\Method;
use Saloon\Http\Request;

class WarehouseRequest extends Request
{
    protected Method $method = Method::GET;

    protected string $code;

    protected string $warehouse_title;

    protected string $date;

    public function __construct(string $code, string $warehouse_title, string $date)
    {
        $this->code = $code;
        $this->warehouse_title = $warehouse_title;
        $this->date = $date;
    }

    /**
     * Define the endpoint for the request
     */
    public function resolveEndpoint(): string
    {
        return '/base2/hs/CarData/os/empl';
    }

    protected function defaultQuery(): array
    {
        return [
            'm' => 'get_stock_leftover',
            'code' => $this->code,
            'wh_name' => $this->warehouse_title,
            'date' => $this->date,
        ];
    }

}
