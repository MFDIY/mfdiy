# 0025: Vocabulary

- **Status:** Accepted
- **Date:** 2026-11-27

## Context

Help text called the same thing a screen, a display and a profile, and the landing page said "layout" and "screens" where the app says "profile" and "pages". Synonyms make people wonder whether they mean different things. This glossary gives each thing one word, for everything a player reads: the app, the builder, the bridge's output and the landing page.

## Decision

| Thing                                                                            | Word                                                                   | Not                                      |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| What a player builds and saves                                                   | **profile**                                                            | layout, document (a code-only word), MFD |
| What a profile shows while flying                                                | **MFD** ("Build your MFD", "Show")                                     | display                                  |
| One set of widgets, switched between like an MFD's pages                         | **page**                                                               | screen, canvas                           |
| The surface something is shown on, which has a shape (16:10)                     | **screen** ("Use this screen", "On a screen of another shape")         | display                                  |
| The phone, tablet or PC a player uses, connects and syncs                        | **device** ("changed on another device", "any device on your network") |                                          |
| A control placed on a page                                                       | **widget**                                                             |                                          |
| A grid of widgets placed once that shows on every page, in the same place (0026) | **shared subgrid**                                                     | bar, strip, overlay                      |
| The program on the gaming PC                                                     | **bridge**                                                             |                                          |
| Stopping a device's screen from turning off (0005)                               | **keep the screen on** ("Screen stays on")                             | keep awake, wake lock, no sleep          |
| The tap that starts it                                                           | **tap to engage**                                                      | start, unlock                            |

- **Page** is the MFD term, kept even though people also know web pages. Where the browser page is meant, say something else ("Reload and try again").
- **Screen** and **device** are different things: a device is what you hold and connect; its screen is the part with a shape.
- **Library** is a code word for the saved profiles; the interface says "profiles" ("There's no room for more profiles").
- The game and its simulator are told apart in words, not in brackets: "Connected to Star Citizen", "Simulating Star Citizen".
- "Multi-function display" is fine where it spells out what MFD stands for.

## Why

- One word per thing lets people trust that a different word means a different thing.

## Consequences

- CLAUDE.md asks every session to use these words in anything a player reads, and to add new terms here.
- Code may use other names (`MfdDocument`, `useWidgetLibrary`, `MfdRenderer`); the interface doesn't.
