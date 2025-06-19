import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { metricsProviders } from './metrics.providers';

@Module({
  imports: [PrometheusModule.register()],
  providers: [...metricsProviders],
  exports: [PrometheusModule, ...metricsProviders],
})
export class MetricsModule {}
