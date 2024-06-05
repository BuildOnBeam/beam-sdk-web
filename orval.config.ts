import { defineConfig } from "orval";

const config: ReturnType<typeof defineConfig> = defineConfig({
  client: {
    output: {
      client: "axios",
      target: "./src/lib/api/beam.api.generated.ts",
      override: {
        mutator: {
          path: "./src/lib/api/beam-axios-client.ts",
          name: "client",
        },
      },
      schemas: "./src/lib/api/beam.types.generated",
      indexFiles: true,
    },
    input: {
      target: "https://api.preview.onbeam.com/api/player-json",
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
