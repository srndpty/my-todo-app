import { useState, useEffect } from 'react'; // useEffect をインポート
import './App.css'; // あとでスタイルを少しだけ書きます
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://my-todo-app-6nqa.onrender.com/api'
});

// 1つのタスクが持つデータの「型」を定義しておくと、TypeScriptが守ってくれます
type Task = {
  id: number;
  title: string;
  completed: boolean;
};

function App() {
  // タスクのリストを管理するためのstate
  // 型は上で定義したTaskの配列 (Task[])
  const [tasks, setTasks] = useState<Task[]>([
    // 初期データを入れておくと開発しやすい
    { id: 1, title: 'Reactの勉強', completed: false },
    { id: 2, title: 'APIの設計', completed: true },
  ]);
  // フォームの入力値を管理するためのstate
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');

  const handleAddTask = async () => {
    if (newTodoTitle.trim() === '') return;
    try {
      const response = await apiClient.post('/tasks', { title: newTodoTitle });
      setTasks([...tasks, response.data]); // APIからのレスポンスでstateを更新
      setNewTodoTitle('');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // タスクの完了状態を切り替える
  const handleToggleCompleted = async (id: number) => {
    try {
      // まず、更新対象のタスクを現在のstateから探す
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;

      // APIを呼び出して、データベースのcompletedフラグを更新
      const response = await apiClient.put(`/tasks/${id}`, {
        completed: !taskToUpdate.completed,
      });

      // APIからのレスポンス（更新後のタスク情報）を元に、フロントエンドのstateを更新
      const newTasks = tasks.map(task =>
        task.id === id ? response.data : task
      );
      setTasks(newTasks);

    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // タスクを削除する
  const handleDeleteTask = async (id: number) => {
    try {
      // APIを呼び出して、データベースからタスクを削除
      await apiClient.delete(`/tasks/${id}`);

      // フロントエンドのstateからも、該当するタスクを削除
      const newTasks = tasks.filter(task => task.id !== id);
      setTasks(newTasks);

    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get('/tasks');
        setTasks(response.data); // APIから取得したデータでstateを更新
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []); // 第2引数の空配列は「初回レンダリング時に一度だけ実行する」という意味

  return (
    <div className="App">
      <h1>ToDoリスト</h1>
      {/* タスク追加フォーム */}
      <div>
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
        />
        <button onClick={handleAddTask}>追加</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleCompleted(task.id)}
            />
            <span>{task.title}</span>
            <button onClick={() => handleDeleteTask(task.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;