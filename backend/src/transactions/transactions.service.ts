import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { transactionSchema } from '../common/validators';

@Injectable()
export class TransactionsService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async createTopUp(userId: string, body: any) {
    const validation = transactionSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const { amount, bkash_trx_id } = validation.data;
    const credits_to_add = Math.floor(amount / 50);

    try {
      const result = await this.pool.query(
        `INSERT INTO transactions (seller_id, amount, bkash_trx_id, credits_added, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [userId, amount, bkash_trx_id, credits_to_add],
      );

      return {
        message: 'Top-up request submitted. Pending admin approval.',
        transaction: result.rows[0],
      };
    } catch (err: any) {
      if (err.code === '23505') {
        throw new BadRequestException(
          'This bKash transaction ID has already been used',
        );
      }
      throw err;
    }
  }

  async getMyTransactions(userId: string) {
    const result = await this.pool.query(
      'SELECT * FROM transactions WHERE seller_id = $1 ORDER BY created_at DESC',
      [userId],
    );

    return { transactions: result.rows };
  }
}
