import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../../application/users.service';

// In a real app, we would add a RolesGuard to ensure only ADMIN can access this controller.
@UseGuards(AuthGuard('jwt'))
@Controller('api/admin/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async inviteUser(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Post(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
