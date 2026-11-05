import bcryptjs from 'bcryptjs';
import { query } from '../../config/database.js';
import { generateToken } from '../../utils/jwt.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import type { User, AuthResponse, UserProfile } from './auth.types.js';

export const authService = {
  async register(data: RegisterInput): Promise<Omit<User, 'password'>> {
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [data.email]);

    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const result = await query(
      `INSERT INTO users (username, full_name, email, password, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, role, status, username, full_name, phone`,
      [data.username, data.fullName, data.email, hashedPassword, data.phone, data.role, 'PENDING']
    );

    const user = result.rows[0] as Omit<User, 'password'>;
    return user;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const result = await query(
      'SELECT id, email, password, role, status, full_name, username, phone FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0] as User;

    if (user.status === 'SUSPENDED') {
      throw new Error('Account is suspended');
    }

    const isPasswordValid = await bcryptjs.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      fotoProfile: user.foto_profile,
      address: user.address,
      bio: user.bio,
      village: user.village,
      farmingExperience: user.farming_experience,
      farmArea: user.farm_area,
      createdAt: user.created_at,
    };

    return { token, user: userProfile };
  },

  async getCurrentUser(userId: number): Promise<UserProfile> {
    const result = await query(
      `SELECT id, username, full_name, email, phone, role, status, foto_profile, 
              address, bio, village, farming_experience, farm_area, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const row = result.rows[0] as Omit<User, 'password'>;
    return {
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      status: row.status,
      fotoProfile: row.foto_profile,
      address: row.address,
      bio: row.bio,
      village: row.village,
      farmingExperience: row.farming_experience,
      farmArea: row.farm_area,
      createdAt: row.created_at,
    };
  },
};
