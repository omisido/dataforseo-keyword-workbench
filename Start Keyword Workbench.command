#!/bin/zsh

set -u

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR" || exit 1

pause_before_exit() {
  printf "\nPress any key to close this window."
  read -k 1
  printf "\n"
}

if ! command -v node >/dev/null 2>&1; then
  printf "\nKeyword Workbench needs Node.js, a free program used to run the local app.\n"
  printf "The Node.js download page will open now. Install the LTS version, then run this launcher again.\n"
  open "https://nodejs.org/en/download"
  pause_before_exit
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if (( NODE_MAJOR < 20 )); then
  printf "\nKeyword Workbench needs Node.js 20 or newer.\n"
  printf "Your installed version is: %s\n" "$(node --version)"
  printf "The Node.js download page will open so you can install the current LTS version.\n"
  open "https://nodejs.org/en/download"
  pause_before_exit
  exit 1
fi

if [[ ! -f ".env" ]]; then
  cp ".env.example" ".env"
  printf "\nYour private settings file has been created.\n"
  printf "Add your DataForSEO API login and password, save the file, then run this launcher again.\n"
  open -a TextEdit ".env"
  pause_before_exit
  exit 0
fi

if grep -Eq 'your-api-login|your-api-password' ".env"; then
  printf "\nYour DataForSEO credentials still need to be added to the .env file.\n"
  printf "Replace the placeholder values, save the file, then run this launcher again.\n"
  open -a TextEdit ".env"
  pause_before_exit
  exit 1
fi

PORT_NUMBER="$(sed -n 's/^PORT=\([0-9][0-9]*\)$/\1/p' .env | head -1)"
PORT_NUMBER="${PORT_NUMBER:-4173}"
APP_URL="http://127.0.0.1:${PORT_NUMBER}"

if curl --max-time 1 -fsS "${APP_URL}/api/health" >/dev/null 2>&1; then
  printf "\nKeyword Workbench is already running. Opening it in your browser.\n"
  open "$APP_URL"
  exit 0
fi

printf "\nStarting Keyword Workbench...\n"
node --env-file=.env src/server.mjs &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

for attempt in {1..30}; do
  if curl --max-time 1 -fsS "${APP_URL}/api/health" >/dev/null 2>&1; then
    printf "Keyword Workbench is ready at %s\n" "$APP_URL"
    printf "Keep this Terminal window open while you use the tool.\n"
    open "$APP_URL"
    wait "$SERVER_PID"
    exit $?
  fi
  sleep 0.25
done

printf "\nKeyword Workbench could not start. Review the message above for details.\n"
pause_before_exit
exit 1
