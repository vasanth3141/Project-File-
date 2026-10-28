require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern-app';

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const Todo = mongoose.model('Todo', todoSchema);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/todos', async (_req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    res.status(500).json({ message: 'Unable to fetch tasks.' });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const todo = await Todo.create({ title, description });
    res.status(201).json(todo);
  } catch (error) {
    console.error('Failed to create todo:', error);
    res.status(500).json({ message: 'Unable to create task.' });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID.' });
    }
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    if (!title) return res.status(400).json({ message: 'Title is required.' });

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );
    if (!todo) return res.status(404).json({ message: 'Task not found.' });
    res.json(todo);
  } catch (error) {
    console.error('Failed to update todo:', error);
    res.status(500).json({ message: 'Unable to update task.' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID.' });
    }
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ message: 'Task not found.' });
    res.status(204).end();
  } catch (error) {
    console.error('Failed to delete todo:', error);
    res.status(500).json({ message: 'Unable to delete task.' });
  }
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected.');
    app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
