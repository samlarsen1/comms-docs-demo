# comms-docs-demo

Docusaurus documentation site for the Comms Platform. Covers the REST API, Kafka event schemas, file-based integrations, and Avro schema reference.

## Local development

```bash
cd website
npm install
npm run start        # dev server at http://localhost:3000
npm run build        # production build → website/build/
npm run serve        # serve the production build locally
```

## Regenerating API docs

The REST API reference is generated from `website/examples/comms-api.yaml`:

```bash
cd website
npm run gen:api      # regenerate docs/rest-apis/ from the OpenAPI spec
npm run build
```

## Updating Avro schema docs

Schema docs are generated from the sibling [`comms-docs-schemas`](https://github.com/samlarsen1/comms-docs-schemas) repo. Both repos must be checked out side by side:

```
~/your-dir/
  comms-docs-demo/       ← this repo
  comms-docs-schemas/    ← sibling repo
```

When schemas change in `comms-docs-schemas`, update the docs site:

```bash
cd comms-docs-demo/website
npm run gen:schemas                   # reads ../comms-docs-schemas, writes docs/schemas/
git add docs/schemas/
git commit -m "chore: regenerate schema docs"
git push
```

To regenerate everything in one go:

```bash
cd comms-docs-demo/website
npm run gen:schemas && npm run gen:api && npm run build
```

The generator script lives in `comms-docs-schemas/scripts/generate-schema-docs.mjs` and is configured by `comms-docs-schemas/schema-docs.config.json`.
