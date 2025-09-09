<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*', // /api/で始まるリクエストではCSRFチェックを無効化
        ]);
        // // ここにCORSの設定を追加します
        // $middleware->cors(
        //     paths: ['api/*'], // どのパスでCORSを有効にするか
        //     allowedOrigins: ['*'], // どのオリジンからのアクセスを許可するか TODO: あとでvercelのURLに変更する
        //     // 必要であれば、他の設定も
        //     // allowedHeaders: ['*'],
        //     // allowedMethods: ['*'],
        // );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
