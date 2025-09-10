import { useState, useEffect, useMemo  } from 'react'; // useEffect をインポート
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

// 1つのタスクが持つデータの「型」を定義しておく（TypeScriptが守ってくれる）
type Task = {
  id: number;
  title: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
};

function HomePage() {
  const { token } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

    // --- ステップ2: useMemoを使って、tokenが変わった時だけapiClientを再生成する ---
  const authApiClient = useMemo(() => {
    if (!token) return null; // トークンがなければnullを返す
    return axios.create({
      baseURL: 'https://my-todo-app-6nqa.onrender.com',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  }, [token]); // tokenが変更されたら、このuseMemoが再実行される

  // --- ステップ3: useEffectの依存配列を正しく設定する ---
  useEffect(() => {
    // apiClientがnull（トークンがない）の場合は何もしない
    if (!authApiClient) return;

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authApiClient.get('/api/tasks');
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError('Failed to fetch tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [authApiClient]); // 依存配列にauthApiClientを追加

  // ログインしてない場合はログインページへ
  if (!token) {
    return <Navigate to="/login" />;
  }

  const handleAddTask = async () => {
    if (newTodoTitle.trim() === '' || !authApiClient) return;
    try {
      const response = await authApiClient.post('/api/tasks', { title: newTodoTitle });
      setTasks([...tasks, response.data]); // APIからのレスポンスでstateを更新
      setNewTodoTitle('');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // タスクの完了状態を切り替える
  const handleToggleCompleted = async (id: number) => {
    try {
      if (!authApiClient) return;
      // まず、更新対象のタスクを現在のstateから探す
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;

      // APIを呼び出して、データベースのcompletedフラグを更新
      const response = await authApiClient.put(`/api/tasks/${id}`, {
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
      if (!authApiClient) return;
      // APIを呼び出して、データベースからタスクを削除
      await authApiClient.delete(`/api/tasks/${id}`);

      // フロントエンドのstateからも、該当するタスクを削除
      const newTasks = tasks.filter(task => task.id !== id);
      setTasks(newTasks);

    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }


  return (
    <div className="App">
      <Helmet>
        <title>My Tasks - ToDo App</title>
        <meta name="description" content="Manage your daily tasks efficiently." />
      </Helmet>
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

export default HomePage;