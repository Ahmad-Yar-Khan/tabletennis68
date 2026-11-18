import {defineArrayMember} from 'sanity'

/** A simple rich-text block: paragraphs, one heading level, lists, bold and italic. */
export const simpleBlock = defineArrayMember({
  type: 'block',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'Heading', value: 'h3'},
  ],
  lists: [
    {title: 'Bullet list', value: 'bullet'},
    {title: 'Numbered list', value: 'number'},
  ],
  marks: {
    decorators: [
      {title: 'Bold', value: 'strong'},
      {title: 'Italic', value: 'em'},
    ],
    annotations: [],
  },
})
