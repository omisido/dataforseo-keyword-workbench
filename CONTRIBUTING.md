# Contributing

Thanks for helping improve Keyword Workbench.

## Before opening a change

1. Search existing issues to avoid duplicates.
2. Keep changes focused on one behaviour or problem.
3. Do not include API credentials, `.env` files or customer keyword data.

## Development

Keyword Workbench requires Node.js 20 or newer and has no third-party npm dependencies.

```bash
npm test
npm start
```

## Pull requests

- Explain the user-facing problem and the chosen solution.
- Add or update behavioural tests for changed behaviour.
- Confirm `npm test` passes.
- Update the README or technical documentation when setup or API behaviour changes.
- Preserve the server-side credential boundary.

## Reporting bugs

Include the operating system, Node.js version, steps to reproduce and the safe error message shown by the app. Remove credentials, authorization headers and private keyword data before posting.
