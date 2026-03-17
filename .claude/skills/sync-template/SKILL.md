# Sync Template

Sync the latest features from the upstream `what-is` template into this project.

Template repo: `https://github.com/quochuydev/what-is.git`

## Instructions

You are syncing updates from the what-is template repo into the current project. Follow these steps carefully:

### Step 1: Detect context

- Run `git remote -v` to check if an `upstream` remote already exists
- If not, add it: `git remote add upstream https://github.com/quochuydev/what-is.git`
- Run `git fetch upstream main`

### Step 2: Identify new changes

- Run `git log HEAD..upstream/main --oneline` to list new commits from the template
- If there are no new commits, inform the user the project is already up to date and stop
- Show the user the list of new commits and summarize what changed (new features, bug fixes, config changes, etc.)

### Step 3: Identify project-specific files

These files are **project-specific** and must NEVER be overwritten during sync:
- `CLAUDE.md` (project instructions)
- `web/src/lib/config.ts` (site name, URLs, branding)
- `web/.env` / `web/.env.local` (secrets)
- `web/content/docs/**` (documentation content)
- `web/content/blog/**` (blog content)
- `web/src/app/page.tsx` (landing page - likely customized)
- `README.md`
- Any file the user has customized with project-specific branding

### Step 4: Plan the merge

- Run `git diff HEAD..upstream/main --stat` to see all changed files
- Categorize each changed file:
  - **Safe to auto-merge**: lib utilities, API routes, components, dependencies, configs with no branding
  - **Needs manual review**: files that touch both template infrastructure AND project-specific content
  - **Skip**: project-specific files listed in Step 3
- Present this plan to the user and ask for confirmation before proceeding

### Step 5: Execute the merge

- Create a new branch: `git checkout -b sync-template-{YYYYMMDD}`
- Run `git merge upstream/main --no-commit --no-ff`
- If there are merge conflicts:
  - For project-specific files: keep the current project version (`git checkout --ours <file>`)
  - For template files: keep the upstream version (`git checkout --theirs <file>`)
  - For mixed files: show the conflict to the user and resolve together
- Stage the resolved files

### Step 6: Verify

- Run type-check: `cd web && npx tsc --noEmit`
- If there are NEW errors (not pre-existing), fix them
- Run `npm run build` to verify the build works (if the user confirms)

### Step 7: Commit

- Create a commit with message: `chore: sync with upstream template ({date})`
- Include a summary of what was synced in the commit body
- Ask the user if they want to merge the branch into their main branch

## Important

- NEVER force-push or overwrite the user's main branch directly
- ALWAYS work on a separate branch
- ALWAYS show the user what will change before applying
- If the template added new env vars, inform the user to update their `.env`
- If the template added new dependencies, run `npm install` after merge
