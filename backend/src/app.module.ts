import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { OffersModule } from './offers/offers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ProfileModule,
    OffersModule,
    TransactionsModule,
    AdminModule,
    UploadModule,
    BannersModule,
  ],
})
export class AppModule {}
