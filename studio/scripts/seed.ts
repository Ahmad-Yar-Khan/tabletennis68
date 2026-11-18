/**
 * Seeds the dataset with starter categories, brands, site settings and demo products.
 *
 * Run from the studio/ folder:
 *   npx sanity exec scripts/seed.ts --with-user-token
 *
 * - Categories (_id "category-*"), brands (_id "brand-*") and site settings are starter data
 *   meant to be kept. They are only created if missing, so re-running never overwrites edits.
 * - Demo products use the _id prefix "demo-" and are replaced on every run.
 *   Remove them with: npx sanity exec scripts/cleanup-demo.ts --with-user-token
 */
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
const key = () => `seed${(keyCounter++).toString(36)}`

const block = (text: string) => ({
  _type: 'block',
  _key: key(),
  style: 'normal',
  markDefs: [],
  children: [{_type: 'span', _key: key(), text, marks: []}],
})

// ---------------------------------------------------------------------------
// Categories and brands
// ---------------------------------------------------------------------------

const categories = [
  {name: 'Rackets', description: 'Ready-to-play rackets for beginners, club players and schools.'},
  {name: 'Blades', description: 'Wood and carbon blades for building your own custom racket.'},
  {name: 'Rubbers', description: 'Offensive, all-round and defensive rubbers in red and black.'},
  {name: 'Balls', description: 'Competition 3-star and training balls in multi-packs.'},
  {name: 'Grips & Accessories', description: 'Edge tape, cleaners, glue, grips and other essentials.'},
  {name: 'Shoes', description: 'Lightweight indoor shoes with grip made for table tennis.'},
  {name: 'Bags & Cases', description: 'Racket cases and kit bags to protect your equipment.'},
  {name: 'Tables & Nets', description: 'Indoor tables and net sets for home, club and school.'},
].map((c, index) => ({
  _id: `category-${slugify(c.name)}`,
  _type: 'category',
  name: c.name,
  slug: {_type: 'slug', current: slugify(c.name)},
  description: c.description,
  order: index + 1,
}))

const brandNames = ['Butterfly', 'DHS', 'Stiga', 'Yasaka', 'Nittaku', 'Donic', 'Joola', 'Xiom']
const brands = brandNames.map((name) => ({
  _id: `brand-${slugify(name)}`,
  _type: 'brand',
  name,
  slug: {_type: 'slug', current: slugify(name)},
}))

const categoryId = (name: string) => `category-${slugify(name)}`
const brandId = (name: string) => `brand-${slugify(name)}`

// ---------------------------------------------------------------------------
// Demo products
// ---------------------------------------------------------------------------

type DemoProduct = {
  name: string
  category: string
  brand: string
  price: number
  salePrice?: number
  shortDescription: string
  description: string[]
  options?: Record<string, string[]>
  specs?: Record<string, string>
  inStock?: boolean
  featured?: boolean
  isNew?: boolean
}

const HANDLE = ['FL', 'ST', 'AN']
const COLOUR = ['Red', 'Black']

