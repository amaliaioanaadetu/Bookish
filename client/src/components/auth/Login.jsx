import React, { useState } from 'react';

export default function Login({ api, onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    setError('');
    api.login({ username, password })
      .then(onSuccess)
      .catch((err) => setError(err.message || 'Login failed'));
  };
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
