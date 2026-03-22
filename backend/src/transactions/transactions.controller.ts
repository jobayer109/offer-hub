import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('top-up')
  async createTopUp(@Req() req: any, @Body() body: any) {
    return this.transactionsService.createTopUp(req.user.id, body);
  }

  @Get('my')
  async getMyTransactions(@Req() req: any) {
    return this.transactionsService.getMyTransactions(req.user.id);
  }
}
