import {ImageIcon} from '@sanity/icons/Image'
import {defineField, defineType} from 'sanity'
import {imageWithAlt} from '../objects/imageWithAlt'

export const banner = defineType({
  name: 'banner',
  title: 'Home banner',
  type: 'document',
  icon: ImageIcon,
  fields: [
    imageWithAlt({
      name: 'image',
      title: 'Banner photo',
      description:
        'The large photo at the top of the home page. Use a wide photo (about 1600 × 800).',
      required: true,
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The big text on the banner, e.g. "New Butterfly blades are here".',
      validation: (rule) =>
        rule
          .max(70)
          .warning('Shorter headings look better on phones. Try to keep it under 70 characters.'),
    }),
    defineField({
      name: 'subheading',
      title: 'Smaller text',
      type: 'string',
      description: 'Optional. A line under the heading, e.g. "Cash on delivery all over Pakistan".',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button text',
      type: 'string',
      description:
        'Optional. The words on the button, e.g. "Shop blades". Leave empty for no button.',
    }),
    defineField({
      name: 'buttonLink',
      title: 'Button link',
      type: 'string',
      description:
        'Where the button goes. Use a page on this site, e.g. /shop or /category/blades, or a full web address.',
      validation: (rule) =>
        rule.custom((link, context) => {
          const buttonText = (context.document as {buttonText?: string} | undefined)?.buttonText
          if (!link) return buttonText ? 'Please add where the button should go, e.g. /shop.' : true
          if (link.startsWith('/') || /^https?:\/\//.test(link)) return true
          return 'The link should start with "/" (e.g. /shop) or with "https://".'
        }),
    }),
    defineField({
      name: 'order',
      title: 'Position',
      type: 'number',
      description: 'Lower numbers are shown first, e.g. 1 = first banner.',
      validation: (rule) => rule.integer().error('Please use a whole number, e.g. 1, 2 or 3.'),
    }),
    defineField({
      name: 'active',
      title: 'Show on website',
      type: 'boolean',
      description: 'Turn off to hide this banner without deleting it.',
      initialValue: true,
    }),
  ],
  orderings: [{title: 'Position', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {heading: 'heading', active: 'active', order: 'order', media: 'image'},
    prepare({heading, active, order, media}) {
      const parts = [typeof order === 'number' ? `Position ${order}` : 'No position set']
      if (active === false) parts.push('Hidden')
      return {title: heading || 'Banner without heading', subtitle: parts.join(' · '), media}
    },
  },
})
