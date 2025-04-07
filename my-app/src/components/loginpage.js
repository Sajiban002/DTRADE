import React, { useState, useEffect } from 'react';
import '../style/login.css';

const LoginPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [signInData, setSignInData] = useState({
    identifier: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    username: '',
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 300);
  }, []);

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setShowPassword(false);
    setMessage('');
  };
  
  const handleSignInChange = (e) => {
    setSignInData({
      ...signInData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };
  
  const checkUser = async () => {
    if (!signInData.identifier) {
      setMessage('Пожалуйста, введите имя пользователя или email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentHost = window.location.hostname;
      const serverPort = 5000;
      const response = await fetch(`http://${currentHost}:${serverPort}/api/v1/users/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: signInData.identifier }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowPassword(true);
        setMessage('');
      } else {
        setMessage(data.message || 'Пользователь не найден');
      }
    } catch (error) {
      setMessage('Ошибка сервера. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!signInData.password) {
      setMessage('Пожалуйста, введите пароль');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentHost = window.location.hostname;
      const serverPort = 5000;
      const response = await fetch(`http://${currentHost}:${serverPort}/api/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signInData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Вход выполнен успешно!');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
          if (window.location.port !== '5001') {
            window.location.href = `http://${currentHost}:5001/`;
          } else {
            window.location.href = '/';
          }
        }, 1500);
      } else {
        setMessage(data.message || 'Неверные учетные данные');
      }
    } catch (error) {
      setMessage('Ошибка сервера. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.username || !registerData.name || !registerData.email || !registerData.password) {
      setMessage('Все поля обязательны для заполнения');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setMessage('Пожалуйста, введите корректный email адрес');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const currentHost = window.location.hostname;
      const serverPort = 5000;
      const response = await fetch(`http://${currentHost}:${serverPort}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Регистрация прошла успешно! Теперь вы можете войти.');
        setTimeout(() => {
          setIsSignIn(true);
          setMessage('');
          setSignInData({
            ...signInData,
            identifier: registerData.username
          });
        }, 2000);
      } else {
        setMessage(data.message || 'Ошибка регистрации');
      }
    } catch (error) {
      setMessage('Ошибка сервера. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`login-section ${isVisible ? 'visible' : ''}`}>
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-container">
        <div className="login-content">
          <h2 className="login-title">DTRADE</h2>
          <p className="login-subtitle">
            {isSignIn ? 'Добро пожаловать в DTRADE!' : 'Создание аккаунта'}
          </p>
          {message && (
            <p className={`message ${message.includes('успешно') ? 'success' : 'error'}`}>
              {message}
            </p>
          )}
          
          <div className="form-container">
            {isSignIn ? (
              <form onSubmit={showPassword ? handleSignIn : (e) => { e.preventDefault(); checkUser(); }}>
                {!showPassword ? (
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="identifier"
                      placeholder="Имя пользователя или email" 
                      className="form-input"
                      value={signInData.identifier}
                      onChange={handleSignInChange}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <input 
                      type="password" 
                      name="password"
                      placeholder="Пароль" 
                      className="form-input"
                      value={signInData.password}
                      onChange={handleSignInChange}
                    />
                  </div>
                )}
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Загрузка...' : showPassword ? 'Войти' : 'Далее'}
                  </button>
                  {!showPassword && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={toggleForm}
                      disabled={isLoading}
                    >
                      Создать аккаунт
                    </button>
                  )}
                  {showPassword && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowPassword(false)}
                      disabled={isLoading}
                    >
                      Назад
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="username"
                    placeholder="Имя пользователя" 
                    className="form-input identifier-input"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Полное имя" 
                    className="form-input"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email" 
                    className="form-input"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Пароль" 
                    className="form-input"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Загрузка...' : 'Создать аккаунт'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={toggleForm}
                    disabled={isLoading}
                  >
                    Вернуться ко входу
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;