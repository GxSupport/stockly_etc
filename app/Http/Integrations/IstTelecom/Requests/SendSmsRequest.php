<?php

namespace App\Http\Integrations\IstTelecom\Requests;

use App\Http\Integrations\IstTelecom\SmsConnector;
use Saloon\Contracts\Body\HasBody;
use Saloon\Enums\Method;
use Saloon\Http\Request;
use Saloon\Traits\Body\HasJsonBody;

class SendSmsRequest extends Request implements HasBody
{
    use HasJsonBody;
    /**
     * Define the HTTP method
     *
     * @var Method
     */
    protected Method $method = Method::POST;
    const CgPN = 'ISTTELEKOM';
    /**
     * Define the endpoint for the request
     *
     * @return string
     */
    public function resolveEndpoint(): string
    {
        return '/json2sms';
    }
    public function __construct(
        public string $message_id,
        public string $phone,
        public string $text)
    { }
    protected function defaultBody(): array
    {

        return [
            "login" => config('services.sms.login'),
            "pwd" => config('services.sms.pwd'),
            'CgPN' => self::CgPN,
            'message_id_in' => $this->message_id,
            'CdPN' => $this->phone,
            'text' => $this->text
        ];
    }
}
