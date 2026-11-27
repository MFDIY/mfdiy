# 0023: The properties panel

- **Status:** Accepted
- **Date:** 2026-11-26

## Context

0008 gives the properties panel its place: a sidebar opposite the widget library where there is room, a sheet otherwise, written once through `PanelLayout`. This record decides what's in it and how it behaves. The beta (0020) needs label, data, action and thresholds; theme overrides come later. The widgets themselves are developer art and due for a redesign; this record is about the panel.

## Decision

### Generated from the manifest

The panel is generated from the widget's manifest, never from code per widget, because nobody can predict which widgets will exist. Top to bottom:

- **Header:** the widget's type, with **Duplicate** and **Remove**, next to what they act on. This works the same in the phone sheet.
- **Type** `›`: swaps the widget for another type (see below).
- **Data:** **one row per input** the manifest declares, so a widget with several signals (a shield-face widget: front, rear, left, right) gets several rows. Each row picks its signal `›` and holds that binding's thresholds.
- **Action** `›`, for widgets that can trigger one; optional on a Light, which then is a lit button.
- **Label:** empty means the signal's or action's name, shown as the placeholder.
- **Options** the manifest declares (e.g. a Readout's decimals), each with a control that suits its type: a choice of a few becomes a `SegmentedControl`, not a text field.
- **Place:** column, row, width and height as number fields, the way to edit without dragging (0006).

Rows marked `›` open a side task that replaces the panel's contents and offers Back (0008): a searchable list of types, signals or actions, only those that suit.

### Nothing selected: the page

With nothing selected, the panel shows the page's properties: its name and grid size, later its layouts. The panel never sits empty, and the canvas doesn't change size with the selection.

### Type first, data later

A widget is added as a type, without data (0006). Its Data rows start empty, and the panel shows that it isn't connected yet; the canvas shows such a widget with its type's name and no value.

Swapping the type keeps as much as possible: the label always; each binding if the new type has an input of the same name that accepts the signal's kind; the action if the new type takes one. When a swap would drop anything, a dialog first says what would be lost and asks to confirm. One undo brings it all back.

### Thresholds belong to a binding

- Each **binding** has its own thresholds, so two widgets showing the same signal can warn at different levels, giving users the most freedom.
- A binding has a **Low** and a **High** side, each switched on separately, each with a **Warning** and a **Critical** value. Fuel uses Low, heat uses High, G-force uses both.
- Values are in the **signal's own unit** ("above 7 g"), and stored that way, so correcting a signal's declared range never changes what a threshold means. For `%` signals that's the percentage.
- The **adapter gives signals default thresholds**. They're **copied into the binding** when its signal is picked, so what the panel shows is exactly what's stored, and a later change to the defaults never changes existing profiles.
- Widgets don't work out thresholds. The code that resolves a binding passes the widget the value, its **state** (normal, warning or critical) and the thresholds themselves, so a gauge can mark them. Bar, Readout and Light colour themselves by the state.

### Editing and undo

Changes show on the canvas as they're made. A pick or a toggle is one undo step; typing in a field becomes one step when the field is left, not one per keystroke.

### On a phone

The sheet's content scrolls, so everything is reachable while it's half-open; half-open only keeps the canvas in view to stay oriented, like a map app's sheet. There is no separate set of essentials. The sheet never fully closes: it peeks with its handle and the widget's name (or "Page"), so the page's properties are always within reach and closing it never deselects (0008). The sheet's header names the widget, peeking or open, so in a sheet the panel doesn't repeat it: its first row holds only Duplicate and Remove, as buttons with an icon and text sharing the row evenly, and it scrolls away with the rest of the panel. In a sidebar they're icon buttons beside the widget's name. In a sidebar, the panel shows the widget's name (or "Page") itself. Choosing a type, data or action stacks a modal sheet on it, which starts with Back.

### Nothing jumps

The panel avoids layout shifts: a message never appears or disappears below a field. A temporary state shows inside the control instead ("Not connected" in an empty data row), a value that can't be right can't be entered (a threshold's levels limit each other, so it always warns before it turns critical), and an emptied page name comes back on leaving the field. Help text is either always shown or never. Switching a threshold side on still shows its fields below it, for now.

## Open questions

- **Hold for _n_ ms** (0010) is **left out of the beta**. On the display it would still be a single tap (the bridge holds the game's key), so it doesn't make a button do double duty, and real MFDs never ask the pilot to hold. Revisit once the bridge is connected to the game: if an allowlisted action needs a hold, add the field; if none does, drop it from 0010.

## Why

- Generating the panel from manifests keeps it working for widgets nobody has designed yet.
- Choosing the type first allows widgets that take several signals, and keeps the library to one simple list of widget types.
- Thresholds on the binding give the most freedom; working out the state outside the widget keeps that freedom from costing every new widget its own threshold logic.

## Consequences

- `BindingSchema` gains optional thresholds (`low` and `high`, each with `warning` and `critical`); signal definitions gain default thresholds; `ResolvedInput` gains `state` and the thresholds.
- Bar's `warningBelow` and `criticalBelow` options, stored as fractions of the range, are replaced by its binding's thresholds.
- `OptionSpec` gains a choice type (a `SegmentedControl`) when an option first needs one; with Light's colour option gone, none does yet.
- Light accepts number signals: off when normal, amber (`warning`) at its warning threshold, red (`critical`) at critical. On an on/off signal it lights in `primary`; its "colour when lit" option goes.
