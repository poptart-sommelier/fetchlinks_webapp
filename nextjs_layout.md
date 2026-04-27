# Next.js Repository Layout Decision

This document records the Step 3 layout decision for the Next.js migration. It does not move files or scaffold the app.

## Decision

Build the new Next.js application under a new `web/` directory at the repository root.

Proposed future shape:

```text
fetchlinks_webapp/
  app/                         # existing Flask app, kept during migration
  config.py                    # existing Flask config, kept during migration
  fetchlinks_webapp.py          # existing Flask entry point, kept during migration
  requirements.txt             # existing Flask dependencies, kept during migration
  flask_baseline.md            # current Flask baseline notes
  nextjs_layout.md             # this decision record
  web/                         # new Next.js app, added in the next step
    package.json
    src/
    ...
```

## Why `web/`

- Keeps the current Flask app runnable while the Next.js app is built.
- Avoids mixing Python package files and Node/Next.js project files at the root during early migration.
- Makes side-by-side validation straightforward: Flask can keep running while `web/` runs on another port.
- Lets us remove or archive Flask later, after the Next.js app reaches feature parity.
- Keeps rollback simple because Step 4 and later changes are isolated under `web/` unless a root-level deployment or documentation file is intentionally changed.

## Alternatives Considered

### Scaffold Next.js At The Repository Root

Pros:

- Standard shape for a pure Next.js repository.
- Fewer nested commands after Flask is removed.

Cons:

- Immediately mixes Next.js files with Flask files.
- Makes the early migration harder to review.
- Raises the chance of disrupting the working Flask app before the replacement is validated.

### Move Flask To `legacy-flask/` Before Scaffolding

Pros:

- Gives the repository root to the new app.
- Makes the desired final state visible early.

Cons:

- Creates a large file-move diff before the new app exists.
- Adds risk to an otherwise documentation/scaffold phase.
- Makes side-by-side validation slightly more awkward.

## Future Cleanup Direction

After the Next.js app is validated, choose one of these cleanup paths:

1. Move Flask files into `legacy-flask/` for a short archival period.
2. Remove Flask files entirely once the replacement is accepted.

That decision belongs to the later retire/archive step, not this layout step.

## Testing Impact

No automated tests are expected for this step because it only records a layout decision. Tests begin when implementation behavior is introduced under `web/`.

## Step 3 Validation

This step is complete when:

- The layout decision is documented.
- No application files have been moved.
- No Next.js scaffold has been created yet.
- The branch is committed, pushed, merged, cleaned up, and `master` is clean.
