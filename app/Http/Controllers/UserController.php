<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UpdateChatIdRequest;
use Illuminate\Http\RedirectResponse;

class UserController extends Controller
{
    public function updateChatId(UpdateChatIdRequest $request): RedirectResponse
    {
        $request->user()->update([
            'chat_id' => $request->validated('chat_id'),
        ]);

        return back();
    }
}
