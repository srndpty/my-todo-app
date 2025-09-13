import { useState  } from 'react'; // useEffect をインポート
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Helmet } from 'react-helmet-async';
import { useTasks } from '../hooks/useTasks'; // カスタムフックをインポート

function HomePage() {
  const { token } = useAuthStore();
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');

  // ログインしてない場合はログインページへ
  if (!token) {
    return <Navigate to="/login" />;
  }
  const handleAddTaskSubmit = async () => {
    await addTask(newTodoTitle);
    // (解決策4) フォームを空にする処理は、呼び出し元のコンポーネントが責任を持つ
    setNewTodoTitle('');
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
        <button onClick={handleAddTaskSubmit}>追加</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={!!task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <span>{task.title}</span>
            <button onClick={() => deleteTask(task.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;