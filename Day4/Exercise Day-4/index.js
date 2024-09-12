const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Koneksi ke MongoDB
mongoose
  .connect("mongodb://localhost:27017/todo-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Definisikan skema dan model untuk Todo
const todoSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: String, required: true },
  is_checked: { type: Boolean, default: false },
});

const Todo = mongoose.model("Todo", todoSchema);

// Validasi input
const validateTodoInput = (description, date) => {
  if (!description || !date) {
    return false;
  }
  return true;
};

// GET semua todos
app.get("/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

// POST todo baru
app.post("/todos", async (req, res) => {
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const newTodo = new Todo({
    description,
    date,
  });

  await newTodo.save();
  res.status(201).json(newTodo);
});

// PUT untuk update todo berdasarkan id
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const todo = await Todo.findById(id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.description = description;
  todo.date = date;
  await todo.save();

  res.json(todo);
});

// DELETE todo berdasarkan id
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findByIdAndDelete(id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(204).send();
});

// PATCH untuk toggle status todo
app.patch("/todos/:id/toggle", async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findById(id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.is_checked = !todo.is_checked;
  await todo.save();

  res.json(todo);
});

// Jalankan server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
