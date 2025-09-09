// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

// src/App.tsx

import { useState } from 'react';
import './App.css'; // あとでスタイルを少しだけ書きます

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
  const handleAddTask = () => {
    if (newTodoTitle.trim() === '') return; // 空の場合は何もしない

    const newTask: Task = {
      id: Date.now(), // idは一時的に現在時刻のタイムスタンプを使う
      title: newTodoTitle,
      completed: false,
    };

    // stateを更新する際は、元の配列を展開して新しい要素を追加した「新しい配列」をセットする
    setTasks([...tasks, newTask]);
    setNewTodoTitle(''); // フォームを空にする
  };

  const handleToggleCompleted = (id: number) => {
    const newTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);
  };

  const handleDeleteTask = (id: number) => {
    const newTasks = tasks.filter(task => task.id !== id);
    setTasks(newTasks);
  };

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