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

  // GET /questions?materiaId=xxx&unidad=2&formato=MULTIPLE
  @Get()
  findAll(
    @Query('materiaId') materiaId?: string,
    @Query('unidad') unidad?: string,
    @Query('formato') formato?: string,
  ) {
    return this.questionsService.findAll(
      materiaId,
      unidad !== undefined ? parseInt(unidad) : undefined,
      formato,
    );
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
    @CurrentUser() user: { sub: string },
  ) {
    return this.questionsService.create(dto, user.sub);
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
