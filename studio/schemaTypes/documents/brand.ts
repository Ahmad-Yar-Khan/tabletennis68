import {StarIcon} from '@sanity/icons/Star'
import {defineField, defineType} from 'sanity'
import {imageWithAlt} from '../objects/imageWithAlt'

export const brand = defineType({
  name: 'brand',
  title: 'Brand',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Brand name',
      type: 'string',
      description: 'e.g. Butterfly, DHS or Stiga.',
      validation: (rule) => rule.required().error('Please enter the brand name.'),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'The end of this brand’s link (tabletennis68.com/brand/...). Click "Generate" to make it from the name.',
      options: {source: 'name', maxLength: 96},
      validation: (rule) =>
        rule.required().error('Please click "Generate" to create the web address.'),
    }),
    imageWithAlt({
      name: 'logo',
      title: 'Brand logo',
      description:
        'Optional. Shown under "Shop by brand". A logo on a white or clear background works best.',
    }),
  ],
  orderings: [{title: 'Name (A–Z)', name: 'nameAsc', by: [{field: 'name', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', media: 'logo'},
    prepare({title, media}) {
      return {title: title || 'Untitled brand', media: media ?? StarIcon}
    },
  },
})
