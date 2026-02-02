<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function __construct(
        private TelegramService $telegramService
    ) {}

    /**
     * Show the password reset request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset request.
     */
    public function store(ForgotPasswordRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        $phone = $request->getCleanPhone();

        // Find user by phone
        $user = User::where('phone', $phone)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => 'Номер телефона не найден в системе',
            ]);
        }

        // Check if user has Telegram chat_id
        if (! $user->chat_id) {
            throw ValidationException::withMessages([
                'phone' => 'Telegram бот не подключён. Запустите бот @IstTelecomDocumentTestBot и повторите попытку',
            ]);
        }

        // Generate OTP and token
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $token = Str::random(64);

        // Store in database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['phone' => $phone],
            [
                'token' => $token,
                'otp_code' => $otp,
                'created_at' => now(),
            ]
        );

        // Send OTP via Telegram
        $message = "🔐 Код восстановления пароля: <b>{$otp}</b>\n\n";
        $message .= "Этот код действителен в течение 5 минут.\n";
        $message .= 'Если вы не отправляли этот запрос, проигнорируйте это сообщение.';

        $sent = $this->telegramService->sendMessage($user->chat_id, $message);

        if (! $sent) {
            throw ValidationException::withMessages([
                'phone' => 'Ошибка при отправке сообщения через Telegram. Убедитесь, что вы запустили бот @IstTelecomDocumentTestBot',
            ]);
        }

        return redirect()->route('password.verify-otp', ['token' => $token]);
    }
}
