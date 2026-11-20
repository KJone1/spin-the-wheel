interface UpdateSettingsBody {
  spinDuration?: unknown
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpdateSettingsBody>(event)
  const spinDuration = body?.spinDuration

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

  const db = getD1Database(event)

  await db
    .prepare(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ('spin_duration', ?, CURRENT_TIMESTAMP)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`
    )
    .bind(JSON.stringify(spinDuration))
    .run()

  return { spinDuration }
})
