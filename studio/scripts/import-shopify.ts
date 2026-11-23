/**
 * Imports products from a Shopify collection (e.g. https://shop.com/collections/stiga-blades)
 * into Sanity, using Shopify's public /products.json feed.
 *
 * Run from the studio/ folder:
 *   npx sanity exec scripts/import-shopify.ts --with-user-token -- <collection-url> --category Blades --brand Stiga [--dry-run] [--publish] [--replace] [--no-images]
 *
 * - Products are created as DRAFTS by default so prices/text can be checked in Studio before
 *   publishing. Pass --publish to publish straight away.
 * - _id is "import-<handle>", so re-running skips products that already exist.
 *   Pass --replace to overwrite them (this discards edits made in Studio).
 * - --dry-run prints what would be imported without writing anything.
 * - The category and brand must already exist (ids "category-<slug>" and "brand-<slug>",
 *   as created by scripts/seed.ts). A missing brand is created automatically.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'})

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(`--${name}`)
const option = (name: string) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : undefined
}
const collectionUrl = argv.find((a) => a.startsWith('http'))
const categoryName = option('category')
const brandName = option('brand')
const dryRun = flag('dry-run')
const publish = flag('publish')
const replace = flag('replace')
const withImages = !flag('no-images')

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
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36',
  Accept: 'application/json,image/*,*/*',
}

