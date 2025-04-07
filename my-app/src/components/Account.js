import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/account.css';

const Account = () => {
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const navigate = useNavigate();
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setError('Вы не авторизованы');
                setIsLoading(false);
                return;
            }

            try {
                const currentHost = window.location.hostname;
                const serverPort = 5000;
                const baseUrl = `http://${currentHost}:${serverPort}`;
                const response = await fetch(`${baseUrl}/api/v1/users/profile/${user.id}`);
                const data = await response.json();
                if (response.ok) {
                    setUserData(data.user);
                    setNewUsername(data.user.username);
                    setUserData(prevUserData => ({
                        ...prevUserData,
                        userRequests: data.userRequests
                    }));
                } else {
                    setError(data.message || 'Ошибка загрузки данных');
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка сервера');
            } finally {
                setIsLoading(false);
                setTimeout(() => setIsVisible(true), 300);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const openEditModal = () => {
        setSelectedRequest(null);
        setIsModalOpen(true);
        setUploadMessage('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewUsername(userData?.username || '');
        setAvatarFile(null);
        setUploadMessage('');
        setSelectedRequest(null);
    };

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        if (!newUsername || !userData || newUsername === userData.username) {
            setUploadMessage('Введите новый никнейм или он не изменился');
            return;
        }

        try {
            const currentHost = window.location.hostname;
            const serverPort = 5000;
            const baseUrl = `http://${currentHost}:${serverPort}`;
            const response = await fetch(`${baseUrl}/api/v1/users/update-username/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: newUsername }),
            });

            const data = await response.json();
            if (response.ok) {
                setUserData({ ...userData, username: newUsername });
                setUploadMessage('Никнейм успешно обновлён');
            } else {
                setUploadMessage(data.message || 'Ошибка обновления никнейма');
            }
        } catch (err) {
            console.error('Ошибка обновления никнейма:', err);
            setUploadMessage('Ошибка сервера');
        }
    };

    const handleUploadAvatar = async (e) => {
        e.preventDefault();
        if (!avatarFile) {
            setUploadMessage('Пожалуйста, выберите файл');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const currentHost = window.location.hostname;
            const serverPort = 5000;
            const baseUrl = `http://${currentHost}:${serverPort}`;
            const response = await fetch(`${baseUrl}/api/v1/users/upload-avatar/${userData.id}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                const fullAvatarUrl = `${baseUrl}${data.avatarUrl}`;
                setUserData({ ...userData, avatar_url: fullAvatarUrl });
                setUploadMessage('Аватар успешно обновлён');
            } else {
                setUploadMessage(data.message || 'Ошибка загрузки аватарки');
            }
        } catch (err) {
            console.error('Ошибка загрузки аватара:', err);
            setUploadMessage('Ошибка сервера');
        }
    };

    const openRequestModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const renderRequestDetails = () => {
        if (!selectedRequest || !selectedRequest.request_data) {
            return <p>Ошибка: Неверный формат данных запроса.</p>;
        }

        const { selectedAsset, prediction } = selectedRequest.request_data;

        if (!selectedAsset || !prediction) {
            return <p>Ошибка: Отсутствуют данные об активе или прогнозе.</p>;
        }

        return (
            <div>
                <p>Актив: {selectedAsset.name}</p>
                <p>Прогноз:</p>
                <ul>
                    <li>Направление: {prediction.direction}</li>
                    <li>Процент: {prediction.percentage}%</li>
                    <li>Общий вывод: {prediction.summary}</li>
                </ul>
                <h3>Глубокий анализ:</h3>
                <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(prediction.analysis) }} />
            </div>
        );
    };

    const convertMarkdownToHtml = (markdown) => {
        let html = markdown
            .replace(/## (.*)/g, '<h3>$1</h3>')
            .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
            .replace(/\*([^*]+)\*/g, '<i>$1</i>')
            .replace(/^- (.*)$/gm, '<li>$1</li>');
        if (html.includes('<li>')) {
            html = '<ul>' + html.replace(/<li>/g, '<li>') + '</ul>';
        }
        return html;
    };


    if (isLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const avatarSrc = userData?.avatar_url
        ? userData.avatar_url.startsWith('http')
            ? userData.avatar_url
            : `http://${window.location.hostname}:5000${userData.avatar_url}`
        : '/uploads/avatars/default-avatar.png';

    return (
        <div className={`account-page ${isVisible ? 'visible' : ''}`}>
            <div className="account-card">
                <div className="account-left">
                    <img
                        src={avatarSrc}
                        alt="Avatar"
                        className="account-avatar"
                        onError={(e) => console.error('Ошибка загрузки аватара:', e)}
                    />
                    <h2 className="account-name">{userData?.name}</h2>
                    <p className="account-username">@{userData?.username}</p>
                    <button className="edit-profile-button" onClick={openEditModal}>Edit Profile</button>
                    <button className="logout-button" onClick={handleLogout}>Log out</button>
                </div>
                <div className="account-right">
                    <h2>История запросов</h2>
                    {userData?.userRequests && userData.userRequests.length > 0 ? (
                        <ul>
                            {userData.userRequests.map((request, index) => (
                                <li key={index}>
                                    <button onClick={() => openRequestModal(request)}>
                                        Запрос {index + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Нет истории запросов.</p>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {selectedRequest ? (
                            <>
                                <h2>Детали запроса</h2>
                                {renderRequestDetails()}
                                <button className="modal-close-button" onClick={closeModal}>Закрыть</button>
                            </>
                        ) : (
                            <>
                                <h2>Редактировать профиль</h2>
                                <form onSubmit={handleUpdateUsername}>
                                    <div className="form-group">
                                        <label htmlFor="username">Новый никнейм:</label>
                                        <input
                                            type="text"
                                            id="username"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value)}
                                            className="form-input"
                                        />
                                    </div>
                                    <button type="submit" className="modal-button">Обновить никнейм</button>
                                </form>
                                <form onSubmit={handleUploadAvatar}>
                                    <div className="form-group">
                                        <label htmlFor="avatar">Загрузить аватар:</label>
                                        <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
                                            <input
                                                type="file"
                                                id="avatar"
                                                accept="image/*"
                                                onChange={(e) => setAvatarFile(e.target.files[0])}
                                                style={{
                                                    position: 'absolute',
                                                    fontSize: '200px',
                                                    opacity: '0',
                                                    top: '0',
                                                    left: '0',
                                                    width: '100%',
                                                    height: '100%',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                            <div style={{
                                                padding: '12px',
                                                border: '1px solid #333',
                                                borderRadius: '8px',
                                                backgroundColor: '#1a1a1a',
                                                color: '#fff',
                                                fontFamily: 'JetBrainsMono, monospace',
                                                fontSize: '14px',
                                            }}>
                                                {avatarFile ? avatarFile.name : 'Файл не выбран'}
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="modal-upload-button">Загрузить аватар</button>
                                </form>
                                {uploadMessage && <p className={uploadMessage.includes('успешно') ? 'success-message' : 'error-message'}>{uploadMessage}</p>}
                                <button className="modal-close-button" onClick={closeModal}>Закрыть</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;