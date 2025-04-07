const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const saltRounds = 12;

class User {
  static async findByIdentifier(identifier) {
    try {
      const query = `
        SELECT id, username, name, email, avatar_url, created_at FROM users 
        WHERE username = $1 OR email = $1
      `;
      const result = await pool.query(query, [identifier]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Ошибка при поиске пользователя: ${error.message}`);
    }
  }

  static async findByUsername(username) {
    try {
      const query = `
        SELECT id, username, name, email, avatar_url, created_at FROM users 
        WHERE username = $1
      `;
      const result = await pool.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Ошибка при поиске пользователя: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT id, username, name, email, avatar_url, created_at FROM users 
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Ошибка при поиске пользователя: ${error.message}`);
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      const query = `
        INSERT INTO users (username, name, email, password_hash, avatar_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, name, email, avatar_url, created_at
      `;
      const values = [
        userData.username,
        userData.name,
        userData.email,
        hashedPassword,
        userData.avatar_url || '/uploads/avatars/default-avatar.png'
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Имя пользователя или email уже существует');
      }
      throw new Error(`Ошибка создания пользователя: ${error.message}`);
    }
  }

  static async findByIdentifierWithPassword(identifier, password) {
    try {
      const query = `
        SELECT id, username, name, email, password_hash, avatar_url, created_at FROM users 
        WHERE username = $1 OR email = $1
      `;
      const result = await pool.query(query, [identifier]);
      const user = result.rows[0];
      if (!user) {
        return null;
      }
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return null;
      }
      delete user.password_hash;
      return user;
    } catch (error) {
      throw new Error(`Ошибка при проверке пароля: ${error.message}`);
    }
  }

  static async updateUsername(userId, newUsername) {
    try {
      const query = `
        UPDATE users 
        SET username = $1 
        WHERE id = $2
        RETURNING id, username, name, email, avatar_url, created_at
      `;
      const result = await pool.query(query, [newUsername, userId]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Имя пользователя уже занято');
      }
      throw new Error(`Ошибка обновления имени пользователя: ${error.message}`);
    }
  }

  static async updateAvatar(userId, avatarUrl) {
    try {
      const query = `
        UPDATE users 
        SET avatar_url = $1 
        WHERE id = $2
        RETURNING id, username, name, email, avatar_url, created_at
      `;
      const result = await pool.query(query, [avatarUrl, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Ошибка обновления аватара: ${error.message}`);
    }
  }

  static async createUserRequest(userId, requestData) {
    try {
        const query = `
            INSERT INTO user_requests (user_id, request_data)
            VALUES ($1, $2)
            RETURNING request_id, user_id, request_data, request_timestamp
        `;
        const values = [userId, requestData];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw new Error(`Ошибка при создании запроса пользователя: ${error.message}`);
    }
}

static async getUserRequests(userId) {
    try {
        const query = `
            SELECT request_id, user_id, request_data, request_timestamp
            FROM user_requests
            WHERE user_id = $1
            ORDER BY request_timestamp DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    } catch (error) {
        throw new Error(`Ошибка при получении запросов пользователя: ${error.message}`);
    }
}
static async createGlobalRequest(assetType, assetSymbol, searchTerm, requestData) {
  try {
      const query = `
          INSERT INTO global_requests (asset_type, asset_symbol, search_term, request_data)
          VALUES ($1, $2, $3, $4)
          RETURNING request_id, asset_type, asset_symbol, search_term, request_timestamp, request_data
      `;
      const values = [assetType, assetSymbol, searchTerm, requestData];
      const result = await pool.query(query, values);
      return result.rows[0];
  } catch (error) {
      throw new Error(`Ошибка при создании глобального запроса: ${error.message}`);
  }
}

static async createUserRequest(userId, requestData) {
  try {
      const query = `
          INSERT INTO user_requests (user_id, request_data)
          VALUES ($1, $2)
          RETURNING request_id, user_id, request_data, request_timestamp
      `;
      const values = [userId, requestData];
      const result = await pool.query(query, values);
      return result.rows[0];
  } catch (error) {
      throw new Error(`Ошибка при создании запроса пользователя: ${error.message}`);
  }
}

static async getUserRequests(userId) {
  try {
      const query = `
          SELECT request_id, user_id, request_data, request_timestamp
          FROM user_requests
          WHERE user_id = $1
          ORDER BY request_timestamp DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
  } catch (error) {
      throw new Error(`Ошибка при получении запросов пользователя: ${error.message}`);
  }
}
}

module.exports = User;

