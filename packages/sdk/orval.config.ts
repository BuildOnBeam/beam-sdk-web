import { defineConfig } from 'orval';

const config: ReturnType<typeof defineConfig> = defineConfig({
  'api-connection': {
    output: {
      client: 'axios',
      target: './src/lib/api/beam.connection-api.generated.ts',
      override: {
        mutator: {
          path: './src/lib/api/beam-axios-client.ts',
          name: 'client',
        },
      },
      schemas: './src/lib/api/beam.connection-api.types.generated',
      indexFiles: true,
      biome: true,
    },
    input: {
      target: 'https://api.preview.onbeam.com/api/connection-json',
      parserOptions: {
        resolve: {
          http: {
            timeout: 30_000,
          },
        },
      },
    },
  },
  'api-player': {
    output: {
      client: 'axios',
      target: './src/lib/api/beam.player-api.generated.ts',
      override: {
        mutator: {
          path: './src/lib/api/beam-axios-client.ts',
          name: 'client',
        },
      },
      schemas: './src/lib/api/beam.player-api.types.generated',
      indexFiles: true,
      biome: true,
    },
    input: {
      target: 'https://api.preview.onbeam.com/api/player-json',
      parserOptions: {
        resolve: {
          http: {
            timeout: 30_000,
          },
        },
      },
    },
  },
});

export default config;
