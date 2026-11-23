/**
 * Imports shakehand blades from Butterfly's official site
 * (https://www.butterfly-global.com/en/products/blade/) into Sanity as DRAFTS.
 *
 * Run from the studio/ folder:
 *   npx sanity exec scripts/import-butterfly.ts --with-user-token -- [--dry-run] [--replace] [--price 1]
 *
 * - Butterfly's site has no prices, so every blade gets a placeholder price (default Rs 1).
 *   Products are always created as drafts: set the real price in Studio, then publish.
 * - Chinese penhold ("- CS") versions and anything that is not a shakehand blade are skipped.
 * - Handle types listed on the page (FL, ST, AN...) become a "Handle" option.
 * - _id is "import-butterfly-<code>", so re-running skips blades already imported
 *   (published or draft). Pass --replace to overwrite them (discards Studio edits).
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'})

const BASE = 'https://www.butterfly-global.com'
const LIST_URL = `${BASE}/en/products/blade/`
const CATEGORY_ID = 'category-blades'
const BRAND_ID = 'brand-butterfly'

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(`--${name}`)
const option = (name: string) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const dryRun = flag('dry-run')
const replace = flag('replace')
const placeholderPrice = Number(option('price') ?? 1)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

let keyCounter = 0
const key = () => `imp${Date.now().toString(36)}${(keyCounter++).toString(36)}`

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36',
}

async function fetchWithRetry(url: string, attempts = 5): Promise<Response> {
  for (let i = 1; i <= attempts; i++) {
    const res = await fetch(url, {headers: HEADERS})
    if (res.ok) return res
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} for ${url}`)
    const wait = 10_000 * i
    console.log(`  ${res.status} from server, waiting ${wait / 1000}s (retry ${i}/${attempts})...`)
    await sleep(wait)
  }
  throw new Error(`Gave up after ${attempts} attempts: ${url}`)
}

const decodeEntities = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&ndash;|&mdash;/g, '–')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

/** Inner HTML → single-line text; <br> becomes " / ". */
const cellText = (html: string) =>
  decodeEntities(
    html
      .replace(/<span class="u-sup">[\s\S]*?<\/span>/g, '')
      .replace(/<br\s*\/?>/gi, ' / ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim()

const block = (text: string) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key(), text, marks: []}],
})

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

type Blade = {
  code: string
  name: string
  type: string
  headline?: string
  paragraphs: string[]
  specs: {label: string; value: string}[]
  handles: string[]
  images: string[]
}

async function listCodes(): Promise<string[]> {
  const html = await (await fetchWithRetry(LIST_URL)).text()
  const codes = [...html.matchAll(/href="\/en\/products\/detail\/(\d+)\.html"/g)].map((m) => m[1])
  return [...new Set(codes)]
}

