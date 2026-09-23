# Deploy PocketArc to Cloudflare Pages

PocketArc is a static React and Vite single-page application. Cloudflare Pages
can build it directly from GitHub; it does not need a server, Pages Function,
Worker, database, secret, or runtime environment variable.

## Deployment values

Enter these exact values when Cloudflare asks how to build the project:

| Setting | Value |
| --- | --- |
| Git provider | GitHub |
| Repository | `76prateek-lab/pocketarc` |
| Production branch | `main` |
| Framework preset | React (Vite), Vite, or None |
| Root directory | Leave blank |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | None required |
| Node version | `22.16.0` from `.node-version` |

The framework preset is only a convenience. The build command and output
directory above are the settings that matter.

## 1. Check the project locally

Open Terminal in the PocketArc project directory and run:

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

The last command validates the approved-ROM manifest and self-hosted EmulatorJS
runtime before building. It then verifies the finished `dist/` directory. Do
not continue if any command fails.

## 2. Commit and push to GitHub

Review the files first:

```bash
git status
git add .
git commit -m "Prepare PocketArc for Cloudflare Pages"
git branch -M main
git push -u origin main
```

The configured repository is:

```text
git@github.com:76prateek-lab/pocketarc.git
```

If `git push` reports an SSH authentication error, add this computer's SSH key
to GitHub or change the remote to HTTPS and authenticate with GitHub:

```bash
git remote set-url origin https://github.com/76prateek-lab/pocketarc.git
git push -u origin main
```

Before continuing, open the GitHub repository in a browser and confirm the
latest commit and `public/catalog/roms/` files are visible.

## 3. Create the Cloudflare Pages project

1. Sign in to the Cloudflare dashboard.
2. Open **Workers & Pages**.
3. Select **Create application**.
4. Select **Pages**, then **Import an existing Git repository**.
5. Connect GitHub if asked. Give Cloudflare access to
   `76prateek-lab/pocketarc`.
6. Select the PocketArc repository and choose **Begin setup**.
7. Use the deployment values from the table at the top of this document.
8. Select **Save and Deploy**.

Cloudflare installs dependencies, runs the production build, and publishes the
contents of `dist/`. A successful first deployment receives a URL similar to:

```text
https://pocketarc.pages.dev
```

Every later push to `main` creates a new production deployment. Other branches
can be used for preview deployments.

## 4. Check the first deployment

Open these addresses directly in separate browser tabs, replacing the example
host with the Pages URL Cloudflare gives you:

```text
https://pocketarc.pages.dev/
https://pocketarc.pages.dev/app
https://pocketarc.pages.dev/app/library
https://pocketarc.pages.dev/app/settings
https://pocketarc.pages.dev/app/storage
```

All routes should load PocketArc, including after a hard refresh. Cloudflare
Pages treats a site without a top-level `404.html` as an SPA and falls back to
the root application. PocketArc therefore intentionally has no `_redirects`
file.

Then perform this short functional test:

1. Open **Library** and confirm the seven trial games appear.
2. Choose a trial game and select its install/play action.
3. Start the emulator and test keyboard or touch controls.
4. Create a normal save or save state, then reload the page.
5. Confirm the installed ROM and save remain available.
6. Install the PWA and open it from the home screen.

Catalog ROMs are public deployment assets, but the service worker deliberately
does not precache them. A ROM is downloaded only after the visitor chooses to
install it, its SHA-256 checksum is verified, and it is stored in that visitor's
IndexedDB. User-imported ROMs and saves remain client-side and are never sent to
PocketArc or Cloudflare.

## 5. Add `play.<your-domain>` later

After the `pages.dev` deployment works:

1. Open **Workers & Pages → PocketArc → Custom domains**.
2. Select **Set up a domain**.
3. Enter `play.<your-domain>` and continue.
4. If the domain uses Cloudflare DNS, Cloudflare can create the record
   automatically.
5. If DNS is hosted elsewhere, first add the custom domain inside the Pages
   project, then create a CNAME at the DNS provider:

   ```text
   Type: CNAME
   Name: play
   Target: pocketarc.pages.dev
   ```

Do not create only the CNAME without first associating the custom domain with
the Pages project. Cloudflare must know which Pages project owns the hostname.

## Troubleshooting

### The build fails

Open the deployment and read **Build logs**. Confirm the build settings are
exactly `npm run build` and `dist`, and that the root directory is blank. Run
the same build locally before pushing another commit.

### A direct application route shows 404

Confirm `dist/index.html` exists and no top-level `404.html` was added. Do not
add a catch-all `_redirects` rule unless Cloudflare's documented SPA behavior
changes.

### A ROM is missing

Every public ROM must have matching metadata in `public/catalog/games.json` and
an exact SHA-256 entry in `scripts/approved-catalog-roms.json`. The production
build fails if the public files and approval manifest differ.

### A deployment says an asset is too large

Cloudflare Pages currently limits each asset to 25 MiB. PocketArc's largest
current asset is 16 MiB, so the checked-in trial catalog fits. Recheck this
limit before adding future trial ROMs.

## Relevant Cloudflare documentation

- [React deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [SPA routing behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
