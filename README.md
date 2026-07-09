# Universal Data Entry — React Native (Expo) App

A fully offline, mobile-first data entry app: create custom headers, submit unlimited
records, preview them like a spreadsheet (search/edit/delete), and export to
Excel (.xlsx), PDF, or JSON.

## Features

- **Home tab** — project title + live entry counter, "+" button to add unlimited
  custom headers, auto-generated form fields, Submit button that adds a record
  and clears the form.
- **Preview tab** — spreadsheet-style table with sticky header row, horizontal +
  vertical scrolling, real-time search across all columns, tap a row to select
  it, then Edit or Delete.
- **Export tab** — Export Excel / PDF / JSON (file name = your project title),
  a subtle "Made by Sahil Jadhav — Built Different" signature, and a Danger Zone
  with a two-step confirmation to clear all data.
- **Offline-first** — no login, no backend, no ads. Data is kept on-device with
  AsyncStorage so it survives app restarts, and is only removed via the Clear
  All Data flow.

## Requirements

- Node.js 18+
- The **Expo Go** app on your Android/iOS phone (free, from Play Store / App Store) —
  or an Android/iOS emulator if you prefer.

## Setup

```bash
cd UniversalDataEntry
npm install
npx expo start
```

This opens a QR code in your terminal/browser.

- **On your phone:** open the Expo Go app and scan the QR code. The app loads
  directly — no build step needed.
- **On an emulator:** press `a` (Android) or `i` (iOS) in the terminal after
  `expo start`.
- **In a browser (quick preview):** press `w`. Note: file sharing (Excel/PDF/JSON
  downloads) works best on a real device or emulator, since it uses native
  share sheets.

## Automatic APK builds with GitHub Actions (no Node.js or Android Studio needed)

This repo includes `.github/workflows/build-debug-apk.yml`, which builds a
**signed debug APK** on every push to `main` — entirely on GitHub's servers.
You never need to install Node.js, Java, or Android Studio on your own machine.

### One-time setup

**1. Create the GitHub repository**

Pick whichever is easiest for you:

- **No installs at all (drag-and-drop):** Go to [github.com/new](https://github.com/new),
  create an empty repository (don't add a README/gitignore there), then on the
  repo's main page click **"uploading an existing file"** and drag the whole
  `UniversalDataEntry` folder in from your file explorer. Modern browsers (Chrome/Edge)
  preserve the folder structure. Commit directly to `main`.
- **Using GitHub Desktop** (a small app, not a CLI — optional, only if you prefer
  a UI): install [GitHub Desktop](https://desktop.github.com/), "Add existing
  repository," publish it.

**2. Add the shared debug-signing secret**

So every build is signed with the *same* key (letting you install a new build
over an old one without uninstalling first), add the keystore I generated as a
repository secret:

1. In your repo, go to **Settings → Secrets and variables → Actions → New repository secret**.
2. Name: `ANDROID_DEBUG_KEYSTORE_BASE64`
3. Value: paste the contents of `debug-keystore-base64.txt` (provided alongside
   this project — it's the base64-encoded keystore, safe to treat as a secret
   even though debug keys carry no production trust).
4. Save.

That's it — no local Android SDK, no `adb`, no Android Studio.

### How it works

On every push to `main` (or manually via the **Actions** tab → *Build Signed
Debug APK* → *Run workflow*), GitHub spins up a temporary Ubuntu machine that:

1. Installs Node.js and JDK 17.
2. Runs `npm ci` to install dependencies.
3. Restores your shared debug keystore to `~/.android/debug.keystore`.
4. Runs `npx expo prebuild` to generate the native Android project.
5. Runs `./gradlew assembleDebug` to build the APK.
6. Uploads the resulting `.apk` as a downloadable build artifact.

### Getting the APK onto your phone

1. Go to your repo's **Actions** tab.
2. Click the latest successful **Build Signed Debug APK** run.
3. Under **Artifacts**, download `universal-data-entry-debug-apk`.
4. Unzip it, transfer the `.apk` to your phone (email, cloud drive, USB — whatever's
   convenient), and tap it to install (you'll need to allow "Install unknown apps"
   for whichever app you used to open it, one time only).

### Building a Play Store–ready release (optional, later)

The workflow above is for debug builds only. When you're ready for a signed
*release* build for the Play Store, look into
[EAS Build](https://docs.expo.dev/build/introduction/) or extending this same
workflow with a release signing config — happy to help set that up when you
get there.


## Project structure

```
UniversalDataEntry/
├── App.js                  # Root: tab switching, layout
├── context/DataContext.js  # Global state (title, headers, entries) + persistence
├── screens/
│   ├── HomeScreen.js       # Title, header creation, dynamic form, submit
│   ├── PreviewScreen.js    # Spreadsheet table, search, edit/delete
│   └── ExportScreen.js     # Export buttons, branding, danger zone
├── components/
│   ├── AddHeaderModal.js
│   ├── ConfirmDialog.js
│   └── BottomNav.js
├── utils/exportUtils.js    # Excel / PDF / JSON generation + sharing
└── theme/colors.js         # Design tokens (colors, radius, spacing)
```

## Notes on export behavior

- **Excel** is generated in-memory with the `xlsx` library and written to disk
  as a real `.xlsx` workbook.
- **PDF** is rendered from an HTML table via `expo-print` (no external service).
- **JSON** includes the title, export timestamp, header names, and all records.
- All three use the native share sheet (`expo-sharing`) so you can save to
  Files/Drive/WhatsApp/etc. straight from the export.