/** fetch with backoff on 429 / 5xx (Shopify rate-limits aggressively). */
async function fetchWithRetry(url: string, attempts = 6): Promise<Response> {
  for (let i = 1; i <= attempts; i++) {
    const res = await fetch(url, {headers: HEADERS})
    if (res.ok) return res
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} for ${url}`)
    const wait = 15_000 * i
    console.log(`  ${res.status} from server, waiting ${wait / 1000}s before retry ${i}/${attempts}...`)
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

/** Turns Shopify body_html into plain lines (one per paragraph / list item / row). */
function htmlToLines(html: string): string[] {
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ': ')
    .replace(/<[^>]+>/g, '')
  return decodeEntities(text)
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').replace(/:\s*$/, '').trim())
    .filter(Boolean)
}

/** Short "Label: value" lines become specs; everything else is description. */
function splitSpecs(lines: string[]) {
  const specs: {label: string; value: string}[] = []
  const paragraphs: string[] = []
  for (const line of lines) {
    const m = line.match(/^([A-Za-z][A-Za-z ./()-]{1,24}?)\s*[:：]\s*(.{1,60})$/)
    if (m) specs.push({label: m[1].trim(), value: m[2].trim()})
    else paragraphs.push(line)
  }
  return {specs, paragraphs}
}

const block = (text: string) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key(), text, marks: []}],
})

function shortDescriptionFrom(paragraphs: string[]) {
  const first = paragraphs.join(' ')
  if (!first) return undefined
  const sentence = first.match(/^.{20,160}?[.!?](\s|$)/)?.[0].trim()
  if (sentence) return sentence
  return first.length <= 160 ? first : `${first.slice(0, 157).replace(/\s+\S*$/, '')}...`
}

// ---------------------------------------------------------------------------
// Shopify types
// ---------------------------------------------------------------------------

type ShopifyVariant = {price: string; compare_at_price: string | null; available: boolean}
type ShopifyProduct = {
  title: string
  handle: string
  body_html: string | null
  vendor: string
  options: {name: string; values: string[]}[]
  variants: ShopifyVariant[]
  images: {src: string}[]
}

async function fetchCollection(url: string): Promise<ShopifyProduct[]> {
  const base = url.replace(/\/+$/, '').replace(/\/products\.json.*$/, '')
  const all: ShopifyProduct[] = []
  for (let page = 1; page < 50; page++) {
    const res = await fetchWithRetry(`${base}/products.json?limit=250&page=${page}`)
    const {products} = (await res.json()) as {products: ShopifyProduct[]}
    if (!products?.length) break
    all.push(...products)
    if (products.length < 250) break
  }
  return all
}

async function uploadImage(src: string, filename: string) {
  const url = src.startsWith('//') ? `https:${src}` : src
  const res = await fetchWithRetry(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, {filename})
  return asset._id
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  if (!collectionUrl || !categoryName) {
    console.error(
      'Usage: npx sanity exec scripts/import-shopify.ts --with-user-token -- <collection-url> --category Blades [--brand Stiga] [--dry-run] [--publish] [--replace] [--no-images]',
    )
    process.exit(1)
  }

  const categoryId = `category-${slugify(categoryName)}`
  const category = await client.fetch(`*[_id == $id][0]{_id}`, {id: categoryId})
  if (!category) throw new Error(`Category "${categoryId}" not found in Sanity. Run the seed script or create it first.`)

  console.log(`Fetching ${collectionUrl} ...`)
  const products = await fetchCollection(collectionUrl)
  console.log(`Found ${products.length} product(s).\n`)

  const existing = new Set(
    // 'raw' so drafts are included (the default perspective only returns published docs).
    await client.fetch<string[]>(
      `*[string::startsWith(_id, "import-") || string::startsWith(_id, "drafts.import-")]._id`,
      {},
      {perspective: 'raw'},
    ),
  )
  const knownBrands = new Set(await client.fetch<string[]>(`*[_type == "brand"]._id`))

  let created = 0
  let skipped = 0

  for (const p of products) {
    // Shopify handles can contain characters like "®" that are invalid in Sanity ids/slugs.
    const handle = slugify(decodeURIComponent(p.handle))
    const baseId = `import-${handle}`
    const docId = publish ? baseId : `drafts.${baseId}`
    if (!replace && (existing.has(baseId) || existing.has(`drafts.${baseId}`))) {
      console.log(`• skip (exists): ${p.title}`)
      skipped++
      continue
    }

    // Price: Shopify "compare at" price is the original price when on sale.
    const variant =
      [...p.variants].sort((a, b) => Number(a.price) - Number(b.price))[0] ?? p.variants[0]
    const current = Math.round(Number(variant?.price ?? 0))
    const compareAt = Math.round(Number(variant?.compare_at_price ?? 0))
    const onSale = compareAt > current
    const price = onSale ? compareAt : current
    const salePrice = onSale ? current : undefined

    const {specs, paragraphs} = splitSpecs(htmlToLines(p.body_html ?? ''))

    const options = p.options
      .filter((o) => o.name !== 'Title' && !(o.values.length === 1 && o.values[0] === 'Default Title'))
      .map((o) => ({_type: 'productOption', _key: key(), name: o.name, values: o.values}))

    const brandLabel = brandName ?? p.vendor
    const brandId = brandLabel ? `brand-${slugify(brandLabel)}` : undefined

    console.log(
      `${dryRun ? '[dry-run] ' : ''}+ ${p.title} — Rs ${price}${salePrice ? ` (sale ${salePrice})` : ''} · ${p.images.length} photo(s) · ${specs.length} spec(s) · ${options.length} option(s)`,
    )
    if (dryRun) {
      created++
      continue
    }

    if (brandId && !knownBrands.has(brandId)) {
      await client.createIfNotExists({
        _id: brandId,
        _type: 'brand',
        name: brandLabel,
        slug: {_type: 'slug', current: slugify(brandLabel)},
      })
      knownBrands.add(brandId)
      console.log(`  created brand ${brandLabel}`)
    }

    const images = []
    if (withImages) {
      for (const [i, img] of p.images.entries()) {
        try {
          const assetId = await uploadImage(img.src, `${handle}-${i + 1}.jpg`)
          images.push({
            _type: 'image',
            _key: key(),
            alt: p.images.length > 1 ? `${p.title} – photo ${i + 1}` : p.title,
            asset: {_type: 'reference', _ref: assetId},
          })
        } catch (error) {
          console.log(`  ! photo ${i + 1} failed: ${(error as Error).message}`)
        }
      }
    }

    await client.createOrReplace({
      _id: docId,
      _type: 'product',
      name: p.title,
      slug: {_type: 'slug', current: handle},
      category: {_type: 'reference', _ref: categoryId},
      ...(brandId ? {brand: {_type: 'reference', _ref: brandId}} : {}),
      price,
      ...(salePrice ? {salePrice} : {}),
      images,
      shortDescription: shortDescriptionFrom(paragraphs),
      description: paragraphs.map(block),
      specs: specs.map((s) => ({_type: 'specItem', _key: key(), ...s})),
      options,
      inStock: p.variants.some((v) => v.available),
      featured: false,
      isNew: false,
    })
    created++
  }

  console.log(
    `\n✔ ${dryRun ? 'Would import' : 'Imported'} ${created} product(s), skipped ${skipped}.` +
      (publish || dryRun ? '' : ' They are drafts: review and publish them in Studio.'),
  )
}

run().catch((error) => {
  console.error('Import failed:', error.message)
  process.exit(1)
})
