import React, { useEffect, useState } from 'react';

export default function MyLoans({ api, user }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const load = () => {
    setError('');
    api.getMyBorrowed().then((d) => setRows(d.borrowed || [])).catch((e) => setError(e.message || 'Failed to load'));
  };
  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const returnOne = (borrow_id) => {
    api.returnBook({ borrow_id })
      .then(load)
      .catch((e) => setError(e.message || 'Return failed'));
  };

  if (!user) return <p>Login to view your loans.</p>;

  return (
    <div>
      <h2>My Loans</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      {(rows.length > 0) ? (
        <ul>
          {rows.map(r => (
            <li key={r.borrow_id}>
              {r.book.title} — due {r.dueDate}
              <button style={{ marginLeft: 8 }} onClick={() => returnOne(r.borrow_id)}>Return</button>
            </li>
          ))}
        </ul>
      ) : <p>No active loans.</p>}
    </div>
  );
}
