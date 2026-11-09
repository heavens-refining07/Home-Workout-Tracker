# FitTracker Mono

A black-and-white home workout tracker for personal use. Choose a routine or create a workout from 12 exercises. Save completed sets, check the weekly dashboard and history, and export or import a JSON backup.

The Mono edition uses browser storage. Workouts belong to the browser profile and site address where you saved them. Export a backup before clearing site data or moving to another device or URL. Import merges backups by workout ID. The original app's accounts and database records require a separate migration.

## Run locally

From the repository root, run:

```sh
python3 -m http.server 8080 --directory mono
```

Open <http://localhost:8080>. Use `py` in place of `python3` on Windows if needed.

## Deploy on Render

Create a **Static Site** and select this GitHub repository.

| Setting | Value |
| --- | --- |
| Branch | `mono-lite` |
| Root directory | Leave blank |
| Build command | `echo "FitTracker Mono is ready"` |
| Publish directory | `mono` |
| Environment variable | `SKIP_INSTALL_DEPS=true` |

The branch also contains a Render Blueprint for this static site. There are no runtime dependencies, secrets, or database setup. Render static sites count against workspace usage limits.

Exercise instructions and demo credits are listed in [EXERCISE-SOURCES.md](../EXERCISE-SOURCES.md).
