import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CuestionariosService } from './cuestionarios.service';
import { CreateCuestionarioDto } from './dto/create-cuestionario.dto';
import { UpdateCuestionarioDto } from './dto/update-cuestionario.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Controller('cuestionarios')
export class CuestionariosController {
  constructor(private readonly cuestionariosService: CuestionariosService) {}

  // ─── GET /cuestionarios?materiaId=xxx ───────────────────────────────────
  @Get()
  findAll(@Query('materiaId') materiaId?: string) {
    return this.cuestionariosService.findAll(materiaId);
  }

  // ─── GET /cuestionarios/:id ─────────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cuestionariosService.findOne(id);
  }

  // ─── POST /cuestionarios ────────────────────────────────────────────────
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateCuestionarioDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.cuestionariosService.create(dto, user.sub);
  }

  // ─── PATCH /cuestionarios/:id ───────────────────────────────────────────
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCuestionarioDto,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.cuestionariosService.update(id, dto, user.sub, user.role);
  }

  // ─── DELETE /cuestionarios/:id ──────────────────────────────────────────
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.cuestionariosService.remove(id, user.sub, user.role);
  }
}
