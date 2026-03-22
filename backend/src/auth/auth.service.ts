import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(id: string, email: string): string {
    return this.jwtService.sign({ id, email });
  }

  async signup(phone: string, password: string) {
    if (!phone || !password) {
      throw new BadRequestException('ফোন নম্বর এবং পাসওয়ার্ড দিতে হবে।');
    }

    if (!/^\d{11}$/.test(phone)) {
      throw new BadRequestException('ফোন নম্বর অবশ্যই ১১ সংখ্যার হতে হবে।');
    }

    if (password.length < 6) {
      throw new BadRequestException('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    }

    const existing = await this.pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone],
    );
    if (existing.rows.length > 0) {
      throw new BadRequestException('এই ফোন নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। লগইন করুন।');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await this.pool.query(
      "INSERT INTO users (email, phone, password_hash) VALUES ($1, $2, $3) RETURNING id, phone, created_at",
      ['', phone, password_hash],
    );

    const user = result.rows[0];
    const token = this.generateToken(user.id, user.phone);

    return {
      message: 'Account created successfully',
      user: { id: user.id, phone: user.phone },
      token,
    };
  }

  async login(phone: string, password: string) {
    if (!phone || !password) {
      throw new BadRequestException('ফোন নম্বর/ইমেইল এবং পাসওয়ার্ড দিতে হবে।');
    }

    // Try phone first, then email
    let result = await this.pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone],
    );

    if (result.rows.length === 0) {
      result = await this.pool.query(
        'SELECT * FROM users WHERE email = $1',
        [phone],
      );
    }

    if (result.rows.length === 0) {
      throw new UnauthorizedException('এই ফোন নম্বর/ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException('পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।');
    }

    const profileResult = await this.pool.query(
      'SELECT id, is_admin FROM profiles WHERE id = $1',
      [user.id],
    );
    const hasProfile = profileResult.rows.length > 0;
    const isAdmin = profileResult.rows[0]?.is_admin || false;

    const token = this.generateToken(user.id, user.phone);

    return {
      message: 'Login successful',
      user: { id: user.id, phone: user.phone },
      hasProfile,
      isAdmin,
      token,
    };
  }
}
