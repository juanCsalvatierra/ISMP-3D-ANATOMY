import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { AnswerAttemptDto } from './dto/answer-attempt.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  // POST /attempts/start → inicia el intento, devuelve la primera pregunta
  @Post('start')
  start(
    @Body() dto: StartAttemptDto,
    @CurrentUser() user: { sub: string; role: Role; carreraIds: string[] },
  ) {
    return this.attemptsService.start(dto, user.sub, user.role, user.carreraIds ?? []);
  }

  // POST /attempts/:id/answer → guarda respuesta, devuelve siguiente pregunta o resultado final
  @Post(':id/answer')
  answer(
    @Param('id') id: string,
    @Body() dto: AnswerAttemptDto,
    @CurrentUser() user: { sub: string },
  ) {
    return this.attemptsService.answer(id, dto, user.sub);
  }

  // GET /attempts → todos los intentos completados (Docente/Admin)
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Get()
  findAll(
    @Query('materiaId') materiaId: string | undefined,
    @CurrentUser() user: { sub: string; role: Role; carreraIds: string[] },
  ) {
    return this.attemptsService.findAll(materiaId, user.role, user.carreraIds ?? []);
  }

  // GET /attempts/me → intentos propios completados (Estudiante)
  @Get('me')
  findMine(
    @CurrentUser() user: { sub: string },
    @Query('materiaId') materiaId?: string,
  ) {
    return this.attemptsService.findMine(user.sub, materiaId);
  }

  // GET /attempts/student?studentId=xxx&materiaId=mat-anat1&carreraId=carrera-rad
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Get('student')
  findByStudent(
    @Query('studentId') studentId: string,
    @Query('materiaId') materiaId: string | undefined,
    @Query('carreraId') carreraId: string | undefined,
    @CurrentUser() user: { sub: string; role: Role; carreraId?: string },
  ) {
    return this.attemptsService.findByStudent(studentId, materiaId, carreraId, user.role, user.carreraId);
  }

  // GET /attempts/:id → detalle (Docente/Admin)
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: Role; carreraId?: string },
  ) {
    return this.attemptsService.findOne(id, user.role, user.carreraId);
  }
}
