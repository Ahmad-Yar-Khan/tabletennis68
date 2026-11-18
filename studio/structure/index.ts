import {CogIcon} from '@sanity/icons/Cog'
import {ImageIcon} from '@sanity/icons/Image'
import {PackageIcon} from '@sanity/icons/Package'
import {StarIcon} from '@sanity/icons/Star'
import {TagIcon} from '@sanity/icons/Tag'
import {WarningOutlineIcon} from '@sanity/icons/WarningOutline'
import type {StructureResolver} from 'sanity/structure'

export const SITE_SETTINGS_ID = 'siteSettings'
const API_VERSION = '2025-02-19'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Shop admin')
    .items([
      S.listItem()
        .title('Products')
        .icon(PackageIcon)
        .child(
          S.list()
            .title('Products')
            .items([
              S.listItem()
                .title('All products')
                .icon(PackageIcon)
                .child(S.documentTypeList('product').title('All products')),
              S.listItem()
                .title('By category')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('category')
                    .title('Choose a category')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                    .child((categoryId) =>
                      S.documentList()
                        .title('Products in this category')
                        .schemaType('product')
                        .apiVersion(API_VERSION)
                        .filter('_type == "product" && category._ref == $categoryId')
                        .params({categoryId})
                        .initialValueTemplates([
                          S.initialValueTemplateItem('product-in-category', {categoryId}),
                        ]),
                    ),
                ),
              S.listItem()
                .title('Out of stock')
                .icon(WarningOutlineIcon)
                .child(
                  S.documentList()
                    .title('Out of stock')
                    .schemaType('product')
                    .apiVersion(API_VERSION)
                    .filter('_type == "product" && inStock == false'),
                ),
            ]),
        ),
      S.listItem()
        .title('Categories')
        .icon(TagIcon)
        .child(
          S.documentTypeList('category')
            .title('Categories')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Brands')
        .icon(StarIcon)
        .child(
          S.documentTypeList('brand')
            .title('Brands')
            .defaultOrdering([{field: 'name', direction: 'asc'}]),
        ),
      S.listItem()
        .title('Home Banners')
        .icon(ImageIcon)
        .child(
          S.documentTypeList('banner')
            .title('Home Banners')
            .defaultOrdering([{field: 'order', direction: 'asc'}]),
        ),
      S.divider(),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId(SITE_SETTINGS_ID)
            .title('Site Settings'),
        ),
    ])
