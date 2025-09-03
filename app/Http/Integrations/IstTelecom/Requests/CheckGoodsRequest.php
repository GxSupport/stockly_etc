<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\Warehouse;
use Carbon\Carbon;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Contracts\Body\HasBody;
use Saloon\Traits\Body\HasJsonBody;

class CheckGoodsRequest extends Request implements HasBody
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
    protected Method $method = Method::POST;

    public function __construct(
        public string $date,
        public string $whCode,
        public array $goods
    )
    { }
    /**
     * Define the endpoint for the request
     *
     * @return string
     */
    public function resolveEndpoint(): string
    {
        return '/base2/hs/CarData/check_goods/check_leftovers_in_stock';

    }
    protected function defaultBody(): array
    {
        return [
            'date'      => Carbon::parse($this->date)->format('d.m.Y'),
            'whCode'    => $this->whCode,
            'goods'     => $this->goods
        ];
    }
}
