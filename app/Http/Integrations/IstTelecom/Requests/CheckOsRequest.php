<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\Warehouse;
use Carbon\Carbon;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Contracts\Body\HasBody;
use Saloon\Traits\Body\HasJsonBody;

class CheckOsRequest extends Request implements HasBody
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
        public array $os,
        public string|null $depCode="",
        public string|null $fooCode=""
    )
    { }
    /**
     * Define the endpoint for the request
     *
     * @return string
     */
    public function resolveEndpoint(): string
    {
        return '/base2/hs/CarData/check_os/check_os_in_stock';

    }
    protected function defaultBody(): array
    {
        return [
            'date'      => Carbon::parse($this->date)->format('d.m.Y'),
            'depCode'    => $this->depCode,
            'whCode'    => $this->whCode,
            'fooCode'    => $this->fooCode,
            'osCodes'     => $this->os
        ];
    }
}
