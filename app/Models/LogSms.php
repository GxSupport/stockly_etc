<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\LogSms SMSlar logi
 * @property int $id
 * @property string $message_id ID сообщения в системе отправителя
 * @property string|null $message_id_in ID сообщения в системе получателя
 * @property string $phone Телефон получателя
 * @property string $text Текст сообщения
 * @property array|null $response Ответ от сервиса отправки
 * @property string|null $query_code Код ответа от сервиса отправки
 * @property string|null $query_state Статус доставки сообщения
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class LogSms extends Model
{

    protected $table = 'log_sms';
}
