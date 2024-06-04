import * as fs from "node:fs";
import { glob } from "glob";

type Options = {
  target: string;
  jobs: {
    pattern: string;
    replace: string;
  }[];
};

function findAndReplace({ target, jobs }: Options) {
  return fs.readFile(target, "utf8", async (err, data) => {
    if (err) return console.error(err);

    let formatted = data;
    for (const { pattern, replace } of jobs) {
      formatted = formatted.replaceAll(pattern, replace);
    }

    fs.writeFile(target, formatted, "utf8", (err) => {
      if (err) return console.error(err);
    });
  });
}

async function search(options: Options) {
  const files = await glob(options.target);

  for (const file of files) {
    await findAndReplace({ ...options, target: file });
  }
}

async function main() {
  await search({
    target: "./src/lib/api/beam.api.generated.ts",
    jobs: [
      {
        pattern: "from './'",
        replace: "from './beam.types.generated'",
      },
    ],
  });
}

main();

console.info("Finished orval.cleanup.ts!");
