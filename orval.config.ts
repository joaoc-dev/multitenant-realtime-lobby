import { defineConfig } from 'orval';

const OPENAPI_URL = process.env.OPENAPI_URL || 'http://localhost:5046/openapi/v1.json';

export default defineConfig({
  api: {
    input: {
      target: OPENAPI_URL, // Live spec
    },
    output: {
      mode: 'tags-split',
      target: './apps/client/src/api/generated',
      schemas: './apps/client/src/api/generated/models',
      client: 'fetch',
      mock: false,
      clean: true,
      override: {
        mutator: {
          path: './apps/client/src/api/mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
});