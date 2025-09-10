<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckManagementRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()) {
            return redirect('login');
        }

        $allowedRoles = ['admin', 'director', 'buxgalter'];

        if (! in_array($request->user()->type, $allowedRoles)) {
            abort(403, 'Доступ запрещен. У вас нет прав для просмотра этой страницы.');
        }

        return $next($request);
    }
}
