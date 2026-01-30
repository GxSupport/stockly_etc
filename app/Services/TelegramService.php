<?php

namespace App\Services;

use App\Models\DocumentPriority;
use App\Models\Documents;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Telegram\Bot\Laravel\Facades\Telegram;

class TelegramService
{
    /**
     * Send a message to a Telegram chat.
     */
    public function sendMessage(string $chatId, string $message): bool
    {
        try {
            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'HTML',
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Telegram message sending failed: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Keyingi tasdiqlash bosqichidagi foydalanuvchilarga xabar yuborish.
     */
    public function notifyNextApprover(Documents $document, int $nextOrdering): void
    {
        try {
            $nextPriorities = DocumentPriority::where('document_id', $document->id)
                ->where('ordering', $nextOrdering)
                ->where('is_active', true)
                ->get();

            foreach ($nextPriorities as $priority) {
                $users = $this->resolveUsersFromPriority($priority);

                foreach ($users as $user) {
                    if (empty($user->chat_id)) {
                        Log::info("User #{$user->id} ({$user->name}) has no chat_id, skipping notification");

                        continue;
                    }

                    $url = route('documents.show', $document->id);
                    $message = "<b>📄 Новый документ на утверждение</b>\n\n"
                        ."Документ №<b>{$document->number}</b> поступил вам на утверждение.\n"
                        ."Пожалуйста, проверьте и примите решение.\n\n"
                        ."<a href=\"{$url}\">Открыть документ</a>";

                    $this->sendMessage($user->chat_id, $message);

                    Log::info("Notification sent to user #{$user->id} for document #{$document->id}");
                }
            }
        } catch (\Exception $e) {
            Log::error('Error sending next approver notification: '.$e->getMessage());
        }
    }

    /**
     * Hujjat qaytarilganda egasiga xabar yuborish.
     */
    public function notifyDocumentReturned(Documents $document, User $toUser, string $note): void
    {
        try {
            if (empty($toUser->chat_id)) {
                Log::info("User #{$toUser->id} ({$toUser->name}) has no chat_id, skipping return notification");

                return;
            }

            $url = route('documents.show', $document->id);
            $message = "<b>⚠️ Документ возвращён</b>\n\n"
                ."Документ №<b>{$document->number}</b> был возвращён.\n"
                ."<b>Причина:</b> {$note}\n\n"
                ."<a href=\"{$url}\">Открыть документ</a>";

            $this->sendMessage($toUser->chat_id, $message);

            Log::info("Return notification sent to user #{$toUser->id} for document #{$document->id}");
        } catch (\Exception $e) {
            Log::error('Error sending document return notification: '.$e->getMessage());
        }
    }

    /**
     * Priority yozuvidan foydalanuvchilarni aniqlash.
     *
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function resolveUsersFromPriority(DocumentPriority $priority): \Illuminate\Support\Collection
    {
        // user_id mavjud bo'lsa - to'g'ridan-to'g'ri shu foydalanuvchi
        if ($priority->user_id) {
            $user = User::find($priority->user_id);

            return $user ? collect([$user]) : collect();
        }

        // user_role bo'yicha foydalanuvchilarni topish
        return User::where('type', $priority->user_role)
            ->where('is_active', 1)
            ->get();
    }
}
