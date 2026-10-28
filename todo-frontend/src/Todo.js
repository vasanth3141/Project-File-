import { useCallback, useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Todo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const getItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load tasks.');
      setTodos(data);
    } catch (err) {
      setError(`${err.message} Make sure the backend and MongoDB are running.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { getItems(); }, [getItems]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!title.trim()) return setError('Please enter a task title.');
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create task.');
      setTodos((current) => [data, ...current]);
      setTitle('');
      setDescription('');
      showMessage('Task added successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setError('');
  };

  const handleUpdate = async (id) => {
    setError('');
    if (!editTitle.trim()) return setError('Please enter a task title.');
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), description: editDescription.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update task.');
      setTodos((current) => current.map((item) => item._id === id ? data : item));
      setEditId(null);
      showMessage('Task updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setError('');
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to delete task.');
      }
      setTodos((current) => current.filter((item) => item._id !== id));
      showMessage('Task deleted successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="todo-app">
      <header className="hero">
        <p className="eyebrow">STAY ORGANIZED</p>
        <h1>My Todo List</h1>
        <p className="subtitle">A little progress every day adds up.</p>
      </header>

      <section className="panel">
        <h2>Add a task</h2>
        <form className="todo-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-title">Task title</label>
          <input id="new-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" maxLength="200" />
          <label className="sr-only" htmlFor="new-description">Task description</label>
          <input id="new-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description (optional)" maxLength="1000" />
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add task'}</button>
        </form>
        {error && <p className="alert error" role="alert">{error}</p>}
        {message && <p className="alert success" role="status">{message}</p>}
      </section>

      <section className="task-section">
        <div className="section-heading">
          <h2>Your tasks</h2>
          <span className="task-count">{todos.length} {todos.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        {loading ? <p className="empty-state">Loading tasks…</p> :
          todos.length === 0 ? <p className="empty-state">No tasks yet. Add your first task above.</p> :
          <ul className="task-list">
            {todos.map((item) => (
              <li className="task-card" key={item._id}>
                {editId === item._id ? (
                  <div className="edit-fields">
                    <input aria-label="Edit task title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength="200" />
                    <input aria-label="Edit task description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} maxLength="1000" />
                  </div>
                ) : (
                  <div className="task-copy">
                    <h3>{item.title}</h3>
                    {item.description && <p>{item.description}</p>}
                  </div>
                )}
                <div className="task-actions">
                  {editId === item._id ? <>
                    <button type="button" onClick={() => handleUpdate(item._id)} disabled={saving}>Save</button>
                    <button type="button" className="secondary" onClick={() => setEditId(null)}>Cancel</button>
                  </> : <>
                    <button type="button" className="secondary" onClick={() => handleEdit(item)}>Edit</button>
                    <button type="button" className="danger" onClick={() => handleDelete(item._id)}>Delete</button>
                  </>}
                </div>
              </li>
            ))}
          </ul>
        }
      </section>
      <footer>Built with React, Express &amp; MongoDB</footer>
    </main>
  );
}
