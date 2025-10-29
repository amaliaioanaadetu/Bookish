import React, { useState } from 'react';

export default function AddBook({ api, user }) {
  const [form, setForm] = useState({ title:'', isbn:'', total_copies:1, authors: [{ first_name:'', last_name:'' }] });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const setAuthor = (i, k) => (e) => {
    const updated = [...form.authors];
    updated[i] = { ...updated[i], [k]: e.target.value };
    setForm({ ...form, authors: updated });
  };

  const addAuthor = () => setForm({ ...form, authors: [...form.authors, { first_name:'', last_name:'' }] });
  const removeAuthor = (i) => setForm({ ...form, authors: form.authors.filter((_, idx) => idx !== i) });

  const submit = (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    const payload = {
      title: form.title,
      isbn: form.isbn,
      total_copies: parseInt(form.total_copies, 10) || 1,
      authors: form.authors.filter(a => (a.first_name||'').trim() || (a.last_name||'').trim())
    };
    api.addBook(payload)
      .then((res) => setMsg(`Created book #${res.book.id}`))
      .catch((e) => setError(e.message || 'Failed to add book'));
  };

  if (!user) return <p>Login to add books.</p>;

  return (
    <div>
      <h2>Add Book</h2>
      <form onSubmit={submit}>
        <div><label>Title</label><input value={form.title} onChange={set('title')} /></div>
        <div><label>ISBN</label><input value={form.isbn} onChange={set('isbn')} /></div>
        <div><label>Total copies</label><input type="number" min="1" value={form.total_copies} onChange={set('total_copies')} /></div>
        <div>
          <label>Authors</label>
          {form.authors.map((a, i) => (
            <div key={i}>
              <input placeholder="First name" value={a.first_name} onChange={setAuthor(i, 'first_name')} />
              <input placeholder="Last name" value={a.last_name} onChange={setAuthor(i, 'last_name')} />
              {form.authors.length > 1 && <button type="button" onClick={() => removeAuthor(i)}>Remove</button>}
            </div>
          ))}
          <button type="button" onClick={addAuthor}>+ Add author</button>
        </div>
        <button type="submit">Create</button>
      </form>
      {msg && <p style={{color:'green'}}>{msg}</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
