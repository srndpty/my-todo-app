<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Task; // Taskモデルをインポート
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
    public function index()
    {
        return auth()->user()->tasks; // 認証ユーザーのタスクのみを返す
    }

    // POST /api/tasks - 新しいタスクを作成
    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:255']);

        $task = auth()->user()->tasks()->create([
            'title' => $request->title,
            'completed' => false,
        ]);
        return response()->json($task, 201);
    }

    // GET /api/tasks/{id} - 特定のタスクを取得 (今回は使わないかも)
    public function show(Task $task)
    {
        if (Gate::denies('view', $task)) {
            abort(403, 'Unauthorized action.');
        }
        return $task;
    }

    // PUT /api/tasks/{id} - タスクを更新
    public function update(Request $request, Task $task)
    {
        if (Gate::denies('update', $task)) {
            abort(403, 'Unauthorized action.');
        }
        // completed の更新だけを想定
        $request->validate(['completed' => 'required|boolean']);
        $task->update(['completed' => $request->completed]);
        return response()->json($task);
    }

    // DELETE /api/tasks/{id} - タスクを削除
    public function destroy(Task $task)
    {
        if (Gate::denies('delete', $task)) {
            abort(403, 'Unauthorized action.');
        }
        $task->delete();
        return response()->json(null, 204);
    }
    
}
