import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../common/config/db.js';
import { env } from '../common/config/env.js';
import { AppError } from '../common/errors/AppError.js';

export class AuthService {
  static async signup(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    city?: string;
    country?: string;
    bio?: string;
    photo_url?: string;
    language_pref?: string;
  }) {
    const { name, email, password, phone, city, country, bio, photo_url, language_pref } = userData;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
    if (existing.rows.length > 0) {
      throw new AppError('Account with this email already exists', 409);
    }

    const userId = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    const photo = photo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    await query(`
      INSERT INTO users (id, name, email, password_hash, photo_url, language_pref, is_admin, phone, city, country, bio, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
    `, [userId, name.trim(), email.trim().toLowerCase(), hash, photo, language_pref || 'English', false, phone || null, city || null, country || null, bio || null]);

    const user = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      photo_url: photo,
      language_pref: language_pref || 'English',
      is_admin: false,
      phone: phone || null,
      city: city || null,
      country: country || null,
      bio: bio || null
    };

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  static async login(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const res = await query(`
      SELECT id, name, email, password_hash, photo_url, language_pref, is_admin, phone, city, country, bio
      FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1
    `, [email.trim()]);

    if (res.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = res.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      photo_url: user.photo_url,
      language_pref: user.language_pref,
      is_admin: !!user.is_admin,
      phone: user.phone,
      city: user.city,
      country: user.country,
      bio: user.bio
    };

    const tokens = this.generateTokens(userObj);
    return { user: userObj, ...tokens };
  }

  static async refreshToken(token: string) {
    if (!token) throw new AppError('Refresh token required', 400);

    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as any;
      const res = await query(`SELECT id, name, email, is_admin FROM users WHERE id = $1 LIMIT 1`, [decoded.userId]);
      if (res.rows.length === 0) throw new AppError('User not found', 404);

      const user = res.rows[0];
      return this.generateTokens({
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: !!user.is_admin
      });
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  static generateTokens(user: { id: string; email: string; is_admin?: boolean; name: string }) {
    const payload = {
      userId: user.id,
      email: user.email,
      isAdmin: !!user.is_admin,
      name: user.name
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }
}
