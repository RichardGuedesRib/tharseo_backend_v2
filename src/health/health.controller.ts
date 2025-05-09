import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('check')
  check() {
    return `# HELP application_health_status Status do aplicativo\n# TYPE application_health_status gauge\napplication_health_status{status="up"} 1\n`;
  }

  @Get('checkstatus')
  checkOther() {
    return "Aplications is up";
  }

}
