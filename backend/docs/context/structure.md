# Hono Backend Project Structure

Based on the official Hono best practices: https://hono.dev/docs/guides/best-practices

```
backend/
├── src/
│   ├── index.ts              # Server entry point (serve / export default)
│   ├── app.ts                # Creates the main Hono app, global middleware, mounts routes
│   ├── factory.ts            # createFactory<Env>() shared by middleware and handlers
│   ├── routes/
│   │   ├── index.ts          # app.route('/authors', authors), app.route('/books', books)
│   │   ├── authors.ts        # Chained .get().post() with inline handlers, export AppType
│   │   └── books.ts
│   ├── middleware/           # factory.createMiddleware(...)
│   │   ├── auth.ts
│   │   └── error-handler.ts
│   ├── validators/           # zValidator / validator schemas per feature
│   ├── services/             # Business logic, called from handlers (not controllers)
│   ├── db/                   # DB client and schema
│   ├── lib/                  # env parsing, HTTPException helpers
│   └── types/
│       ├── env.ts            # Bindings and Variables types
│       └── rpc.ts            # Re-exported AppType for hc<AppType>()
├── tests/
│   └── routes/               # app.request() tests, including HEAD vs GET
└── ...config files
```

## Key principles

- **`hono/factory`** (`createFactory`) provides typed shared middleware and handlers when reuse is needed.
- **RPC:** chain methods in each route file and `export type AppType = typeof app`.
- **HEAD requests:** don't add `app.head()` handlers; Hono routes HEAD to GET automatically. Use middleware for HEAD-specific logic.
