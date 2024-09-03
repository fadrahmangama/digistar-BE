const express = require('express');
const app = express();
app.use(express.json());

let todos = [];

// Fungsi untuk validasi input
const validateTodoInput = (description, date) => {
  if (!description || !date) {
    return false;
  }
  return true;
};

// GET /todos: Menampilkan semua todo
app.get('/todos', (req, res) => {
  res.json(todos);
});

// POST /todos: Membuat todo baru
app.post('/todos', (req, res) => {
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const newTodo = {
    id: Date.now().toString(),
    description,
    date,
    is_checked: false,
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT /todos/:id: Mengupdate todo berdasarkan id
app.put('/todos/:id', (req, res) => {
  const { id } = req.params;
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todo.description = description;
  todo.date = date;

  res.json(todo);
});

// DELETE /todos/:id: Menghapus todo berdasarkan id
app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos.splice(todoIndex, 1);
  res.status(204).send();
});

// PATCH /todos/:id/toggle: Mengubah status is_checked todo
app.patch('/todos/:id/toggle', (req, res) => {
  const { id } = req.params;

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todo.is_checked = !todo.is_checked;

  res.json(todo);
});

// Menjalankan server pada port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
