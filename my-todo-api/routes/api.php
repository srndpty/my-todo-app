<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\AuthController; // AuthControllerをインポート

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']); // ユーザー登録用ルート
Route::post('/login', [AuthController::class, 'login']);       // ログイン用ルート
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');     // ログアウト用ルート(requires valid sanctum token)

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('tasks', TaskController::class);
});
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});