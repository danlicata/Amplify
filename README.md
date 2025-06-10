# Static Astro Website

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`            | Installs dependencies                            |
| `npm dev`                | Starts local dev server at `localhost:4321`      |
| `npm build`              | Build your production site to `./dist/`          |
| `npm preview`            | Preview your build locally, before deploying     |
| `npm astro ...`          | Run CLI commands like `astro add`, `astro check` |
| `npm lint`               | Run Biome linter                                 |
| `npm lint-fix`           | Run Biome linter and fix issues                  |
| `npm format`             | Format files using Biome                         |
| `npm check`              | Run Biome formatting and linting                |
| `npm check-fix`          | Run Biome formatting and linting and fix issues |
| `npm validate`           | Run all checks and tests                         |

## Additional Packages/Tools added (These commands have already been run)

```shell
npm astro add tailwind sitemap
npm add --save-dev --save-exact @biomejs/biome
npm biome init
npm add --save-dev husky
npm exec husky init
```

## Pre-commit Hook Configuration

A pre-commit hook has been configured in `.husky/pre-commit` that runs biome check, tsc and astro check before each commit to format, lint and type check the code.

## Additional Resources

[Astro documentation](https://docs.astro.build)

[Biome documentation](https://biomejs.dev/guides/getting-started/)

[Discord server](https://astro.build/chat)
