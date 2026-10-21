# Repository documentation rules

## README.md — permanent project overview, not a changelog

- **Never add version announcements, patch notes, update summaries, release histories, or "What's new" sections to `README.md`.**
- **Never prepend new versioned sections (`v0.x`, `Update`, `Changelog`, etc.) to the README.**
- Keep `README.md` for the game's short introduction, how to play, controls, permanent gameplay/mechanics reference, and **Assets and Credits** (with accurate artist names, source URLs, licenses and in-repository paths).
- Update a README fact only when the project itself changes and its existing guidance becomes inaccurate. Edit the relevant evergreen section in place; do not append an update announcement.
- Use **GitHub Releases**, or a separate `CHANGELOG.md` if the maintainer chooses to create one, for chronological updates.
- Preserve accurate third-party music, SFX and artwork attribution. If an asset's original creator or license is not documented, label the attribution as **unverified** rather than inventing a name or assuming a license.
- Do not change game code or assets solely to reorganize README documentation.

## Visual asset preview approval workflow

- Before adding or replacing visual assets, prepare an HTML5 Canvas before/after preview with actual repository sprites and the proposed artwork, and ask the maintainer to approve it.
- Do not commit or push unapproved visual changes. After approval, integrate and verify the PNGs, then commit/push.
- Approved artwork should use transparent-background PNGs when applicable. A graphics-only request must not change combat stats, timings, hitboxes or other gameplay logic.
- Keep before/after previews reusable when helpful.