const demoProducts: DemoProduct[] = [
  // Rackets
  {
    name: 'Butterfly Timo Boll Platinum Racket',
    category: 'Rackets',
    brand: 'Butterfly',
    price: 9500,
    salePrice: 8500,
    featured: true,
    shortDescription:
      'Pre-assembled all-round racket with fast rubbers. A great step up for improving club players.',
    description: [
      'A ready-to-play racket with an all-round wood blade and Butterfly rubbers on both sides.',
      'Comes with a protective case. Ideal for players who want good spin without building a custom racket.',
    ],
    options: {Handle: ['FL', 'ST']},
    specs: {Plies: '5 wood', Speed: 'ALL+', Control: '8.5', Weight: '170 g'},
  },
  {
    name: 'DHS 4-Star Hurricane Racket',
    category: 'Rackets',
    brand: 'DHS',
    price: 4800,
    isNew: true,
    shortDescription:
      'Popular Chinese-style racket with tacky Hurricane rubber. Lots of spin at a fair price.',
    description: [
      'Pre-made racket with DHS Hurricane rubber on the forehand for strong loops and serves.',
      'A favourite for school teams and players moving on from a beginner bat.',
    ],
    options: {Handle: ['FL', 'ST']},
    specs: {Plies: '5 wood', Speed: 'OFF-', Control: '8.0', Weight: '175 g'},
  },
  {
    name: 'Stiga Pro Carbon+ Racket',
    category: 'Rackets',
    brand: 'Stiga',
    price: 12500,
    featured: true,
    shortDescription:
      'Fast carbon racket for attacking players who want speed straight out of the box.',
    description: [
      'A carbon-layered blade fitted with fast tension rubbers. Built for power and a long, flat arc.',
      'Comes with a hard case.',
    ],
    options: {Handle: ['FL']},
    specs: {Plies: '5 wood + 2 carbon', Speed: 'OFF', Control: '7.5', Weight: '180 g'},
  },

  // Blades
  {
    name: 'Butterfly Viscaria Blade',
    category: 'Blades',
    brand: 'Butterfly',
    price: 48000,
    featured: true,
    shortDescription:
      'The legendary Arylate-Carbon blade used by top pros. Fast, stable and full of feel.',
    description: [
      'Viscaria combines a Koto outer ply with Arylate-Carbon layers for a large sweet spot and excellent feel.',
      'Choose your handle shape. The blade comes without rubbers.',
    ],
    options: {Handle: HANDLE},
    specs: {Plies: '5 wood + 2 ALC', Speed: 'OFF', Control: '8.5', Weight: '86 g'},
  },
  {
    name: 'DHS Hurricane Long 5 Blade',
    category: 'Blades',
    brand: 'DHS',
    price: 42000,
    salePrice: 39500,
    shortDescription:
      'Chinese national team favourite with Zylon-carbon for powerful forehand loops.',
    description: [
      'A stiff, powerful blade made for the modern topspin game, with Zylon-carbon layers.',
      'Best paired with Hurricane 3 on the forehand.',
    ],
    options: {Handle: HANDLE},
    specs: {Plies: '5 wood + 2 ZLC', Speed: 'OFF', Control: '8.0', Weight: '88 g'},
  },
  {
    name: 'Stiga Allround Classic Blade',
    category: 'Blades',
    brand: 'Stiga',
    price: 9000,
    shortDescription:
      'All-wood all-round blade loved for its control. A perfect first custom blade.',
    description: [
      'A classic 5-ply all-wood blade that is easy to control and gives great feedback.',
      'Recommended for beginners and players working on technique.',
    ],
    options: {Handle: HANDLE},
    specs: {Plies: '5 wood', Speed: 'ALL', Control: '9.5', Weight: '82 g'},
  },
  {
    name: 'Yasaka Ma Lin Extra Offensive Blade',
    category: 'Blades',
    brand: 'Yasaka',
    price: 11500,
    inStock: false,
    shortDescription:
      'Fast all-wood offensive blade with a soft feel. Good speed without losing control.',
    description: [
      'A 5-ply all-wood blade popular with attacking players who still want a wooden feel.',
      'Currently out of stock. Message us to reserve one from the next shipment.',
    ],
    options: {Handle: HANDLE},
    specs: {Plies: '5 wood', Speed: 'OFF', Control: '8.5', Weight: '85 g'},
  },

  // Rubbers
  {
    name: 'Butterfly Tenergy 05 Rubber',
    category: 'Rubbers',
    brand: 'Butterfly',
    price: 19500,
    featured: true,
    shortDescription:
      'World-famous Spring Sponge rubber with a high arc and massive spin on loops.',
    description: [
      'Tenergy 05 gives a high, safe arc and heavy topspin. A top choice for forehand and backhand.',
      'Choose colour and sponge thickness. Thicker sponge means more speed.',
    ],
    options: {Colour: COLOUR, Thickness: ['1.9', '2.1']},
    specs: {Speed: '13', Spin: '11.5', Control: '7.5', Weight: '48 g (uncut)'},
  },
  {
    name: 'DHS Hurricane 3 Neo Rubber',
    category: 'Rubbers',
    brand: 'DHS',
    price: 7500,
    salePrice: 6800,
    shortDescription:
      'Tacky, pre-boosted Chinese rubber. Huge spin on serves and forehand loops.',
    description: [
      'Hurricane 3 Neo is the classic tacky forehand rubber, factory boosted for extra speed.',
      'Choose colour and sponge thickness.',
    ],
    options: {Colour: COLOUR, Thickness: ['2.1', '2.15', '2.2']},
    specs: {Speed: '9', Spin: '12', Control: '8.0', Hardness: '39°'},
  },
  {
    name: 'Yasaka Mark V Rubber',
    category: 'Rubbers',
    brand: 'Yasaka',
    price: 6000,
    shortDescription:
      'The classic all-round rubber. Reliable control and good spin for every level.',
    description: [
      'Mark V has been trusted by players for decades for its control and consistency.',
      'A great choice for both forehand and backhand.',
    ],
    options: {Colour: COLOUR, Thickness: ['1.8', '2.0', 'Max']},
    specs: {Speed: '9.5', Spin: '9.0', Control: '9.0', Weight: '45 g (uncut)'},
  },
  {
    name: 'Xiom Vega Pro Rubber',
    category: 'Rubbers',
    brand: 'Xiom',
    price: 11000,
    isNew: true,
    shortDescription:
      'Tensor rubber with a medium-hard sponge. Fast, spinny and easy to play with.',
    description: [
      'Vega Pro offers a great balance of speed, spin and control for attacking players.',
      'Choose colour and sponge thickness.',
    ],
    options: {Colour: COLOUR, Thickness: ['1.8', '2.0', 'Max']},
    specs: {Speed: '12', Spin: '11', Control: '8.0', Hardness: '47.5°'},
  },

  // Balls
  {
    name: 'Nittaku Premium 40+ 3-Star Balls',
    category: 'Balls',
    brand: 'Nittaku',
    price: 2200,
    featured: true,
    shortDescription:
      'ITTF-approved 3-star match balls, made in Japan. Price shown is for a pack of 3.',
    description: [
      'Premium seamless balls with a true bounce and long life. Used in international tournaments.',
      'Price shown is for a pack of 3. Ask on WhatsApp for the price of 6 and 12 packs.',
    ],
    options: {Pack: ['3 balls', '6 balls', '12 balls']},
    specs: {Size: '40+ mm', Material: 'ABS plastic', Grade: '3-star (ITTF approved)'},
  },

  // Grips & Accessories
  {
    name: 'Donic Edge Tape 12 mm',
    category: 'Grips & Accessories',
    brand: 'Donic',
    price: 900,
    shortDescription: 'Protects the edges of your blade and rubbers from knocks. 5 m roll.',
    description: ['Self-adhesive edge tape that protects your blade edges and keeps rubbers neat.'],
    options: {Colour: ['Black', 'Blue', 'Red']},
    specs: {Width: '12 mm', Length: '5 m'},
  },

  // Shoes
  {
    name: 'Butterfly Lezoline Rifones Shoes',
    category: 'Shoes',
    brand: 'Butterfly',
    price: 22000,
    isNew: true,
    featured: true,
    shortDescription:
      'Lightweight table tennis shoes with a grippy sole for fast footwork and stable stops.',
    description: [
      'Light, breathable and supportive shoes with a non-marking rubber sole made for indoor courts.',
      'Choose your size (EU sizing).',
    ],
    options: {Size: ['40', '41', '42', '43', '44', '45'], Colour: ['Black', 'Navy']},
    specs: {Sole: 'Non-marking rubber', Weight: '290 g (size 42)'},
  },

  // Bags & Cases
  {
    name: 'Joola Double Racket Case',
    category: 'Bags & Cases',
    brand: 'Joola',
    price: 2500,
    salePrice: 1999,
    shortDescription:
      'Padded case that holds two rackets and three balls. Keeps your rubbers fresh.',
    description: [
      'A zip-around padded case with space for two rackets and a ball compartment.',
    ],
    options: {Colour: ['Black', 'Blue']},
    specs: {Holds: '2 rackets + 3 balls', Material: 'Polyester'},
  },

  // Tables & Nets
  {
    name: 'Joola Inside 15 Indoor Table',
    category: 'Tables & Nets',
    brand: 'Joola',
    price: 165000,
    isNew: true,
    shortDescription:
      'Full-size foldable indoor table with net set included. Great for homes and clubs.',
    description: [
      'A sturdy 15 mm top on a foldable frame with wheels, so it is easy to move and store.',
      'Net set included. Delivery and setup charges depend on your city.',
    ],
    specs: {
      'Top thickness': '15 mm',
      Size: '274 × 152.5 × 76 cm',
      Folding: 'Yes, with wheels',
      'Net set': 'Included',
    },
  },
]

