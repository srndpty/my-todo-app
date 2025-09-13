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

    // 空のタイトルだったら失敗するはず
    public function test_creating_a_task_requires_a_title(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            // titleを含まない、不正なデータを送信
            ->postJson('/api/tasks', ['title' => ''])
            ->assertStatus(422) // ステータスコードが422であることを確認
            ->assertJsonValidationErrors('title'); // 'title'フィールドでバリデーションエラーが発生したことを確認
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
     * 存在しないタスクを更新しようとすると404エラーになることをテスト
     * @return void
     */
    public function test_updating_a_non_existent_task_returns_not_found(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/tasks/999', ['completed' => true]) // 存在しないID: 999
            ->assertNotFound(); // ステータスコードが404であることを確認
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

    // 認証済みのユーザーが、他人のタスクを削除できないことをテスト
    public function test_an_authenticated_user_cannot_delete_others_task(): void
    {
        $user = User::factory()->create();
        $anotherUserTask = Task::factory()->create(); // 別のユーザーのタスクをFactoryで作成

        // $userとして、$anotherUserTaskを削除しようと試みる
        $this->actingAs($user)
            ->deleteJson("/api/tasks/{$anotherUserTask->id}")
            ->assertForbidden(); // ステータスコードが403であることを確認
    }

    /**
     * 認証済みのユーザーが自分のタスクを更新できることをテスト
     * @return void
     */
    public function test_an_authenticated_user_can_update_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id, 'completed' => false]);

        $this->actingAs($user)
            ->putJson("/api/tasks/{$task->id}", ['completed' => true])
            ->assertOk()
            ->assertJsonFragment(['completed' => true]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'completed' => true,
        ]);
    }

    /**
     * 認証済みのユーザーが自分のタスクを削除できることをテスト
     * @return void
     */
    public function test_an_authenticated_user_can_delete_their_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    /**
     * タスク一覧APIのレスポンス構造を検証する
     * @return void
     */
    public function test_tasks_index_response_structure(): void
    {
        $user = User::factory()->create();
        Task::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson('/api/tasks');

        $response
            ->assertOk()
            ->assertJsonStructure([
                '*' => [ // 配列で返る場合
                    'id',
                    'title',
                    'completed',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    /**
     * タイトルが255文字を超える場合のバリデーションエラーをテスト
     * @return void
     */
    public function test_title_max_length_validation(): void
    {
        $user = User::factory()->create();
        $longTitle = str_repeat('a', 256); // 256文字

        $this->actingAs($user)
            ->postJson('/api/tasks', ['title' => $longTitle])
            ->assertStatus(422)
            ->assertJsonValidationErrors('title');
    }

    /**
     * completedにboolean以外を送るとバリデーションエラー
     * @return void
     */
    public function test_completed_field_must_be_boolean(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->putJson("/api/tasks/{$task->id}", ['completed' => 'not-boolean'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('completed');
    }
}