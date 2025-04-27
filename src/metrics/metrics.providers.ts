import {
  makeCounterProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const binanceHttpCountProvider = makeCounterProvider({
  name: 'binance_http_count',
  help: 'Contador de requisições HTTP para Binance',
  labelNames: ['method'],
});

export const binanceHttpDurationProvider = makeHistogramProvider({
  name: 'binance_http_duration_seconds',
  help: 'Duração das requisições HTTP para Binance, em segundos',
  labelNames: ['method'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

const authHttpCountProvider = makeCounterProvider({
  name: 'auth_http_count',
  help: 'Contador de requisições do Auth',
  labelNames: ['method'],
});

const authHttpDurationProvider = makeHistogramProvider({
  name: 'auth_http_duration_seconds',
  help: 'Duração das requisições de auth em segundos',
  labelNames: ['method'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

export const metricsProviders = [
  binanceHttpCountProvider,
  binanceHttpDurationProvider,
  authHttpCountProvider,
  authHttpDurationProvider
];
