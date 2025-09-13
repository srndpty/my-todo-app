import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import type { Task } from '../types';

export const useTasks = () => {
  const { token } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authApiClient = useMemo(() => {
    if (!token) return null;
    return axios.create({
      baseURL: 'https://my-todo-app-6nqa.onrender.com',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  }, [token]);

  useEffect(() => {
    if (!authApiClient) {
      setLoading(false);
      return;
    }
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
  }, [authApiClient]);

  const addTask = async (title: string) => {
    if (title.trim() === '' || !authApiClient) return;
    try {
      const response = await authApiClient.post('/api/tasks', { title: title });
      // 成功したら、新しいタスクを既存のリストに追加する
      setTasks((prevTasks) => [...prevTasks, response.data]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id: number) => {
    if (!authApiClient) return;
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;
      const response = await authApiClient.put(`/api/tasks/${id}`, {
        completed: !taskToUpdate.completed,
      });
      setTasks(tasks.map(task => (task.id === id ? response.data : task)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  const deleteTask = async (id: number) => {
    if (!authApiClient) return;
    try {
      await authApiClient.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return { tasks, loading, error, addTask, toggleTask, deleteTask };
};