import React, { useState } from 'react';

export default function Register({ api, onSuccess }) {
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', username:'', password:'' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    setError('');
    api.register(form)
      .then(onSuccess)
      .catch((err) => setError(err.message || 'Register failed'));
  };
  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div><label>First name</label><input value={form.first_name} onChange={set('first_name')} /></div>
        <div><label>Last name</label><input value={form.last_name} onChange={set('last_name')} /></div>
        <div><label>Email</label><input value={form.email} onChange={set('email')} /></div>
        <div><label>Username</label><input value={form.username} onChange={set('username')} /></div>
        <div><label>Password</label><input type="password" value={form.password} onChange={set('password')} /></div>
        <button type="submit">Create account</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
