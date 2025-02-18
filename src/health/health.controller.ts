import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {

    @Get("check")
    check() {
        return "Application is up and running";
    }
}
