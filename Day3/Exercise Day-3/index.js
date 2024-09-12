const express = require("express");
const app = express();
app.use(express.json());

let todos = [];

const validateTodoInput = (description, date) => {
  if (!description || !date) {
    return false;
  }
  return true;
};

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: "Invalid input" });
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

app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.description = description;
  todo.date = date;

  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;

  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todos.splice(todoIndex, 1);
  res.status(204).send();
});

app.patch("/todos/:id/toggle", (req, res) => {
  const { id } = req.params;

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.is_checked = !todo.is_checked;

  res.json(todo);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
