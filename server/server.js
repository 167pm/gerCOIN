require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
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

// Роуты
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении данных' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, title, category } = req.body;
    const newExpense = new Expense({ amount, title, category });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при добавлении данных' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});