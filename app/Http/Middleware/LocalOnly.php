<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class LocalOnly
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless(in_array($request->ip(), ['127.0.0.1', '::1'], true) && in_array($request->getHost(), ['127.0.0.1', 'localhost', '[::1]'], true), 403, 'LocalVault is available on this computer only.');
        $response = $next($request);
        $response->headers->set('Cache-Control', 'no-store, private');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'no-referrer');

        return $response;
    }
}
