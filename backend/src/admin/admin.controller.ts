import { Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('sellers')
  async getAllSellers() {
    return this.adminService.getAllSellers();
  }

  @Get('offers/pending')
  async getPendingOffers() {
    return this.adminService.getPendingOffers();
  }

  @Put('offers/:id/approve')
  async approveOffer(@Param('id') id: string) {
    return this.adminService.approveOffer(id);
  }

  @Put('offers/:id/reject')
  async rejectOffer(@Param('id') id: string) {
    return this.adminService.rejectOffer(id);
  }

  @Get('offers/:id/history')
  async getOfferEditHistory(@Param('id') id: string) {
    return this.adminService.getOfferEditHistory(id);
  }

  @Get('transactions/pending')
  async getPendingTransactions() {
    return this.adminService.getPendingTransactions();
  }

  @Put('transactions/:id/approve')
  async approveTransaction(@Param('id') id: string) {
    return this.adminService.approveTransaction(id);
  }
}
