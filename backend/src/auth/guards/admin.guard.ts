import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../database/database.module';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const result = await this.pool.query(
      'SELECT is_admin FROM profiles WHERE id = $1',
      [user.id],
    );

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
