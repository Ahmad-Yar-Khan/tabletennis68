# tabletennis68

Product showcase site for a table tennis shop in Pakistan. Customers browse and order on WhatsApp; the owner manages products in Sanity Studio. See [CLAUDE.md](CLAUDE.md) for the full spec.

| Folder | What | Stack |
| --- | --- | --- |
| `web/` | Public website (static export → `web/out`) | Next.js, Tailwind v4, Motion |
| `studio/` | Admin panel | Sanity Studio |

Requires Node.js 20.9+.

## web/

```bash
cd web
cp .env.local.example .env.local   # then fill in NEXT_PUBLIC_SANITY_PROJECT_ID
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in web/out
npm run lint
```

## studio/

```bash
cd studio
cp .env.example .env               # then fill in SANITY_STUDIO_PROJECT_ID
npm install
npm run dev      # http://localhost:3333
npm run deploy   # publish the Studio to <name>.sanity.studio
```
