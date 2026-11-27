# 0019: Saving profiles

- **Status:** Accepted
- **Date:** 2026-11-25

## Decision

### A library on the bridge

- Saved MFDs live **on the bridge**, as one JSON file each in the operating system's app-data folder. Every device on the network shares them. They travel over the same WebSocket as telemetry.
- The **home page is the library**: create, rename, duplicate and delete, and **Show** or **Edit** one. Creating one asks only for its shape and opens it in the builder (0006).
- **The address decides** what a device shows or edits: `/display/<id>` and `/builder/<id>`, so a bookmark or refresh opens the same one. There is no switcher on the display.

### Explicit saving

- The builder doesn't save by itself, because it could change a profile the user didn't mean to edit. Changes stay in the builder until **Save**; displays show the saved version and follow every save live.
- **Save as new** keeps the original and continues in a copy.
- Leaving with unsaved changes asks: Save, Discard or Keep editing.

### Conflicts

- Every saved document has a **revision** that goes up with each change. A save, rename or delete based on an older revision is **refused**.
- A builder without unsaved changes follows what other devices save. One with unsaved changes **keeps them**, says what happened, and offers Save as new, Discard mine or Keep editing.

### Themes stay separate

- A profile has one or more **pages**. It can be used in any number of ships, with the theme depending on e.g. the ship's manufacturer, so **a profile never holds or points at a theme**, nor the other way around. Rules choosing a theme are separate from rules choosing a profile (0012).

### Name

A saved MFD is called a "**profile**". The word is used only in interface text; code and files say "document". Stream Deck, Helios and Thrustmaster TARGET call it a profile; Air Manager says panel, SimHub dashboard, MATRIC deck, GameGlass shard. "Layout" is wrong, as every page has its own.

## Why

- A layout is built on one device and used on another, usually a tablet, so a copy per browser would need exporting and importing, and is lost when browser data is cleared.
- With explicit saving, refusing stale saves can only cost work if the draft is thrown away, so it isn't.

## Consequences

- Editing and saving need the bridge to be running. A display that loses it keeps showing the last version.
- The bridge can now overwrite and delete files on request, and browsers let any website open a WebSocket to any address. So the bridge **only accepts WebSockets from its own pages, at a local address**. Other devices on the local network are still trusted, as for actions.
- Ids come from the bridge and are looked up in memory, so nothing a client sends becomes part of a file path.
- A file the bridge can't read (damaged, or from a newer version) is skipped and left alone.
- A new library starts with the adapter's starter documents. During development the bridge uses `apps/bridge/.data`, apart from the user's own profiles.
