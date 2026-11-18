import {ListIcon} from '@sanity/icons/List'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const productOption = defineType({
  name: 'productOption',
  title: 'Option',
  type: 'object',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Option name',
      type: 'string',
      description: 'What the customer is choosing, e.g. Handle, Colour, Thickness, Pack or Size.',
      validation: (rule) =>
        rule.required().error('Please give this option a name, e.g. "Colour".'),
    }),
    defineField({
      name: 'values',
      title: 'Choices',
      type: 'array',
      description:
        'Type each choice and press Enter, e.g. FL, ST, AN or Red, Black. Customers must pick one.',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      validation: (rule) => [
        rule.required().min(1).error('Please add at least one choice for this option.'),
        rule.unique().error('Each choice should only be listed once.'),
      ],
    }),
  ],
  preview: {
    select: {name: 'name', values: 'values'},
    prepare({name, values}: {name?: string; values?: string[]}) {
      return {
        title: name || 'Unnamed option',
        subtitle: values?.length ? values.join(', ') : 'No choices yet',
      }
    },
  },
})
