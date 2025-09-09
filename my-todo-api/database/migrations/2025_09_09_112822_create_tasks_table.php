<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id(); // 自動増分のID (主キー)
            $table->string('title'); // タスクのタイトル
            $table->boolean('completed')->default(false); // 完了フラグ (デフォルトは未完了)
            $table->timestamps(); // created_at と updated_at カラムを自動で作成
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
