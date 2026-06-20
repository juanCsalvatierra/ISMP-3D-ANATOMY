import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('carreras')
  carreras() {
    return this.catalogService.carreras();
  }

  @Get('materias')
  materias(@Query('carreraId') carreraId?: string) {
    return this.catalogService.materias(carreraId);
  }

  @Get('materias/:id/unidades')
  unidades(@Param('id') id: string) {
    return this.catalogService.unidades(id);
  }
}
