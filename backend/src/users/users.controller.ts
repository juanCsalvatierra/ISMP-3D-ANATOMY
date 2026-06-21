import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /users/register → público, sin auth
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  // POST /users/activate → solo ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('activate')
  activate(@Body('code') code: string) {
    return this.usersService.activate(code);
  }

  // GET /users/search?search=garcia&role=ESTUDIANTE → Docente y Admin
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Get('search')
  search(@Query('search') search: string, @Query('role') role?: string) {
    return this.usersService.search(search, role);
  }

  // GET /users → solo ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('role') role?: string, @Query('carreraId') carreraId?: string) {
    return this.usersService.findAll(role, carreraId);
  }

  // GET /users/:id → solo ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // POST /users → solo ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // PATCH /users/:id → solo ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // DELETE /users/:id → solo ADMIN
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
