import React, { useEffect, useState } from 'react';
import { getNowServing } from './queueUtils';

// nginx (see nginx.conf) proxies /api requests to the server container,
// so the browser only ever needs a relative path — never the server
// container's internal name or port.
const API_BASE = '/api/queue';

export default function App() {
  const [queue, setQueue] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000); // simple polling refresh
    return () => clearInterval(interval);
  }, []);

  const joinQueue = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: name || 'Guest' }),
    });
    setName('');
    fetchQueue();
  };

  const callNext = async () => {
    const res = await fetch(`${API_BASE}/next`, { method: 'PUT' });
    if (res.status === 404) {
      alert('Queue is empty — no one is waiting.');
    }
    fetchQueue();
  };

  const nowServing = getNowServing(queue);

  return (
    <div className="app">
      <h1>Smart Queue Management</h1>

      <div className="now-serving">
        <div>Now serving</div>
        <div className="number">
          {nowServing ? `#${nowServing.ticketNumber}` : '—'}
        </div>
      </div>

      <button className="admin-btn" onClick={callNext}>
        Call Next (staff)
      </button>

      <form onSubmit={joinQueue}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Join Queue</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : queue.length === 0 ? (
        <p style={{ color: '#666' }}>No one is currently waiting or being served.</p>
      ) : (
        <ul>
          {queue.map((ticket) => (
            <li
              key={ticket._id}
              className={ticket.status === 'serving' ? 'serving' : ''}
            >
              <span>
                #{ticket.ticketNumber} — {ticket.customerName}
              </span>
              <span className={`badge ${ticket.status}`}>{ticket.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
