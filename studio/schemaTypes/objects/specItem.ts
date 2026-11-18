import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

export const specItem = defineType({
  name: 'specItem',
  title: 'Specification',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'What is being described, e.g. Plies, Speed, Control or Weight.',
      validation: (rule) => rule.required().error('Please add a label, e.g. "Weight".'),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'The detail itself, e.g. 5 wood, OFF, 8.5 or 85 g.',
      validation: (rule) => rule.required().error('Please add a value, e.g. "85 g".'),
    }),
  ],
  preview: {
    select: {label: 'label', value: 'value'},
    prepare({label, value}: {label?: string; value?: string}) {
      return {title: `${label || 'Label'}: ${value || '—'}`}
    },
  },
})
