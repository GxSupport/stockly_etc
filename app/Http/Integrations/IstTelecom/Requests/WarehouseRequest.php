<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\Warehouse;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Contracts\Body\HasBody;
use Saloon\Traits\Body\HasJsonBody;

class WarehouseRequest extends Request implements HasBody
{
    use HasJsonBody;
    /**
     * The connector class.
     *
     * @var string|null
     */
    protected ?string $connector = Warehouse::class;
    /**
     * Define the HTTP method
     *
     * @var Method
     */
    protected Method $method = Method::GET;
    protected string $code;
    protected string $warehouse_title;
    protected string $date;

    public function __construct(string $code,string $warehouse_title, string $date)
    {
        $this->code = $code;
        $this->warehouse_title = $warehouse_title;
        $this->date = $date;
    }
    /**
     * Define the endpoint for the request
     *
     * @return string
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
