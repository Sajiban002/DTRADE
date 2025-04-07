DROP TABLE IF EXISTS user_requests CASCADE;
DROP TABLE IF EXISTS global_requests;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE global_requests (
    request_id SERIAL PRIMARY KEY,
    asset_type VARCHAR(50) NOT NULL, 
    asset_symbol VARCHAR(50) NOT NULL, 
    search_term VARCHAR(255),   
    request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    request_data JSON NULL     
);

CREATE TABLE user_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    request_data JSON NOT NULL, 
    request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SELECT * FROM users;
SELECT * FROM user_requests;
SELECT * FROM global_requests;