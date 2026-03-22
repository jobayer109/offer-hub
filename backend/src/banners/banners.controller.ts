import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('banners')
  async getActiveBanners() {
    return this.bannersService.getActiveBanners();
  }

  @Get('admin/banners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllBanners() {
    return this.bannersService.getAllBanners();
  }

  @Post('admin/banners')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async createBanner(
    @Body() body: { title: string; image_url: string; link_url: string; sort_order?: number },
  ) {
    return this.bannersService.createBanner(body);
  }

  @Put('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateBanner(
    @Param('id') id: string,
    @Body() body: { title?: string; image_url?: string; link_url?: string; sort_order?: number },
  ) {
    return this.bannersService.updateBanner(id, body);
  }

  @Delete('admin/banners/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteBanner(@Param('id') id: string) {
    return this.bannersService.deleteBanner(id);
  }

  @Put('admin/banners/:id/toggle')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async toggleBanner(@Param('id') id: string) {
    return this.bannersService.toggleBanner(id);
  }
}
