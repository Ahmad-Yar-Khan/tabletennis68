/**
 * Adds one dummy product (with a picture) to every category except Blades, so the home page,
 * shop and category pages show the full range while real products are still being added.
 *
 * Run from the studio/ folder:
 *   npx sanity exec scripts/seed-dummies.ts --with-user-token
 *
 * - Pictures come from scripts/demo-art/*.jpg (rendered from web/public/categories/*.svg).
 *   Sanity stores identical files once, so re-running does not duplicate them.
 * - Product ids start with "demo-dummy-" and are replaced on every run.
 *   Remove them with: npx sanity exec scripts/cleanup-demo.ts --with-user-token
 */
import {createReadStream} from 'node:fs'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-19'})

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const ref = (id: string) => ({_type: 'reference', _ref: id})

let keyCounter = 0
const key = () => `dummy${(keyCounter++).toString(36)}`

const block = (text: string) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key(), text, marks: []}],
})

type Dummy = {
  name: string
  category: string
  art: string
  price: number
  salePrice?: number
  shortDescription: string
  description: string[]
  options?: Record<string, string[]>
  specs?: Record<string, string>
  featured?: boolean
  isNew?: boolean
}

const dummies: Dummy[] = [
  {
    name: 'Sample All-Round Racket',
    category: 'rackets',
    art: 'racket',
    price: 4500,
    featured: true,
    shortDescription: 'Dummy product. A ready-to-play racket for beginners and club players.',
    description: [
      'This is a sample product to show how rackets appear on the website.',
      'Replace it with a real racket, or delete it, in the Studio.',
    ],
    options: {Handle: ['FL', 'ST']},
    specs: {Plies: '5 wood', Speed: 'ALL', Weight: '170 g'},
  },
  {
    name: 'Sample Tension Rubber',
    category: 'rubbers',
    art: 'rubber',
    price: 8500,
    featured: true,
    shortDescription: 'Dummy product. A spinny rubber for forehand and backhand.',
    description: ['This is a sample product to show how rubbers appear on the website.'],
    options: {Colour: ['Red', 'Black'], Thickness: ['1.8', '2.0', 'Max']},
    specs: {Speed: '11', Spin: '10.5', Control: '8.0'},
  },
  {
    name: 'Sample 3-Star Balls',
    category: 'balls',
    art: 'ball',
    price: 1800,
    isNew: true,
    shortDescription: 'Dummy product. 40+ mm 3-star match balls. Price is for a pack of 3.',
    description: ['This is a sample product to show how balls appear on the website.'],
    options: {Pack: ['3 balls', '6 balls', '12 balls']},
    specs: {Size: '40+ mm', Material: 'ABS plastic', Grade: '3-star'},
  },
  {
    name: 'Sample Edge Tape & Cleaner Kit',
    category: 'grips-and-accessories',
    art: 'grip',
    price: 1500,
    isNew: true,
    shortDescription: 'Dummy product. Edge tape and rubber cleaner to look after your racket.',
    description: ['This is a sample product to show how accessories appear on the website.'],
    options: {Colour: ['Red', 'Black']},
    specs: {'Tape width': '10 mm', 'Cleaner': '100 ml'},
  },
  {
    name: 'Sample Court Shoes',
    category: 'shoes',
    art: 'shoe',
    price: 14000,
    featured: true,
    shortDescription: 'Dummy product. Light indoor shoes with a grippy non-marking sole.',
    description: ['This is a sample product to show how shoes appear on the website.'],
    options: {Size: ['40', '41', '42', '43', '44', '45']},
    specs: {Sole: 'Non-marking rubber', Weight: '300 g'},
  },
  {
    name: 'Sample Racket Case',
    category: 'bags-and-cases',
    art: 'bag',
    price: 2500,
    salePrice: 1999,
    isNew: true,
    shortDescription: 'Dummy product. Padded zip case for one racket and spare balls.',
    description: ['This is a sample product to show how bags and cases appear on the website.'],
    options: {Colour: ['Black', 'Red']},
    specs: {Holds: '1 racket + 3 balls', Material: 'Polyester'},
  },
  {
    name: 'Sample Indoor Table',
    category: 'tables-and-nets',
    art: 'table',
    price: 145000,
    featured: true,
    shortDescription: 'Dummy product. Full-size foldable indoor table with net set.',
    description: ['This is a sample product to show how tables appear on the website.'],
    specs: {'Top thickness': '16 mm', Size: '274 × 152.5 × 76 cm', 'Net set': 'Included'},
  },
]

async function uploadArt(art: string) {
  const file = path.join(process.cwd(), 'scripts', 'demo-art', `${art}.jpg`)
  const asset = await client.assets.upload('image', createReadStream(file), {
    filename: `sample-${art}.jpg`,
  })
  return asset._id
}

async function seedDummies() {
  const {projectId, dataset} = client.config()
  console.log(`Adding dummy products to project "${projectId}", dataset "${dataset}"...`)

  const tx = client.transaction()
  for (const d of dummies) {
    const assetId = await uploadArt(d.art)
    const slug = slugify(d.name)
    tx.createOrReplace({
      _id: `demo-dummy-${slug}`,
      _type: 'product',
      name: d.name,
      slug: {_type: 'slug', current: slug},
      category: ref(`category-${d.category}`),
      price: d.price,
      ...(d.salePrice ? {salePrice: d.salePrice} : {}),
      images: [{_type: 'image', _key: key(), alt: d.name, asset: ref(assetId)}],
      shortDescription: d.shortDescription,
      description: d.description.map(block),
      options: Object.entries(d.options ?? {}).map(([name, values]) => ({
        _type: 'productOption',
        _key: key(),
        name,
        values,
      })),
      specs: Object.entries(d.specs ?? {}).map(([label, value]) => ({
        _type: 'specItem',
        _key: key(),
        label,
        value,
      })),
      inStock: true,
      featured: d.featured ?? false,
      isNew: d.isNew ?? false,
    })
    console.log(`• ${d.name}`)
  }
  await tx.commit({visibility: 'async'})
  console.log(`✔ ${dummies.length} dummy products (ids start with "demo-dummy-")`)
}

seedDummies().catch((error) => {
  console.error('Adding dummy products failed:', error.message)
  process.exit(1)
})
