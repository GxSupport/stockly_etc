<?php

namespace App\Services;

use App\Http\Integrations\IstTelecom\Requests\SendSmsRequest;
use App\Http\Integrations\IstTelecom\SmsConnector;
use App\Models\LogSms;

class SmsService
{
    public LogSms|null $log;
    const MESSAGE = 'document-test-';
    public function __construct(
        public string $phone,
        public string $text
    )
    { }
    public function sendSms(){
        $this->addLog();
        $this->log->message_id = self::MESSAGE.$this->log->id;
        $req =new SendSmsRequest($this->log->message_id,$this->phone,$this->text);
        $conn = new SmsConnector();
        $result = $conn->send($req);
        $this->log->response = $result->json();
        $this->updateLog();
        $this->decodeResponse();
        return $this->log->response;
    }
    public function decodeResponse(){
        $this->log->message_id_in = $this->log->response['message_id']??null;
        $this->log->query_code = $this->log->response['query_code']??null;
        $this->log->query_state = $this->log->response['query_state']??null;
    }
    private function addLog(){
        $log = new LogSms();
        $log->phone = $this->phone;
        $log->text = $this->text;
        $log->save();
        $this->log = $log;
    }
    private function updateLog(): void
    {
        $this->log->save();
    }

}
