# 0009: Showing and editing a profile

- **Status:** Accepted
- **Date:** 2026-11-24 (rewritten 2026-11-27; was "In-place editing on the display")

## Decision

- **One address per profile:** `/<id>`, with the page shown in `?page=`. Opening a profile shows it, working, with live data. Editing is a mode of the same address, not an address of its own, so a refresh or a bookmark shows the profile.
- **One header strip throughout the app:** on the home page and on a profile, the same one-row strip over a hairline as the editor's header (0008). On a profile it holds only the **logomark** on the left, which leads to the home page, and **Edit** (a pencil) and **Fullscreen** icon buttons on the right.
- **Fullscreen is the browser's own** (the Fullscreen API): it hides the header, so only the MFD is on the screen. It's left the way the device leaves fullscreen (Esc on a desktop, the back gesture on Android, the system's own control on an iPad), and the header comes back. Where a browser can't go fullscreen (Safari on an iPhone), the button isn't shown.
- **Edit opens the full editor** (the builder, 0008) on the page being shown. There's one editor: no lighter edit mode on the MFD itself. Leaving the editor shows the profile again, on the page that was being edited.
- **Leaving with unsaved changes asks first**, in a dialog: **Save** and leave, **Discard** (destructive: throws away everything since the last save) and leave, or **Keep editing**. Changes aren't kept outside the editor.
- **Nothing else is chrome.** There's no lock, no corner handle and no Edit or Fullscreen widget. Switching pages is part of the MFD and placed by its author, usually in a shared subgrid (0026); the MFD adds no tabs of its own.

## Why

- Showing and editing were two addresses reached from the home page, so tweaking a profile meant going back and forth through it. Edit on the profile itself makes that one step.
- The builder works on phones and tablets (0001), so a second, lighter editor on the MFD would only duplicate it. A mounted tablet gets the whole editor in place.
- A lock, a handle, or widgets to leave fullscreen are all ways to get stuck, or something more to learn. Every device already knows how to leave fullscreen.

## Consequences

- The `display/:id` and `builder/:id` routes merge into `/:id`. On the home page, Show and Edit become opening the profile (0019).
- Outside fullscreen the header takes a row from the screen; the MFD is fitted under it, keeping its shape or stretching (0006).
- The editor's Back returns to the profile, not the home page (0008). 0008's preview mode is replaced by leaving the editor.
- Entering the editor stays a deliberate control, never a gesture (0010), and automatic profiles never switch while editing (0012).
- A page with no way to reach it on the MFD can still be reached through the editor: Edit, pick the page, leave. The editor warns about such pages (0026).
- Tap to engage only starts keep-awake; it doesn't enter fullscreen (0005).
- The builder's leave dialog stays as it is, now also shown when leaving for the profile. The MFD always shows the saved version (0019), and the browser still warns before a refresh or closing the tab with unsaved changes.
