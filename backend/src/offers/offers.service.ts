import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';
import { offerCreationSchema } from '../common/validators';

@Injectable()
export class OffersService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  // Auto-expire old offers
  private async expireOffers() {
    await this.pool.query(
      `UPDATE offers SET status = 'expired' WHERE status = 'active' AND expires_at < NOW()`,
    );
  }

  async getTrendingOffers(limit = 6) {
    await this.expireOffers();
    // Trending = view velocity (views/hour) + discount bonus
    const result = await this.pool.query(
      `SELECT o.*, p.shop_name,
        (
          o.view_count / GREATEST(EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 3600, 1) * 1.0
          + LEAST(((o.regular_price - o.offer_price) / NULLIF(o.regular_price, 0)) * 100, 50) * 0.2
        ) AS trending_score
       FROM offers o
       JOIN profiles p ON o.seller_id = p.id
       WHERE o.status = 'active'
       ORDER BY trending_score DESC
       LIMIT $1`,
      [limit],
    );
    return { offers: result.rows };
  }

  async getOffers(category?: string, page = 1, limit = 20) {
    await this.expireOffers();
    const offset = (page - 1) * limit;

    let query: string;
    let params: any[];

    if (category && category !== 'all') {
      query = `
        SELECT o.*, p.shop_name
        FROM offers o
        JOIN profiles p ON o.seller_id = p.id
        WHERE o.status = 'active' AND o.category = $1
        ORDER BY o.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [category, limit, offset];
    } else {
      query = `
        SELECT o.*, p.shop_name
        FROM offers o
        JOIN profiles p ON o.seller_id = p.id
        WHERE o.status = 'active'
        ORDER BY o.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      params = [limit, offset];
    }

    const result = await this.pool.query(query, params);

    let countQuery: string;
    let countParams: any[];
    if (category && category !== 'all') {
      countQuery =
        "SELECT COUNT(*) FROM offers WHERE status = 'active' AND category = $1";
      countParams = [category];
    } else {
      countQuery = "SELECT COUNT(*) FROM offers WHERE status = 'active'";
      countParams = [];
    }
    const countResult = await this.pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      offers: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOfferById(id: string) {
    const result = await this.pool.query(
      `SELECT o.*, p.shop_name, p.fb_page_link, p.whatsapp_number
       FROM offers o
       JOIN profiles p ON o.seller_id = p.id
       WHERE o.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Offer not found');
    }

    return { offer: result.rows[0] };
  }

  async getOffersBySeller(sellerId: string) {
    const result = await this.pool.query(
      `SELECT o.*, p.shop_name, p.fb_page_link, p.whatsapp_number
       FROM offers o
       JOIN profiles p ON o.seller_id = p.id
       WHERE o.seller_id = $1 AND o.status = 'active'
       ORDER BY o.created_at DESC`,
      [sellerId],
    );

    return { offers: result.rows };
  }

  async incrementViewCount(id: string) {
    await this.pool.query(
      `UPDATE offers SET view_count = view_count + 1
       WHERE id = $1 AND status = 'active'`,
      [id],
    );
  }

  async createOffer(userId: string, body: any) {
    const validation = offerCreationSchema.safeParse(body);
    if (!validation.success) {
      throw new BadRequestException({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    const {
      title,
      description,
      category,
      regular_price,
      offer_price,
      target_link,
      image_urls,
    } = validation.data;

    const profileResult = await this.pool.query(
      'SELECT credits_balance FROM profiles WHERE id = $1',
      [userId],
    );

    if (profileResult.rows.length === 0) {
      throw new BadRequestException(
        'Profile not found. Please complete your profile first.',
      );
    }

    if (profileResult.rows[0].credits_balance < 1) {
      throw new ForbiddenException(
        'Insufficient credits. You need at least 1 credit to post an offer.',
      );
    }

    const result = await this.pool.query(
      `INSERT INTO offers (seller_id, title, description, category, regular_price, offer_price, image_urls, target_link, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        userId,
        title,
        description,
        category,
        regular_price,
        offer_price,
        image_urls || [],
        target_link,
      ],
    );

    return {
      message:
        'Offer submitted for review. 1 credit will be deducted upon approval.',
      offer: result.rows[0],
    };
  }

  async updateOffer(userId: string, offerId: string, body: any) {
    // Fetch the existing offer
    const existing = await this.pool.query(
      'SELECT * FROM offers WHERE id = $1',
      [offerId],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundException('Offer not found');
    }

    const offer = existing.rows[0];

    // Verify ownership
    if (offer.seller_id !== userId) {
      throw new ForbiddenException('You can only edit your own offers');
    }

    // Only allow editing certain fields
    const allowedFields = [
      'title',
      'description',
      'category',
      'regular_price',
      'offer_price',
      'target_link',
      'image_urls',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    // Validate with the same schema if price fields are being updated
    const mergedData = {
      title: updates.title ?? offer.title,
      description: updates.description ?? offer.description,
      category: updates.category ?? offer.category,
      regular_price: updates.regular_price !== undefined
        ? Number(updates.regular_price)
        : Number(offer.regular_price),
      offer_price: updates.offer_price !== undefined
        ? Number(updates.offer_price)
        : Number(offer.offer_price),
      target_link: updates.target_link ?? offer.target_link,
      image_urls: updates.image_urls ?? offer.image_urls ?? [],
    };

    const validation = offerCreationSchema.safeParse(mergedData);
    if (!validation.success) {
      throw new BadRequestException({
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      });
    }

    // Record changes in edit history
    const changedFields: string[] = [];
    for (const field of Object.keys(updates)) {
      const oldVal = field === 'image_urls'
        ? JSON.stringify(offer[field])
        : String(offer[field] ?? '');
      const newVal = field === 'image_urls'
        ? JSON.stringify(updates[field])
        : String(updates[field] ?? '');

      if (oldVal !== newVal) {
        changedFields.push(field);
        await this.pool.query(
          `INSERT INTO offer_edit_history (offer_id, field_name, old_value, new_value)
           VALUES ($1, $2, $3, $4)`,
          [offerId, field, oldVal, newVal],
        );
      }
    }

    if (changedFields.length === 0) {
      return { message: 'No changes detected', offer, changedFields: [] };
    }

    // Build dynamic UPDATE query
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    for (const field of changedFields) {
      setClauses.push(`${field} = $${paramIndex}`);
      params.push(updates[field]);
      paramIndex++;
    }

    // Always reset status to pending
    setClauses.push(`status = 'pending'`);

    params.push(offerId);
    const updateQuery = `UPDATE offers SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.pool.query(updateQuery, params);

    return {
      message: 'Offer updated and sent for re-review',
      offer: result.rows[0],
      changedFields,
    };
  }

  async getMyOffers(userId: string) {
    const result = await this.pool.query(
      'SELECT * FROM offers WHERE seller_id = $1 ORDER BY created_at DESC',
      [userId],
    );

    return { offers: result.rows };
  }
}
