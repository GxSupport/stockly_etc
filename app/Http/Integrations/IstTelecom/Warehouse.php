<?php

namespace App\Http\Integrations\IstTelecom;

use Saloon\Http\Connector;
use Saloon\Traits\Plugins\AcceptsJson;

class Warehouse extends Connector
{
    use AcceptsJson;

    /**
     * The Base URL of the API
     *
     * @return string
     */
    public function resolveBaseUrl(): string
    {
        return 'http://89.236.216.12:8083';
    }

    /**
     * Default headers for every request
     *
     * @return string[]
     */
    protected function defaultHeaders(): array
    {
        return [
            'Content-Type' => 'application/json',
            'Accept'=>'*/*',
            'Authorization'=>'Basic aHR0cGJvdDpodHRwYm90'
        ];
    }

    /**
     * Default HTTP client options
     *
     * @return string[]
     */
    protected function defaultConfig(): array
    {
        return [
            'proxy' => (config('services.app.local') == 'local') ? 'socks5://localhost:8089' : ''
        ];
    }
}
