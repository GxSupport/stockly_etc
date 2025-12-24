<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class VerifyOtpController extends Controller
{
    /**
     * Show the OTP verification page.
     */
    public function create(string $token): Response|RedirectResponse
    {
        // Check if token exists
        $resetRecord = DB::table('password_reset_tokens')
            ->where('token', $token)
            ->first();

        if (! $resetRecord) {
            return redirect()->route('password.request')
                ->with('status', 'Неверная или устаревшая ссылка');
        }

        // Check if token is expired (5 minutes)
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addMinutes(5)->isPast()) {
            return redirect()->route('password.request')
                ->with('status', 'Срок действия кода истёк. Попробуйте ещё раз');
        }

        return Inertia::render('auth/verify-otp', [
            'token' => $token,
        ]);
    }

    /**
     * Verify the OTP code.
     */
    public function store(VerifyOtpRequest $request): RedirectResponse
    {
        $resetRecord = DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->first();

        if (! $resetRecord) {
            throw ValidationException::withMessages([
                'code' => 'Неверный токен',
            ]);
        }

        // Check if token is expired (5 minutes)
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addMinutes(5)->isPast()) {
            // Delete expired token
            DB::table('password_reset_tokens')
                ->where('token', $request->token)
                ->delete();

            throw ValidationException::withMessages([
                'code' => 'Срок действия кода истёк. Попробуйте ещё раз',
            ]);
        }

        // Verify OTP code
        if ($resetRecord->otp_code !== $request->code) {
            throw ValidationException::withMessages([
                'code' => 'Неверный код подтверждения',
            ]);
        }

        // OTP verified, redirect to password reset page
        return redirect()->route('password.reset', ['token' => $request->token]);
    }
}
