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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard, RolesGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // GET /questions?materiaId=xxx&unidad=2&formato=MULTIPLE&estado=BORRADOR&tema=circulatorio
  @Get()
  findAll(
    @Query('materiaId') materiaId?: string,
    @Query('unidad') unidad?: string,
    @Query('formato') formato?: string,
    @Query('estado') estado?: string,
    @Query('tema') tema?: string,
  ) {
    return this.questionsService.findAll(
      materiaId,
      unidad !== undefined ? parseInt(unidad) : undefined,
      formato,
      estado,
      tema,
    );
  }

  // GET /questions/revision/materias  → materias en las que el usuario puede revisar
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Get('revision/materias')
  materiasRevisables(@CurrentUser() user: { sub: string; role: Role }) {
    return this.questionsService.materiasRevisables(user.sub, user.role);
  }

  // GET /questions/revision?estado=BORRADOR&materiaId=..&unidad=..&tema=..
  // Cola de revisión acotada a las materias del usuario (ADMIN: todas).
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Get('revision')
  revision(
    @CurrentUser() user: { sub: string; role: Role },
    @Query('estado') estado?: string,
    @Query('materiaId') materiaId?: string,
    @Query('unidad') unidad?: string,
    @Query('tema') tema?: string,
  ) {
    return this.questionsService.revision(user.sub, user.role, {
      estado,
      materiaId,
      unidad: unidad !== undefined ? parseInt(unidad) : undefined,
      tema,
    });
  }

  // GET /questions/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  // POST /questions  → solo DOCENTE o ADMIN
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Post()
  create(
    @Body() dto: CreateQuestionDto,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.questionsService.create(dto, user.sub, user.role);
  }

  // PATCH /questions/:id  → solo DOCENTE o ADMIN
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.questionsService.update(id, dto, user.sub, user.role);
  }

  // DELETE /questions/:id  → solo DOCENTE o ADMIN
  @Roles(Role.DOCENTE, Role.ADMIN)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: Role },
  ) {
    return this.questionsService.remove(id, user.sub, user.role);
  }
}