async function fetchBlade(code: string): Promise<Blade> {
  const html = await (await fetchWithRetry(`${BASE}/en/products/detail/${code}.html`)).text()

  const name = cellText(html.match(/<h1 class="pageHeader_ttl[^"]*">([\s\S]*?)<\/h1>/)?.[1] ?? '')

  const images = [
    ...new Set(
      [...html.matchAll(/mainSlider_item-detail"><a href="([^"]+)"/g)].map((m) =>
        m[1].startsWith('http') ? m[1] : `${BASE}${m[1]}`,
      ),
    ),
  ]

  // Text between the product detail start and the first spec table.
  const detail = html.slice(html.indexOf('class="productDetail"'))
  const intro = detail.slice(0, detail.indexOf('<table'))
  const headline = cellText(intro.match(/<h2 class="ttl-lg">([\s\S]*?)<\/h2>/)?.[1] ?? '') || undefined
  const paragraphs = [...intro.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => cellText(m[1])).filter(Boolean)

  // Spec tables (only those inside the product detail area).
  const playersAt = detail.indexOf('Players using this product')
  const tables = playersAt > 0 ? detail.slice(0, playersAt) : detail
  const rows = [...tables.matchAll(/<th>([\s\S]*?)<\/th>\s*<td>([\s\S]*?)<\/td>/g)]
  let type = ''
  let handles: string[] = []
  const specs: Blade['specs'] = []
  for (const [, th, td] of rows) {
    const label = cellText(th)
    const value = cellText(td)
    if (!label || !value) continue
    if (label === 'Name') continue
    if (label === 'Code') {
      handles = [...td.matchAll(/<b>([^<]+)<\/b>/g)].map((m) => m[1].trim())
      continue
    }
    if (label === 'Type') type = value
    specs.push({label, value})
  }

  return {code, name, type, headline, paragraphs, specs, handles, images}
}

async function uploadImage(url: string, filename: string) {
  const res = await fetchWithRetry(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename})
  return asset._id
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  const refs = await client.fetch<{category: string | null; brand: string | null}>(
    `{"category": *[_id == $c][0]._id, "brand": *[_id == $b][0]._id}`,
    {c: CATEGORY_ID, b: BRAND_ID},
  )
  if (!refs.category) throw new Error(`Category "${CATEGORY_ID}" not found in Sanity.`)
  if (!refs.brand && !dryRun) {
    await client.createIfNotExists({
      _id: BRAND_ID,
      _type: 'brand',
      name: 'Butterfly',
      slug: {_type: 'slug', current: 'butterfly'},
    })
  }

  const existing = new Set(
    await client.fetch<string[]>(
      `*[_id match "import-butterfly-*" || _id match "drafts.import-butterfly-*"]._id`,
      {},
      {perspective: 'raw'},
    ),
  )

  console.log(`Fetching ${LIST_URL} ...`)
  const codes = await listCodes()
  console.log(`Found ${codes.length} product link(s).\n`)

  let created = 0
  let skipped = 0

  for (const code of codes) {
    const baseId = `import-butterfly-${code}`
    if (!replace && (existing.has(baseId) || existing.has(`drafts.${baseId}`))) {
      console.log(`• skip (exists): ${code}`)
      skipped++
      continue
    }

    await sleep(400) // be polite to their server
    const blade = await fetchBlade(code)

    if (!blade.name) {
      console.log(`• skip (no name found): ${code}`)
      skipped++
      continue
    }
    if (/-\s*CS$/i.test(blade.name) || !/shakehand/i.test(blade.type)) {
      console.log(`• skip (${blade.type || 'not a blade'}): ${blade.name}`)
      skipped++
      continue
    }

    const name = `Butterfly ${blade.name} Blade`
    const options =
      blade.handles.length > 1
        ? [{_type: 'productOption', _key: key(), name: 'Handle', values: blade.handles}]
        : []

    console.log(
      `${dryRun ? '[dry-run] ' : ''}+ ${name} · ${blade.images.length} photo(s) · ${blade.specs.length} spec(s)` +
        (options.length ? ` · Handle: ${blade.handles.join(', ')}` : ''),
    )
    if (dryRun) {
      created++
      continue
    }

    const images = []
    for (const [i, src] of blade.images.entries()) {
      try {
        const assetId = await uploadImage(src, `butterfly-${slugify(blade.name)}-${i + 1}.jpg`)
        images.push({
          _type: 'image',
          _key: key(),
          alt: blade.images.length > 1 ? `${name} – photo ${i + 1}` : name,
          asset: {_type: 'reference', _ref: assetId},
        })
      } catch (error) {
        console.log(`  ! photo ${i + 1} failed: ${(error as Error).message}`)
      }
    }

    const headline = blade.headline ? `${blade.headline}.` : undefined
    await client.createOrReplace({
      _id: `drafts.${baseId}`,
      _type: 'product',
      name,
      slug: {_type: 'slug', current: slugify(name)},
      category: {_type: 'reference', _ref: CATEGORY_ID},
      brand: {_type: 'reference', _ref: BRAND_ID},
      price: placeholderPrice,
      images,
      shortDescription: headline && headline.length <= 160 ? headline : undefined,
      description: blade.paragraphs.map(block),
      specs: blade.specs.map((s) => ({_type: 'specItem', _key: key(), ...s})),
      options,
      inStock: true,
      featured: false,
      isNew: false,
    })
    created++
  }

  console.log(
    `\n✔ ${dryRun ? 'Would import' : 'Imported'} ${created} blade(s), skipped ${skipped}.` +
      (dryRun ? '' : ` They are drafts with a placeholder price of Rs ${placeholderPrice}: set real prices in Studio, then publish.`),
  )
}

run().catch((error) => {
  console.error('Import failed:', error.message)
  process.exit(1)
})
