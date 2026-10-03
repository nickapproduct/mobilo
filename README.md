# Mobilo

A small telecom self-care app: balance, tariff, top-up. Expo + React Native + TypeScript.

It exists to be crawled. Approduct walks it on a real device, files what is wrong with the screenshots
as evidence, and a coding agent then reads those findings and fixes them — which is the whole demo.

```bash
npm install
npm start            # Expo, for looking at it
npm run apk          # prebuild + gradle assembleRelease, for crawling it
npm run typecheck
```

The build to crawl is `android/app/build/outputs/apk/release/app-release.apk`. Submit it the same way
any other app is submitted.

Sign in with any number that has nine or more digits; the code is `0000`. A card number ending `00` is
declined, so the failure path is reachable whenever you want it.

## Screens

| | |
| --- | --- |
| Welcome | the first thing a new person sees |
| Sign in → Code | phone number, then a one-time code |
| Home | balance, tariff, data left |
| Top up | choose an amount, pay by card |
| Tariffs | what else is available |

## Fixing it

Connect a coding agent to Approduct, point it at the app, and ask it what is wrong. It reads the
finding, looks at the frame the crawl captured, searches the reference library for how other apps
handle the same moment, and changes the code. See `PLANTED.md` for what is in here and why — read it
after the demo rather than before, since knowing the answers is not the same as finding them.
