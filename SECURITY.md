# Security Policy

## Supported version

Security fixes are applied to the latest version on the default branch.

## Reporting a vulnerability

Do not publish API credentials, authorization headers or exploitable security details in a public issue.

Report suspected vulnerabilities privately to the repository owner using GitHub's private vulnerability reporting feature when enabled. Include reproduction steps and the expected impact, but use placeholder credentials and synthetic keyword data.

## Credential handling

- DataForSEO credentials belong only in the local `.env` file.
- `.env` is excluded from Git and downloadable archives.
- Browser JavaScript must never receive the credentials or an authorization header.
- The server binds to `127.0.0.1` by default and should not be exposed to a network without adding authentication and transport security.
- Do not disable macOS Gatekeeper globally to run Keyword Workbench. Follow the file-specific steps in `MACOS_FIRST_RUN.md`.
