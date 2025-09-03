<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\Warehouse;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Contracts\Body\HasBody;
use Saloon\Traits\Body\HasJsonBody;

class GetGoodsRequest extends Request implements HasBody
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

    public function __construct(
        public string $date,
        public string|null $foo_code=null,
        public string|null $dep_code=null,
        public string|null $warehouse_code=null
    )
    { }
    /**
     * Define the endpoint for the request
     *
     * @return string
     */
    public function resolveEndpoint(): string
    {
        return '/base2/hs/CarData/goods/goodsget_stock_leftover_os';

    }
    protected function defaultQuery(): array
    {
        $send = [
            'date' => $this->date,
        ];
        if (!is_null($this->foo_code)) $send = array_merge(['fooCode'=>$this->foo_code],$send);
        if (!is_null($this->warehouse_code)) $send = array_merge(['whCode'=>$this->warehouse_code],$send);
        if (!is_null($this->dep_code)) $send=array_merge(['depCode'=>$this->dep_code],$send);
        return $send;
    }
}
