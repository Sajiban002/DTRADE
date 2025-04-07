const express = require('express');
const User = require('../models/userModel');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    console.log('Путь для сохранения аватара:', uploadDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Директория создана:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const fileName = `avatar-${req.params.userId}-${uniqueSuffix}${extension}`;
    console.log('Имя файла для сохранения:', fileName);
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения могут быть загружены!'), false);
    }
  }
});

router.post('/check', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ message: 'Необходимо ввести имя пользователя или email' });
    }
    const user = await User.findByIdentifier(identifier);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    return res.status(200).json({ message: 'Пользователь найден' });
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    return res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }
    const user = await User.findByIdentifierWithPassword(identifier, password);
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    return res.status(200).json({ 
      message: 'Вход выполнен успешно',
      user: user
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Введите корректный email адрес' });
    }
    const existingUser = await User.findByIdentifier(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Имя пользователя уже занято' });
    }
    const emailCheck = await User.findByIdentifier(email);
    if (emailCheck) {
      return res.status(400).json({ message: 'Email уже используется' });
    }
    const newUser = await User.create({
      username,
      name,
      email,
      password,
      avatar_url: '/uploads/avatars/default-avatar.png'
    });
    return res.status(201).json({
      message: 'Регистрация прошла успешно',
      user: newUser
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    if (error.message.includes('уже существует')) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/update-username/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Имя пользователя обязательно' });
    }
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id !== parseInt(userId)) {
      return res.status(400).json({ message: 'Имя пользователя уже занято' });
    }
    const updatedUser = await User.updateUsername(userId, username);
    return res.status(200).json({
      message: 'Имя пользователя обновлено',
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при обновлении имени пользователя:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/upload-avatar/:userId', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    console.log('Сохранённый путь к аватару:', avatarUrl);
    const updatedUser = await User.updateAvatar(userId, avatarUrl);
    return res.status(200).json({
      message: 'Аватар обновлён',
      avatarUrl: avatarUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при загрузке аватара:', error);
    return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'Пользователь не найден' });
      }

      const userRequests = await User.getUserRequests(userId); 

      return res.status(200).json({ user, userRequests }); 
  } catch (error) {
      console.error('Ошибка при получении профиля:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/save-request/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const { requestData } = req.body;

      if (!requestData) {
          return res.status(400).json({ message: 'Данные запроса обязательны' });
      }
      await User.createGlobalRequest(
              requestData.selectedAsset.type,
              requestData.selectedAsset.symbol,
              requestData.searchTerm,
              requestData
      );

      const newRequest = await User.createUserRequest(userId, requestData);

      return res.status(201).json({
          message: 'Запрос пользователя сохранен',
          request: newRequest
      });
  } catch (error) {
      console.error('Ошибка при сохранении запроса пользователя:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
