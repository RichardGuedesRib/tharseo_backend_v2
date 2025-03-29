import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { EngineTharseoService } from './engine-tharseo.service';

@Controller('/v1/engine-tharseo')
export class EngineTharseoController {
     constructor(private readonly engineTharseoService: EngineTharseoService) {}

    @Get('start')
    @UseGuards(AuthGuard)
    async startEngine() {
      
      return await this.engineTharseoService.startEngineTharseo();
    }
}
