import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID. Copy studio/.env.example to studio/.env and fill in.',
  )
}

/** Singleton types: exactly one document, which can't be created again, duplicated or deleted. */
const singletonTypes = new Set(['siteSettings'])
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

export default defineConfig({
  name: 'default',
  title: 'tabletennis68',

  projectId,
  dataset,

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
      {
        id: 'product-in-category',
        title: 'Product in this category',
        schemaType: 'product',
        parameters: [{name: 'categoryId', type: 'string'}],
        value: ({categoryId}: {categoryId: string}) => ({
          category: {_type: 'reference', _ref: categoryId},
          inStock: true,
          featured: false,
          isNew: false,
        }),
      },
    ],
  },

  document: {
    // Hide the singleton and the category-specific template from the global "Create" menu.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter(
            ({templateId}) => !singletonTypes.has(templateId) && templateId !== 'product-in-category',
          )
        : prev,
    // The singleton can only be published or reverted, never duplicated or deleted.
    actions: (prev, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? prev.filter(({action}) => action && singletonActions.has(action))
        : prev,
  },
})
