import { trace } from '@opentelemetry/api'
import { randomUUID } from 'node:crypto'

// Returns the OpenTelemetry trace ID of the active span (the same ID
// Langfuse uses to identify the trace), so we can echo it in the SSE
// `done` event and link user-reported issues directly to a Langfuse trace.
// Falls back to a fresh UUID if no span is active (should not happen
// inside a startActiveObservation wrapper, but defensive).
export function getActiveTraceId(): string {
  const span = trace.getActiveSpan()
  const id = span?.spanContext()?.traceId
  return id && id !== '00000000000000000000000000000000' ? id : randomUUID()
}
