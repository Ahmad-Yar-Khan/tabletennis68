import {defineField} from 'sanity'

type ImageFieldOptions = {
  name: string
  title: string
  description: string
  required?: boolean
}

/** The alt text field every image carries. */
export const altField = defineField({
  name: 'alt',
  title: 'Describe this photo',
  type: 'string',
  description:
    'A short description for blind visitors and Google, e.g. "Butterfly Viscaria blade, front view".',
  validation: (rule) =>
    rule
      .required()
      .error('Please describe the photo in a few words. It helps blind visitors and Google.'),
})

/** An image field with hotspot (choose the focus point) and a required alt text. */
export function imageWithAlt({name, title, description, required = false}: ImageFieldOptions) {
  return defineField({
    name,
    title,
    type: 'image',
    description,
    options: {hotspot: true},
    fields: [altField],
    validation: required
      ? (rule) => rule.required().error(`Please add the ${title.toLowerCase()}.`)
      : undefined,
  })
}
