import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'
import {imageWithAlt} from '../objects/imageWithAlt'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Category name',
      type: 'string',
      description: 'The name shown in the menu, e.g. "Blades" or "Bags & Cases".',
      validation: (rule) => rule.required().error('Please enter the category name.'),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The end of this category’s link (tabletennis68.com/category/...). Click "Generate" to make it from the name.',
      options: {source: 'name', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Please click "Generate" to create the web address.'),
    }),
    imageWithAlt({
      name: 'image',
      title: 'Category photo',
      description: 'Shown on the home page under "Shop by category". A square photo works best.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional. A sentence or two shown at the top of the category page.',
    }),
    defineField({
      name: 'order',
      title: 'Position',
      type: 'number',
      description: 'Lower numbers are shown first, e.g. 1 = first, 2 = second.',
      validation: (rule) => rule.integer().error('Please use a whole number, e.g. 1, 2 or 3.'),
    }),
  ],
  orderings: [
    {title: 'Position', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Name (A–Z)', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', order: 'order', media: 'image'},
    prepare({title, order, media}) {
      return {
        title: title || 'Untitled category',
        subtitle: typeof order === 'number' ? `Position ${order}` : 'No position set',
        media: media ?? TagIcon,
      }
    },
  },
})
