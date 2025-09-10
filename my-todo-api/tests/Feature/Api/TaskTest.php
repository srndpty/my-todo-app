<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase; // RefreshDatabaseトレイトをクラスの中でuseする

    /**
     * 認証されていないユーザーは、タスク関連のルートにアクセスできないことをテスト
     * @return void
     */
    public function test_requires_authentication_for_task_routes(): void
    {
        $this->getJson('/api/tasks')->assertUnauthorized();
        $this->postJson('/api/tasks')->assertUnauthorized();
    }

    /**
     * 認証済みのユーザーが、自分自身のタスクを取得できることをテスト
     * @return void
     */
    public function test_an_authenticated_user_can_get_their_own_tasks(): void
    {
        $user = User::factory()->create();
        $taskForUser = Task::factory()->create(['user_id' => $user->id]);
        $taskForAnotherUser = Task::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/tasks');

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $taskForUser->id])
            ->assertJsonMissing(['id' => $taskForAnotherUser->id]);
    }

    /**
     * 認証済みのユーザーが、タスクを作成できることをテスト
     * @return void
     */
    public function test_an_authenticated_user_can_create_a_task(): void
    {
        $user = User::factory()->create();
        $taskData = ['title' => '新しいテストタスク'];

        $this->actingAs($user)
             ->postJson('/api/tasks', $taskData)
             ->assertCreated()
             ->assertJsonFragment($taskData);

        $this->assertDatabaseHas('tasks', [
            'title' => '新しいテストタスク',
            'user_id' => $user->id,
        ]);
    }
    
    /**
     * 認証済みのユーザーが、他人のタスクを更新できないことをテスト
     * @return void
     */
    public function test_an_authenticated_user_cannot_update_others_task(): void
    {
        $user = User::factory()->create();
        $anotherUserTask = Task::factory()->create();

        $this->actingAs($user)
             ->putJson("/api/tasks/{$anotherUserTask->id}", ['completed' => true])
             ->assertForbidden();
    }
}