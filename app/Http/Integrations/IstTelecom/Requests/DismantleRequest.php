<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\Warehouse;
use Carbon\Carbon;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class DismantleRequest extends Request implements HasBody
{
    use HasJsonBody;
    protected ?string $connector = Warehouse::class;
    protected Method $method = Method::POST;
    public function __construct(
     public string $doc_date,
     public string $doc_number,
     public string $wh_code,
     public string $wh_name,
     public array $product
    )
    {}
    public function resolveEndpoint(): string
    {
        return '/base2/hs/CarData/goods/basedismantling_act_goods';
    }
    protected function defaultBody(): array
    {
        return [[
            'docDate'=>Carbon::parse($this->doc_date)->format('Y.m.d H:i:s'),
            'docNumber'=>$this->doc_number,
            'whCode'=>$this->wh_code,
            'whName'=>$this->wh_name,
            'docDataProducts'=>$this->product
        ]];
    }
}
