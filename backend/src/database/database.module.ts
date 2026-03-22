import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

const DATABASE_POOL = 'DATABASE_POOL';

const databaseProvider = {
  provide: DATABASE_POOL,
  useFactory: () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    return pool;
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}

export { DATABASE_POOL };
