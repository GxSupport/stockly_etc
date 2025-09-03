<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\Warehouse;
use Carbon\Carbon;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Contracts\Body\HasBody;
use Saloon\Traits\Body\HasJsonBody;

class CompositionRequest extends Request implements HasBody
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
        public string $os
    )
    { }
    /**
     * Define the endpoint for the request
     *
     * @return string
     */
    public function resolveEndpoint(): string
    {
        return '/base2/hs/CarData/os_composition/get_composition';

    }
    protected function defaultBody(): array
    {
        return [
            'dateStart' => Carbon::now()->subMonth()->format('d.m.Y'),
            'dateEnd'   => Carbon::now()->format('d.m.Y'),
            'os'        => [
                ['osCode' => $this->os]
            ]
        ];
    }
}
