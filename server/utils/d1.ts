import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

interface CloudflareContext {
  env?: {
    DB?: D1Database
  }
}

export function getD1Database(event: H3Event): D1Database {
  const cf = event.context.cloudflare as CloudflareContext | undefined
  const db = cf?.env?.DB

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'D1 database binding DB is not configured'
    })
  }

  return db
}
