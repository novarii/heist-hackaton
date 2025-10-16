import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, Json } from '../supabase/database.types'
import { getServiceSupabaseClient } from '../supabase/service-client'

type IntegrationEventInsert = Database['public']['Tables']['integration_events']['Insert']

type IntegrationEventStatus = IntegrationEventInsert['status']

export interface TriggerN8nWebhookOptions {
  eventType: IntegrationEventInsert['event_type']
  referenceId?: IntegrationEventInsert['reference_id']
  provider?: IntegrationEventInsert['provider']
  maxRetries?: number
  baseDelayMs?: number
}

export interface TriggerN8nResult<TResponse = unknown> {
  attempt: number
  status: number
  ok: boolean
  data: TResponse | string | null
}

const DEFAULT_MAX_RETRIES = 3
const DEFAULT_BASE_DELAY_MS = 500

const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504, 522, 524])

/**
 * Fires the configured n8n webhook, retrying transient failures and persisting a log in `integration_events`.
 */
export async function triggerN8nWebhook<TResponse = unknown>(
  payload: Record<string, unknown>,
  options: TriggerN8nWebhookOptions,
): Promise<TriggerN8nResult<TResponse>> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  const authToken = process.env.N8N_WEBHOOK_AUTH_TOKEN

  if (!webhookUrl) {
    throw new Error('Missing N8N_WEBHOOK_URL environment variable.')
  }

  const provider = options.provider ?? 'n8n'
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS

  let attempt = 0
  let lastError: unknown

  while (attempt < maxRetries) {
    attempt += 1

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const responsePayload = await consumeResponse<TResponse>(response)

      if (response.ok) {
        await logIntegrationEvent({
          provider,
          status: 'success',
          eventType: options.eventType,
          referenceId: options.referenceId,
          payload: {
            request: payload,
            response: responsePayload,
            statusCode: response.status,
            attempt,
          },
        })

        return {
          attempt,
          status: response.status,
          ok: true,
          data: responsePayload,
        }
      }

      lastError = new Error(`n8n webhook responded with status ${response.status}`)

      const shouldRetry = RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxRetries

      await logIntegrationEvent({
        provider,
        status: shouldRetry ? 'retry' : 'error',
        eventType: options.eventType,
        referenceId: options.referenceId,
        payload: {
          request: payload,
          response: responsePayload,
          statusCode: response.status,
          attempt,
        },
      })

      if (!shouldRetry) {
        throw lastError
      }
    } catch (error) {
      lastError = error

      const shouldRetry = attempt < maxRetries

      await logIntegrationEvent({
        provider,
        status: shouldRetry ? 'retry' : 'error',
        eventType: options.eventType,
        referenceId: options.referenceId,
        payload: {
          request: payload,
          error: serializeError(error),
          attempt,
        },
      })

      if (!shouldRetry) {
        break
      }
    }

    await delay(baseDelayMs * 2 ** (attempt - 1))
  }

  throw new Error('Failed to trigger n8n webhook after retries.', {
    cause: lastError instanceof Error ? lastError : undefined,
  })
}

async function logIntegrationEvent({
  provider,
  status,
  eventType,
  referenceId,
  payload,
}: {
  provider: IntegrationEventInsert['provider']
  status: IntegrationEventStatus
  eventType: IntegrationEventInsert['event_type']
  referenceId?: IntegrationEventInsert['reference_id']
  payload: Json
}): Promise<void> {
  let client: SupabaseClient<Database>

  try {
    client = getServiceSupabaseClient()
  } catch (error) {
    console.error('Failed to instantiate Supabase service client for integration logging.', error)
    return
  }

  const { error } = await client.from('integration_events').insert({
    provider,
    status,
    event_type: eventType,
    reference_id: referenceId,
    payload,
  })

  if (error) {
    console.error('Failed to write integration_events log for n8n webhook.', error)
  }
}

async function consumeResponse<TResponse>(response: Response): Promise<TResponse | string | null> {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as TResponse
  } catch {
    return text
  }
}

function serializeError(error: unknown): Json {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  if (typeof error === 'object' && error !== null) {
    return JSON.parse(JSON.stringify(error)) as Json
  }

  return error as Json
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
