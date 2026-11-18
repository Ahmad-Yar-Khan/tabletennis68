/**
 * Deletes the demo products created by scripts/seed.ts (every document whose _id starts with
 * "demo-", including unpublished drafts of them).
 *
 * Site settings are also deleted, but ONLY if the WhatsApp number is still the seed placeholder
 * (923000000000), so real contact details are never lost.
 * Categories and brands are kept: they are real starter data.
 *
 * Run from the studio/ folder:
 *   npx sanity exec scripts/cleanup-demo.ts --with-user-token
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'})

const PLACEHOLDER_WHATSAPP = '923000000000'

async function cleanup() {
  const {projectId, dataset} = client.config()
  console.log(`Cleaning demo content from project "${projectId}", dataset "${dataset}"...`)

  const demoIds = await client.fetch<string[]>(
    `*[string::startsWith(_id, "demo-") || string::startsWith(_id, "drafts.demo-")]._id`,
  )
  const placeholderSettingsIds = await client.fetch<string[]>(
    `*[_id in ["siteSettings", "drafts.siteSettings"] && whatsappNumber == $placeholder]._id`,
    {placeholder: PLACEHOLDER_WHATSAPP},
  )

  const ids = [...demoIds, ...placeholderSettingsIds]
  if (ids.length === 0) {
    console.log('Nothing to delete. No demo documents found.')
    return
  }

  const tx = client.transaction()
  for (const id of ids) tx.delete(id)
  await tx.commit({visibility: 'async'})

  console.log(`✔ Deleted ${demoIds.length} demo document(s)`)
  if (placeholderSettingsIds.length) {
    console.log('✔ Deleted placeholder site settings (WhatsApp number was still 923000000000)')
  } else {
    console.log('• Site settings kept (they contain real details or do not exist)')
  }
  console.log('• Categories and brands kept')
}

cleanup().catch((error) => {
  console.error('Cleanup failed:', error.message)
  process.exit(1)
})
