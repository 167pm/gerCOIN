import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import Login from './Login';
import Register from './Register';
import './App.css';

const categories = [
  { name: 'Еда', color: '#FF6384' },
  { name: 'Транспорт', color: '#36A2EB' },
  { name: 'Развлечения', color: '#FFCE56' },
  { name: 'Жилье', color: '#4BC0C0' },
  { name: 'Кредит', color: '#9966FF' },
  { name: 'Курение', color: '#FF5733' },
  { name: 'BMW X1', color: '#C70039' },
  { name: 'BMW X3', color: '#900C3F' },
  { name: 'Обучение', color: '#581845' },
];

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0].name);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchExpenses();
    }
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('https://gercoin.onrender.com:5000', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchExpenses();
  };

  const handleRegister = () => {
    setShowRegister(false);
  };

  const addExpense = async (expenseData) => {
    try {
      const response = await axios.post('https://gercoin.onrender.com:5000', expenseData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExpenses([...expenses, response.data]);
    } catch (error) {
      console.error('Ошибка при добавлении данных:', error);
    }
  };

  const editExpense = async (id, updatedExpense) => {
    try {
      const response = await axios.put(`https://gercoin.onrender.com:5000`, updatedExpense, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExpenses(expenses.map((exp) => (exp._id === id ? response.data : exp)));
      setEditingExpense(null);
    } catch (error) {
      console.error('Ошибка при редактировании данных:', error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`https://gercoin.onrender.com:5000`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExpenses(expenses.filter((exp) => exp._id !== id));
    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
    }
  };

  const openEditForm = (expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount);
    setTitle(expense.title);
    setCategory(expense.category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !title) return;

    const expenseData = { amount: parseFloat(amount), title, category };

    if (editingExpense) {
      await editExpense(editingExpense._id, expenseData);
    } else {
      await addExpense(expenseData);
    }

    setAmount('');
    setTitle('');
    setCategory(categories[0].name);
    setEditingExpense(null);
  };

  const getCategoryData = () => {
    const data = categories.map((cat) => ({
      name: cat.name,
      value: expenses.filter((exp) => exp.category === cat.name).reduce((sum, exp) => sum + exp.amount, 0),
    }));
    return data;
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <Register onRegister={handleRegister} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
        <button onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Учет расходов</h1>
      <div className="container">
        <form onSubmit={handleSubmit} className="expense-form">
          <input
            type="number"
            placeholder="Сумма"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Название траты"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <button type="submit">
            {editingExpense ? 'Сохранить изменения' : 'Добавить'}
          </button>
          {editingExpense && (
            <button type="button" onClick={() => setEditingExpense(null)}>
              Отмена
            </button>
          )}
        </form>

        <div className="expenses-list">
          <h2>Последние траты</h2>
          {expenses.length === 0 ? (
            <p>Трат пока нет.</p>
          ) : (
            <ul>
              {expenses.map((exp) => (
                <li key={exp._id}>
                  <span>{exp.title}</span>
                  <span>{exp.amount} ₽</span>
                  <span>{exp.category}</span>
                  <span>{exp.date}</span>
                  <button onClick={() => openEditForm(exp)}>Редактировать</button>
                  <button onClick={() => deleteExpense(exp._id)}>Удалить</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="analytics">
          <h2>Аналитика</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={getCategoryData()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {getCategoryData().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categories[index].color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
          <p>Общие расходы: {totalExpenses} ₽</p>
        </div>
      </div>
    </div>
  );
};

export default App;