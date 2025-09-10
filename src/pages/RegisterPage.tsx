import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { AxiosError } from 'axios';
import { Helmet } from 'react-helmet-async';

type ValidationErrors = {
  [key: string]: string[];
};

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await apiClient.post('/api/register', { name, email, password, password_confirmation: passwordConfirmation });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error("Registration error:", error);
      if (err instanceof AxiosError && err.response) {
        // Laravelのバリデーションエラー(422)の場合
        if (err.response.status === 422) {
          const data = err.response.data as { errors: ValidationErrors };
          const messages = Object.values(data.errors).flat().join('\n');
          setError(messages);
        } else {
            setError('An error occurred during registration.');
        }
      } else {
        setError('An error occurred during registration.');
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Register Page - ToDo App</title>
        <meta name="description" content="Manage your daily tasks efficiently." />
      </Helmet>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{error}</p>}
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password_confirmation">Confirm Password:</label>
          <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;