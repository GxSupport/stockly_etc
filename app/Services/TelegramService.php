<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Telegram\Bot\Laravel\Facades\Telegram;

class TelegramService
{
    /**
     * Send a message to a Telegram chat.
     *
     * @param string $chatId
     * @param string $message
     * @return bool
     */
    public function sendMessage(string $chatId, string $message): bool
    {
        try {
            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML'
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Telegram message sending failed: ' . $e->getMessage());
            return false;
        }
    }
}