const products = demoProducts.map((p, index) => {
  const slug = slugify(p.name)
  return {
    _id: `demo-product-${slug}`,
    _type: 'product',
    name: p.name,
    slug: {_type: 'slug', current: slug},
    category: ref(categoryId(p.category)),
    brand: ref(brandId(p.brand)),
    price: p.price,
    ...(p.salePrice ? {salePrice: p.salePrice} : {}),
    shortDescription: p.shortDescription,
    description: p.description.map(block),
    options: Object.entries(p.options ?? {}).map(([name, values]) => ({
      _type: 'productOption',
      _key: key(),
      name,
      values,
    })),
    specs: Object.entries(p.specs ?? {}).map(([label, value]) => ({
      _type: 'specItem',
      _key: key(),
      label,
      value,
    })),
    inStock: p.inStock ?? true,
    featured: p.featured ?? false,
    isNew: p.isNew ?? false,
    sortOrder: index + 1,
  }
})

// ---------------------------------------------------------------------------
// Site settings (placeholder contact details)
// ---------------------------------------------------------------------------

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  shopName: 'tabletennis68',
  whatsappNumber: '923000000000',
  phone: '0300 0000000',
  email: 'info@example.com',
  address: 'Shop address goes here\nCity, Pakistan',
  openingHours: 'Mon–Sat: 11am – 9pm\nSunday: Closed',
  announcementText: 'Order on WhatsApp · Cash on delivery all over Pakistan',
  deliveryInfo:
    'We deliver all over Pakistan by courier. Delivery usually takes 2–4 working days. Delivery charges are confirmed on WhatsApp before dispatch. Cash on delivery available.',
  aboutText: [
    block(
      'tabletennis68 is a table tennis equipment shop for players of every level, from beginners to tournament players.',
    ),
    block('We stock genuine rackets, blades, rubbers, balls and accessories from top brands.'),
  ],
}

// ---------------------------------------------------------------------------

async function seed() {
  const {projectId, dataset} = client.config()
  console.log(`Seeding project "${projectId}", dataset "${dataset}"...`)

  const tx = client.transaction()
  for (const doc of [...categories, ...brands]) tx.createIfNotExists(doc)
  tx.createIfNotExists(siteSettings)
  for (const doc of products) tx.createOrReplace(doc)
  await tx.commit({visibility: 'async'})

  console.log(`✔ ${categories.length} categories (created if missing)`)
  console.log(`✔ ${brands.length} brands (created if missing)`)
  console.log('✔ Site settings (created if missing)')
  console.log(`✔ ${products.length} demo products (ids start with "demo-")`)
  console.log('\nDemo products have no photos. Add photos in the Studio before publishing them for real.')
}

seed().catch((error) => {
  console.error('Seeding failed:', error.message)
  process.exit(1)
})
