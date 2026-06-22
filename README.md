# DataForSEO Keyword Workbench

A small, dependency-free local interface for researching Google Ads keyword search volume through the DataForSEO API.

> **Unofficial project:** Keyword Workbench is an independent community project. It is not affiliated with, endorsed by, or maintained by DataForSEO. DataForSEO is a trademark of its respective owner.

## Read the guide

For the complete walkthrough, read [Build Your Local Keyword Research Tool with DataForSEO](https://omisido.com/build-your-local-keyword-research-tool-with-dataforseo/). It explains the idea behind the project, local setup, API connection, metric interpretation, security and ways to extend the tool.

## Features

- Research up to 1,000 unique keywords per request
- View search volume, CPC, paid competition and competition index
- Use presets for the UK, USA, Germany, Italy, France and Spain
- Automatically select the usual local language for each market
- Sort results and export them as CSV
- Remove blank lines and duplicate keywords before submitting
- Keep DataForSEO credentials on the local server, never in browser code
- Start with double-click launchers for macOS and Windows
- Run without third-party npm packages

## Requirements

- A DataForSEO account with API access and available credit
- Node.js 20 or newer

The launchers check for Node.js and open its official download page when it is not installed.

## Run on macOS

1. Download and unzip the project.
2. Double-click `Start Keyword Workbench.command`.
3. On the first run, add your DataForSEO API credentials to the `.env` file opened in TextEdit.
4. Save the file and run the launcher again.

Keep the Terminal window open while using the tool.

### If macOS blocks the launcher

Because the launcher is an unsigned open-source script downloaded from the internet, macOS may show an Apple verification warning on first use.

1. Choose **Done**, not **Move to Bin**.
2. Open **System Settings → Privacy & Security**.
3. Scroll to **Security** and select **Open Anyway** for `Start Keyword Workbench.command`.
4. Confirm with your password or Touch ID, then select **Open**.

See [Opening Keyword Workbench on macOS](MACOS_FIRST_RUN.md) for illustrated-level detail and a safe Terminal fallback. Do not disable Gatekeeper globally.

## Run on Windows

1. Download and unzip the project.
2. Double-click `Start Keyword Workbench.bat`.
3. On the first run, add your DataForSEO API credentials to the `.env` file opened in Notepad.
4. Save the file and run the launcher again.

Keep the Command Prompt window open while using the tool.

## Run from a terminal

Create your private configuration file:

```bash
cp .env.example .env
```

Add your DataForSEO API credentials to `.env`, then run:

```bash
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Security

The browser communicates only with the Node.js server running on `127.0.0.1`. The server adds DataForSEO authentication and sends the request over HTTPS. API credentials remain in the local `.env` file, which is excluded from Git.

Never commit `.env`, paste credentials into an issue, or include credentials in screenshots. See [SECURITY.md](SECURITY.md) for reporting guidance.

## Test

```bash
npm test
```

The project uses Node.js's built-in test runner. No package installation is required.

## Project structure

```text
public/                         Browser interface
src/server.mjs                 Local HTTP server
src/keyword-research-service.mjs  DataForSEO integration
test/                           Behavioural tests
docs/                           Product and technical documentation
```

## Documentation

- [Published setup and usage guide](https://omisido.com/build-your-local-keyword-research-tool-with-dataforseo/)
- [Article source in Markdown](docs/articles/build-your-local-keyword-research-tool-with-dataforseo.md)
- [macOS first-run and Gatekeeper guide](MACOS_FIRST_RUN.md)
- [API contract](docs/api/keyword-research.md)
- [Module design](docs/architecture/keyword-research-module.md)
- [Product requirements](docs/prd/dataforseo-keyword-workbench.md)

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Data and costs

Keyword metrics are supplied by DataForSEO and may be approximate, delayed or unavailable for particular phrases and markets. DataForSEO charges for API usage. Review its current pricing, limits and terms before running large requests.

## Licence

Keyword Workbench is available under the [MIT Licence](LICENSE).
