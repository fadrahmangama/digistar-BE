const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = "ini_secret_key";

mongoose.connect("mongodb://localhost:27017/todo-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const todoSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: String, required: true },
  is_checked: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Todo = mongoose.model("Todo", todoSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });

    req.user = user;
    next();
  });
};

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
  });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password." });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  res.json({ token });
});

const validateTodoInput = (description, date) => {
  if (!description || !date) {
    return false;
  }
  return true;
};

app.get("/todos", authenticateToken, async (req, res) => {
  const todos = await Todo.find({ user: req.user.userId });
  res.json(todos);
});

app.post("/todos", authenticateToken, async (req, res) => {
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const newTodo = new Todo({
    description,
    date,
    user: req.user.userId,
  });

  await newTodo.save();
  res.status(201).json(newTodo);
});

app.put("/todos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { description, date } = req.body;

  if (!validateTodoInput(description, date)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const todo = await Todo.findOne({ _id: id, user: req.user.userId }); // Pastikan hanya milik user yang login
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.description = description;
  todo.date = date;
  await todo.save();

  res.json(todo);
});

app.delete("/todos/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findOneAndDelete({ _id: id, user: req.user.userId });
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  res.status(204).send();
});

app.patch("/todos/:id/toggle", authenticateToken, async (req, res) => {
  const { id } = req.params;

  const todo = await Todo.findOne({ _id: id, user: req.user.userId });
  if (!todo) {
    return res.status(404).json({ message: "Todo not found" });
  }

  todo.is_checked = !todo.is_checked;
  await todo.save();

  res.json(todo);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
