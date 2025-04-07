const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка статических файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Статические файлы настроены для:', path.join(__dirname, 'uploads'));

// Подключение маршрутов
const userRoutes = require('./src/controllers/userController');
app.use('/api/v1/users', userRoutes);

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});