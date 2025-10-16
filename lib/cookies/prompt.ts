import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const PROMPT_COOKIE_NAME = 'prompt-id'
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

interface SetPromptCookieOptions {
  maxAgeSeconds?: number
}

interface PromptCookiePayload {
  promptId: string
  issuedAt: number
  expiresAt: number
}

export async function setPromptCookie(
  promptId: string,
  options: SetPromptCookieOptions = {},
): Promise<void> {
  const cookieStore = await cookies()
  const secret = getPromptCookieSecret()

  const now = Date.now()
  const maxAgeSeconds = options.maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS

  const payload: PromptCookiePayload = {
    promptId,
    issuedAt: now,
    expiresAt: now + maxAgeSeconds * 1000,
  }

  const serializedPayload = JSON.stringify(payload)
  const encodedPayload = Buffer.from(serializedPayload).toString('base64url')
  const signature = sign(serializedPayload, secret)
  const value = `${encodedPayload}.${signature}`

  try {
    cookieStore.set(PROMPT_COOKIE_NAME, value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: maxAgeSeconds,
    })
  } catch {
    // Server Components cannot mutate cookies; route handlers or middleware should call this helper.
  }
}

export async function readPromptCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const secret = getPromptCookieSecret()

  const raw = cookieStore.get(PROMPT_COOKIE_NAME)
  if (!raw?.value) {
    return null
  }

  const payload = verify(raw.value, secret)

  if (!payload) {
    return null
  }

  if (payload.expiresAt <= Date.now()) {
    await clearPromptCookie()
    return null
  }

  return payload.promptId
}

export async function clearPromptCookie(): Promise<void> {
  const cookieStore = await cookies()
  try {
    cookieStore.delete(PROMPT_COOKIE_NAME)
  } catch {
    // Ignore deletion attempts from server components; middleware or route handlers will handle this.
  }
}

export { PROMPT_COOKIE_NAME }

function getPromptCookieSecret(): string {
  const secret = process.env.PROMPT_COOKIE_SECRET
  if (!secret) {
    throw new Error('Missing PROMPT_COOKIE_SECRET environment variable.')
  }

  return secret
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function verify(cookieValue: string, secret: string): PromptCookiePayload | null {
  const [encodedPayload, signature] = cookieValue.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  let payloadJson: string

  try {
    payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8')
  } catch {
    return null
  }

  const expectedSignature = sign(payloadJson, secret)

  const signatureBuffer = Buffer.from(signature, 'base64url')
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url')

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    return JSON.parse(payloadJson) as PromptCookiePayload
  } catch {
    return null
  }
}
