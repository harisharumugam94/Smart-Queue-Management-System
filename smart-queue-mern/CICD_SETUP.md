# CI/CD Pipeline — setup guide

This adds a GitHub Actions workflow that automatically, on every push
or pull request to `main`:
1. Lints and unit-tests the backend (`server/`)
2. Lints, unit-tests, and builds the frontend (`client/`)
3. If both pass AND it's a real push to `main` (not just a PR) —
   builds both Docker images and pushes them to GitHub Container
   Registry (ghcr.io)

## What's new in this update

| File | What it is |
|---|---|
| `.github/workflows/ci-cd.yml` | The actual pipeline definition |
| `server/utils/queueHelpers.js` | Ticket-numbering logic, pulled out so it's unit-testable |
| `server/test/queueHelpers.test.js` | Real unit test for that logic (uses Node's built-in test runner) |
| `server/eslint.config.js` | Lint rules for the backend |
| `client/src/queueUtils.js` | "who's being served" logic, pulled out so it's unit-testable |
| `client/src/test/queueUtils.test.js` | Real unit test for that logic (uses Vitest) |
| `client/eslint.config.cjs` | Lint rules for the frontend |
| Both `package.json` files | Added `lint` and `test` scripts |

I ran all of these myself before giving them to you — lint passes,
and all 7 unit tests (3 backend + 4 frontend) pass, and the frontend
still builds correctly.

## One-time GitHub setting you MUST change

By default, GitHub Actions can't push packages/images to your
repo's container registry. Turn this on once:

1. Go to your repo on GitHub → **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **"Read and write permissions"**
4. Click **Save**

Without this, the `docker-build-push` job will fail with a
permissions error — everything else will still pass.

## How to add these files

Copy each new/changed file into your existing project at the exact
paths shown in the table above, then:

```
git add .
git commit -m "Add CI/CD pipeline with GitHub Actions"
git push
```

## Watching it run

1. Go to your repo on GitHub → click the **Actions** tab
2. You'll see "CI/CD Pipeline" running (yellow dot), then either a
   green checkmark (passed) or red X (failed) after a minute or two
3. Click into the run to see the exact logs for each step — this is
   your task's required "build logs" proof

## Adding the badge to your README

Once it's passed at least once, add this to the top of your
`README.md` (replace `USERNAME` and `REPO`):

```markdown
![CI/CD Pipeline](https://github.com/USERNAME/REPO/actions/workflows/ci-cd.yml/badge.svg)
```

This shows a live "passing"/"failing" badge that updates automatically.

## Viewing your pushed images

After a successful run, go to your GitHub profile → **Packages** tab
— you'll see `smart-queue-server` and `smart-queue-client` listed as
container images, each tagged `latest`.

## If the pipeline fails

- **Lint or test step fails** — click into the failed step in the
  Actions tab to see exactly which line failed; the same command
  (`npm run lint` or `npm test`) will reproduce it on your machine.
- **docker-build-push fails with a permissions error** — you likely
  skipped the "Workflow permissions" step above.
- **Anything else** — paste the error from the Actions log here.
