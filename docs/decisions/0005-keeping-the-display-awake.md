# 0005: Keeping the display awake

- **Status:** Accepted
- **Date:** 2026-11-24 (updated 2026-11-28, when it was built)

## Decision

Keeping the screen awake is the most important browser capability for an MFD. Because the display runs on plain HTTP (0004), the Wake Lock API is usually unavailable, so MFDIY uses a fallback chain:

1. **"Tap to engage" screen.** The display starts on a themed start screen. The user's tap provides the gesture browsers require to start keep-awake. It doesn't enter fullscreen; that's the profile's Fullscreen button (0009).
   - It's shown in place of the MFD, in its theme and shape, with the profile's name (`EngageScreen` in `@mfdiy/instruments`). It answers to a whole tap (`click`), not a touch (0010): browsers only count a finished tap as the gesture, and the finger mustn't press the widget under it once the screen is gone.
   - Any tap or key press in the app engages keep-awake, so a profile opened from the home page skips the screen; one opened directly (the QR code, a bookmark, a refresh) shows it. Once engaged, it stays on for the rest of the visit, editor included. _On trial._
2. **Wake Lock API when available.** Use `navigator.wakeLock` when the page is a secure context.
3. **Muted video fallback.** Otherwise, play a tiny, silent, inline video on loop (the NoSleep.js technique), which keeps phones and tablets awake without a secure context. Chrome keeps the screen on for a muted video only while more than 75% of it is in view and it covers more than 20% of the viewport (`video_wake_lock.cc`), so the video covers the whole viewport, transparent, behind the page and untouchable. NoSleep.js instead plays an unmuted video with a silent sound track, which Chrome accepts at any size, but which can pause the player's music on iOS; MFDIY keeps it muted unless testing on devices shows it has to.
4. **Recover automatically.** Re-acquire the lock or restart the video when the page becomes visible again (`visibilitychange`), since browsers release both when the tab is hidden.
5. **Device setup guides** for dedicated screens, which are the most reliable option:
   - **Raspberry Pi:** Chromium in kiosk mode with `--unsafely-treat-insecure-origin-as-secure=http://mfdiy.local`, which makes the page a secure context so Wake Lock and PWA features work; and screen blanking turned off in `raspi-config`.
   - **Android:** "Stay awake while charging" (developer options), or the `chrome://flags` "Insecure origins treated as secure" setting, or a kiosk browser such as Fully Kiosk.
   - **iOS:** Auto-Lock set to Never, optionally Guided Access to lock the device to the MFD.

## Why

Wake lock alone doesn't justify building HTTPS infrastructure (see "Revisit when" in 0004). The video fallback and device settings cover it for every platform, and a dedicated pit screen should be configured at device level anyway.

## Consequences

- The display shows which keep-awake method is active, so users can tell when to follow a setup guide: a small sun in the profile's header (a warning sign where the browser refused both), behind a hint (Toggletip) naming the method and, for the video or nothing, pointing to the device's settings. It's hidden until engaged, and in fullscreen with the rest of the header. The guides themselves aren't written yet.
- The muted video costs a little battery; acceptable since pit screens are usually plugged in.
- iOS has changed inline video behaviour in the past. The fallback must be tested on current iOS and Android versions, and re-tested on major OS releases.
- If HTTPS is adopted later (0004), step 2 covers most users and the video fallback becomes a safety net.
