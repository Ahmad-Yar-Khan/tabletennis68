import {PackageIcon} from '@sanity/icons/Package'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {formatPrice} from '../../lib/formatPrice'
import {altField} from '../objects/imageWithAlt'
import {simpleBlock} from '../objects/simpleBlock'

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: PackageIcon,
  groups: [
    {name: 'basics', title: 'Basics'},
    {name: 'photos', title: 'Photos'},
    {name: 'details', title: 'Description & specs'},
    {name: 'options', title: 'Options'},
    {name: 'visibility', title: 'Stock & display'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Product name',
      type: 'string',
      group: 'basics',
      description: 'The full name customers will see, e.g. "Butterfly Viscaria Blade".',
      validation: (rule) => rule.required().error('Please enter the product name.'),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'basics',
      description:
        'The end of this product’s link (tabletennis68.com/product/...). Click "Generate" to make it from the name.',
      options: {source: 'name', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Please click "Generate" to create the web address.'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'basics',
      to: [{type: 'category'}],
      description: 'Which section of the shop this product appears in, e.g. Blades or Rubbers.',
      validation: (rule) => rule.required().error('Please choose a category.'),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'reference',
      group: 'basics',
      to: [{type: 'brand'}],
      description: 'Who makes it, e.g. Butterfly or DHS. Leave empty if there is no brand.',
    }),
    defineField({
      name: 'price',
      title: 'Price (Rs)',
      type: 'number',
      group: 'basics',
      description: 'The normal price in rupees, numbers only. Type 12500, not "Rs 12,500".',
      validation: (rule) => [
        rule.required().error('Please enter the price.'),
        rule.positive().error('The price must be more than 0.'),
        rule.integer().error('Please use whole rupees, without paisa.'),
      ],
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale price (Rs)',
      type: 'number',
      group: 'basics',
      description:
        'Optional. Fill this in only when the product is on sale. It must be lower than the normal price. Clear it to end the sale.',
      validation: (rule) => [
        rule.positive().error('The sale price must be more than 0.'),
        rule.integer().error('Please use whole rupees, without paisa.'),
        rule.custom((salePrice, context) => {
          if (typeof salePrice !== 'number') return true
          const price = (context.document as {price?: number} | undefined)?.price
          if (typeof price === 'number' && salePrice >= price) {
            return `The sale price must be lower than the normal price (${formatPrice(price)}).`
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      group: 'photos',
      description:
        'Add at least one photo. The first photo is the main one shown in the shop. Drag photos to change the order.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [altField],
        }),
      ],
      options: {layout: 'grid'},
      validation: (rule) =>
        rule.required().min(1).error('Please add at least one photo of the product.'),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      group: 'details',
      rows: 3,
      description:
        'One or two sentences shown on product cards and in Google results. Keep it under 160 characters.',
      validation: (rule) =>
        rule.max(160).warning('Try to keep this under 160 characters so it is not cut off.'),
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      group: 'details',
      description:
        'The full details shown on the product page. You can use headings, bold and lists.',
      of: [simpleBlock],
    }),
    defineField({
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      group: 'details',
      description:
        'Technical details shown as a table, e.g. Plies: 5 wood, Speed: OFF, Weight: 85 g, Control: 8.5.',
      of: [defineArrayMember({type: 'specItem'})],
    }),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'array',
      group: 'options',
      description:
        'Options customers must choose, like Handle (FL, ST) or Colour (Red, Black). Leave empty if there is nothing to choose.',
      of: [defineArrayMember({type: 'productOption'})],
    }),
    defineField({
      name: 'inStock',
      title: 'In stock',
      type: 'boolean',
      group: 'visibility',
      description:
        'Turn this off when you run out. Customers will see "Out of stock" and can ask about a restock.',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Featured on home page',
      type: 'boolean',
      group: 'visibility',
      description: 'Turn on to show this product in the "Featured" section of the home page.',
      initialValue: false,
    }),
    defineField({
      name: 'isNew',
      title: 'Show "New" badge',
      type: 'boolean',
      group: 'visibility',
      description: 'Turn on for new arrivals. It adds a "New" badge and shows it under New Arrivals.',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      group: 'visibility',
      description:
        'Optional. Lower numbers appear first in lists, e.g. 1 before 10. Leave empty for the normal order.',
    }),
  ],
  initialValue: {inStock: true, featured: false, isNew: false},
  orderings: [
    {title: 'Name (A–Z)', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
    {title: 'Price (low to high)', name: 'priceAsc', by: [{field: 'price', direction: 'asc'}]},
    {title: 'Price (high to low)', name: 'priceDesc', by: [{field: 'price', direction: 'desc'}]},
    {title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {
      name: 'name',
      price: 'price',
      salePrice: 'salePrice',
      inStock: 'inStock',
      categoryName: 'category.name',
      media: 'images.0',
    },
    prepare({name, price, salePrice, inStock, categoryName, media}) {
      const onSale =
        typeof salePrice === 'number' && typeof price === 'number' && salePrice < price
      const priceText = onSale
        ? `${formatPrice(salePrice)} (was ${formatPrice(price)})`
        : formatPrice(price)
      const parts = [priceText, categoryName || 'No category']
      if (inStock === false) parts.push('Out of stock')
      return {
        title: name || 'Untitled product',
        subtitle: parts.join(' · '),
        media: media ?? PackageIcon,
      }
    },
  },
})
