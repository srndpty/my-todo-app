<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('view', function (User $user, Task $task) {
            return $user->id === $task->user_id;
        });

        Gate::define('update', function (User $user, Task $task) {
            return $user->id === $task->user_id;
        });

        Gate::define('delete', function (User $user, Task $task) {
            return $user->id === $task->user_id;
        });
    }
}
