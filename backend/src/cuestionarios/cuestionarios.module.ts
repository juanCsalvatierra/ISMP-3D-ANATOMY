import { Module } from '@nestjs/common';
import { CuestionariosController } from './cuestionarios.controller';
import { CuestionariosService } from './cuestionarios.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CuestionariosController],
  providers: [CuestionariosService],
})
export class CuestionariosModule {}
