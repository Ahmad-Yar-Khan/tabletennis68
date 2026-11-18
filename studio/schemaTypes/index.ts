import type {SchemaTypeDefinition} from 'sanity'
import {banner} from './documents/banner'
import {brand} from './documents/brand'
import {category} from './documents/category'
import {product} from './documents/product'
import {siteSettings} from './documents/siteSettings'
import {productOption} from './objects/productOption'
import {specItem} from './objects/specItem'

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  category,
  brand,
  banner,
  siteSettings,
  productOption,
  specItem,
]
