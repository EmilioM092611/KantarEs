/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/await-thenable */
import type { NodeSDK } from '@opentelemetry/sdk-node';

let sdkRef: NodeSDK | null = null;

export async function startTracingIfEnabled() {
  if (process.env.OTEL_TRACING_ENABLED !== 'true') return null;
  try {
    const { NodeSDK } = (await import('@opentelemetry/sdk-node')) as any;
    const { getNodeAutoInstrumentations } = (await import(
      '@opentelemetry/auto-instrumentations-node'
    )) as any;
    const { OTLPTraceExporter } = (await import(
      '@opentelemetry/exporter-trace-otlp-http'
    )) as any;

    const sdk: NodeSDK = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url:
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
          'http://localhost:4318/v1/traces',
      }),
      // Auto-instrumentación por defecto para evitar errores de tipado en el mapa:
      instrumentations: getNodeAutoInstrumentations(),
    });

    await sdk.start(); // <-- ya no es null
    sdkRef = sdk;
    return sdkRef;
  } catch (e) {
    console.warn('Tracing deshabilitado:', (e as any)?.message ?? e);
    return null;
  }
}

export async function stopTracing() {
  try {
    await sdkRef?.shutdown();
  } catch {
    // ignore
  } finally {
    sdkRef = null;
  }
}
