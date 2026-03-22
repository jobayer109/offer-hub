import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { profileCompletionSchema } from '../common/validators';

@Injectable()
export class ProfileService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getProfile(userId: string) {
    const result = await this.pool.query(
      'SELECT * FROM profiles WHERE id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Profile not found. Please complete your profile.',
      );
    }

    return { profile: result.rows[0] };
  }

  async completeProfile(userId: string, body: any) {
    const validation = profileCompletionSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { email, shop_name, fb_page_link, whatsapp_number } = validation.data;

    // Save email to users table
    await this.pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, userId]);

    const existing = await this.pool.query(
      'SELECT id FROM profiles WHERE id = $1',
      [userId],
    );

    try {
      if (existing.rows.length > 0) {
        const result = await this.pool.query(
          `UPDATE profiles SET shop_name = $1, fb_page_link = $2, whatsapp_number = $3
           WHERE id = $4 RETURNING *`,
          [shop_name, fb_page_link, whatsapp_number, userId],
        );

        return { message: 'Profile updated', profile: result.rows[0] };
      }

      const result = await this.pool.query(
        `INSERT INTO profiles (id, shop_name, fb_page_link, whatsapp_number, credits_balance, is_admin)
         VALUES ($1, $2, $3, $4, 5, FALSE) RETURNING *`,
        [userId, shop_name, fb_page_link, whatsapp_number],
      );

      return {
        message: 'Profile created with 5 bonus credits',
        profile: result.rows[0],
      };
    } catch (err: any) {
      if (err.code === '23505' && err.constraint?.includes('shop_name')) {
        throw new BadRequestException('This shop name is already taken');
      }
      throw err;
    }
  }
}
