import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../database/database.module';

@Injectable()
export class BannersService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async getActiveBanners() {
    const result = await this.pool.query(
      'SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order ASC LIMIT 5',
    );
    return { banners: result.rows };
  }

  async getAllBanners() {
    const result = await this.pool.query(
      'SELECT * FROM banners ORDER BY sort_order ASC',
    );
    return { banners: result.rows };
  }

  async createBanner(body: {
    title: string;
    image_url: string;
    link_url: string;
    sort_order?: number;
  }) {
    const { title, image_url, link_url, sort_order } = body;
    const result = await this.pool.query(
      `INSERT INTO banners (title, image_url, link_url, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, image_url, link_url, sort_order ?? 0],
    );
    return { message: 'Banner created', banner: result.rows[0] };
  }

  async updateBanner(id: string, body: { title?: string; image_url?: string; link_url?: string; sort_order?: number }) {
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (body.title !== undefined) { sets.push(`title = $${idx++}`); params.push(body.title); }
    if (body.image_url !== undefined) { sets.push(`image_url = $${idx++}`); params.push(body.image_url); }
    if (body.link_url !== undefined) { sets.push(`link_url = $${idx++}`); params.push(body.link_url); }
    if (body.sort_order !== undefined) { sets.push(`sort_order = $${idx++}`); params.push(body.sort_order); }

    if (sets.length === 0) {
      throw new NotFoundException('Nothing to update');
    }

    params.push(id);
    const result = await this.pool.query(
      `UPDATE banners SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params,
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found');
    }
    return { message: 'Banner updated', banner: result.rows[0] };
  }

  async deleteBanner(id: string) {
    const result = await this.pool.query(
      'DELETE FROM banners WHERE id = $1 RETURNING *',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found');
    }
    return { message: 'Banner deleted' };
  }

  async toggleBanner(id: string) {
    const result = await this.pool.query(
      'UPDATE banners SET is_active = NOT is_active WHERE id = $1 RETURNING *',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Banner not found');
    }
    return { message: 'Banner toggled', banner: result.rows[0] };
  }
}
