import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

@Injectable()
export class AdminService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getPendingOffers() {
    const result = await this.pool.query(
      `SELECT o.*, p.shop_name, p.fb_page_link, p.whatsapp_number
       FROM offers o
       JOIN profiles p ON o.seller_id = p.id
       WHERE o.status = 'pending'
       ORDER BY o.created_at ASC`,
    );

    return { offers: result.rows };
  }

  async approveOffer(id: string) {
    try {
      await this.pool.query('SELECT approve_offer($1)', [id]);
      return {
        message: 'Offer approved and 1 credit deducted from seller',
      };
    } catch (err: any) {
      if (err.message?.includes('not found') || err.message?.includes('pending')) {
        throw new NotFoundException('Pending offer not found');
      }
      if (err.message?.includes('insufficient credits')) {
        throw new BadRequestException('Seller has insufficient credits');
      }
      throw err;
    }
  }

  async rejectOffer(id: string) {
    const result = await this.pool.query(
      "UPDATE offers SET status = 'rejected' WHERE id = $1 AND status = 'pending' RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Pending offer not found');
    }

    return { message: 'Offer rejected', offer: result.rows[0] };
  }

  async getAllSellers() {
    const result = await this.pool.query(
      `SELECT p.*, u.email, u.phone,
        (SELECT COUNT(*) FROM offers WHERE seller_id = p.id) as total_offers,
        (SELECT COUNT(*) FROM offers WHERE seller_id = p.id AND status = 'active') as active_offers
       FROM profiles p
       JOIN users u ON p.id = u.id
       WHERE p.is_admin = FALSE
       ORDER BY p.created_at DESC`,
    );

    return { sellers: result.rows };
  }

  async getOfferEditHistory(offerId: string) {
    const result = await this.pool.query(
      'SELECT * FROM offer_edit_history WHERE offer_id = $1 ORDER BY edited_at DESC',
      [offerId],
    );

    return { history: result.rows };
  }

  async getPendingTransactions() {
    const result = await this.pool.query(
      `SELECT t.*, p.shop_name
       FROM transactions t
       JOIN profiles p ON t.seller_id = p.id
       WHERE t.status = 'pending'
       ORDER BY t.created_at ASC`,
    );

    return { transactions: result.rows };
  }

  async approveTransaction(id: string) {
    const trxResult = await this.pool.query(
      "SELECT credits_added FROM transactions WHERE id = $1 AND status = 'pending'",
      [id],
    );

    if (trxResult.rows.length === 0) {
      throw new NotFoundException('Pending transaction not found');
    }

    const credits = trxResult.rows[0].credits_added;

    try {
      await this.pool.query('SELECT approve_transaction($1, $2)', [
        id,
        credits,
      ]);
      return {
        message: `Transaction approved. ${credits} credits added to seller.`,
      };
    } catch (err: any) {
      if (err.message?.includes('not found')) {
        throw new NotFoundException('Pending transaction not found');
      }
      throw err;
    }
  }
}
