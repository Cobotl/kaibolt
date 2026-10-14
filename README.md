# KaiBolt
A Cobolt client for featurephones. Designed for KaiOS.

## KaiOS notes
- Screen target: 240x320 CSS px. No hover, no touch needed.
- **D-pad**: Up/Down move focus, Enter selects. **Left/Right soft keys** do the action shown at the bottom of the screen. **Back** goes back / exits.
- Games and uploads are not part of this client (use the desktop site).
- Code is plain ES5 + CSS without `backdrop-filter`, flex `gap` or `async/await`, so it runs on Gecko 48 (KaiOS 2.5).
- Network calls use `XMLHttpRequest({ mozSystem: true })`, which needs the `systemXHR` permission in `manifest.webapp` (the app is `"type": "privileged"`).
- Only the login token is stored on the device (`localStorage`), never the password.
