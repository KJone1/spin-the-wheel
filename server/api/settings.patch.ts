import type { EditableSettings } from '~~/shared/types/wheel'

interface UpdateSettingsBody {
  spinDuration?: unknown
  soundMuted?: unknown
  mysteryMode?: unknown
}

export default defineEventHandler(async (event): Promise<EditableSettings> => {
  const body = await readBody<UpdateSettingsBody>(event)
  const spinDuration = body?.spinDuration
  const soundMuted = body?.soundMuted
  const mysteryMode = body?.mysteryMode

  if (
    typeof spinDuration !== 'number' ||
    !Number.isInteger(spinDuration) ||
    spinDuration < 1 ||
    spinDuration > 60
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'spinDuration must be an integer between 1 and 60'
    })
  }

  if (typeof soundMuted !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'soundMuted must be a boolean'
    })
  }

  if (typeof mysteryMode !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'mysteryMode must be a boolean'
    })
  }

  const db = getD1Database(event)
  const upsertSql = `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`

  await db.batch([
    db.prepare(upsertSql).bind('spin_duration', JSON.stringify(spinDuration)),
    db.prepare(upsertSql).bind('sound_muted', JSON.stringify(soundMuted)),
    db.prepare(upsertSql).bind('mystery_mode', JSON.stringify(mysteryMode))
  ])

  return { spinDuration, soundMuted, mysteryMode }
})
