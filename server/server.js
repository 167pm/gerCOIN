require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User'); // Импорт модели пользователя

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Секрет для токена

// Middleware
app.use(cors({
  origin: '*', // Замени на домен твоего приложения, если нужно
  credentials: true,
}));
app.use(express.json());

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB подключен'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

// Схема и модель для расходов
const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, default: new Date().toLocaleDateString() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Expense = mongoose.model('Expense', expenseSchema);

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка на существующего пользователя
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание нового пользователя
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка регистрации', error: err.message });
  }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Генерация токена
    const token = jwt.sign({ userId: user._id, username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка входа', error: err.message });
  }
});

// Получение всех расходов (защищенный маршрут)
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении данных' });
  }
});

// Добавление расхода
app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, title, category, userId } = req.body;
    const newExpense = new Expense({ amount, title, category, userId });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении данных' });
  }
});

// Редактирование расхода
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, title, category } = req.body;
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { amount, title, category },
      { new: true }
    );
    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при редактировании данных' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
