import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType, type UrlRule} from 'sanity'
import {simpleBlock} from '../objects/simpleBlock'

/** Validation for an optional http(s) link with a friendly example. */
const optionalWebLink = (example: string) => (rule: UrlRule) =>
  rule
    .uri({scheme: ['http', 'https']})
    .error(`Please paste a full web address starting with https://, e.g. ${example}`)

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'social', title: 'Social media'},
    {name: 'text', title: 'Website text'},
  ],
  fields: [
    defineField({
      name: 'shopName',
      title: 'Shop name',
      type: 'string',
      group: 'contact',
      description: 'Shown in the website header, footer and Google results.',
      validation: (rule) => rule.required().error('Please enter the shop name.'),
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      group: 'contact',
      description:
        'All orders go to this number. Digits only, starting with 92 and without the first 0, e.g. 923001234567 (not 0300-1234567 or +92 300 1234567).',
      validation: (rule) => [
        rule.required().error('Please enter the WhatsApp number that receives orders.'),
        rule.custom((value) => {
          if (!value) return true
          if (!/^\d+$/.test(value)) {
            return 'Use digits only, with no spaces, dashes or "+". Example: 923001234567.'
          }
          if (value.startsWith('0')) {
            return 'Start with the country code 92 instead of 0. Example: 0300 1234567 becomes 923001234567.'
          }
          if (value.length < 10 || value.length > 15) {
            return 'This does not look like a full number. Example: 923001234567 (12 digits).'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      group: 'contact',
      description: 'The number customers can call, written how you like, e.g. 0300 1234567.',
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      group: 'contact',
      description: 'Optional. e.g. info@tabletennis68.com',
      validation: (rule) =>
        rule.email().error('This does not look like an email address, e.g. info@tabletennis68.com'),
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram link',
      type: 'url',
      group: 'social',
      description: 'Optional. The full link to your Instagram page.',
      validation: optionalWebLink('https://instagram.com/yourshop'),
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook link',
      type: 'url',
      group: 'social',
      description: 'Optional. The full link to your Facebook page.',
      validation: optionalWebLink('https://facebook.com/yourshop'),
    }),
    defineField({
      name: 'announcementText',
      title: 'Announcement bar',
      type: 'string',
      group: 'text',
      description:
        'Optional. A short message in a strip at the top of every page, e.g. "Cash on delivery all over Pakistan". Leave empty to hide it.',
      validation: (rule) =>
        rule.max(100).warning('Keep it short (under 100 characters) so it fits on phones.'),
    }),
    defineField({
      name: 'deliveryInfo',
      title: 'Delivery information',
      type: 'text',
      group: 'text',
      rows: 4,
      description:
        'How delivery works: delivery times, charges and cash on delivery. Shown on the contact page and under the order button on every product page.',
    }),
    defineField({
      name: 'aboutText',
      title: 'About the shop',
      type: 'array',
      group: 'text',
      description: 'The story of your shop, shown on the About page.',
      of: [simpleBlock],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site settings'}
    },
  },
})
