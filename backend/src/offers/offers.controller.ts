import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get('trending')
  async getTrendingOffers(@Query('limit') limit?: string) {
    return this.offersService.getTrendingOffers(parseInt(limit || '6', 10));
  }

  @Get()
  async getOffers(
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.offersService.getOffers(
      category,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyOffers(@Req() req: any) {
    return this.offersService.getMyOffers(req.user.id);
  }

  @Get('seller/:sellerId')
  async getOffersBySeller(@Param('sellerId') sellerId: string) {
    return this.offersService.getOffersBySeller(sellerId);
  }

  @Get(':id')
  async getOfferById(@Param('id') id: string) {
    return this.offersService.getOfferById(id);
  }

  @Put(':id/view')
  async incrementView(@Param('id') id: string) {
    await this.offersService.incrementViewCount(id);
    return { success: true };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOffer(@Req() req: any, @Body() body: any) {
    return this.offersService.createOffer(req.user.id, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateOffer(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.offersService.updateOffer(req.user.id, id, body);
  }
}
