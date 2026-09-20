# Input System

`InputManager` is the single input coordinator for keyboard, touch, and the
standard Gamepad API. Device modules emit named PocketArc actions; only the
emulator adapter/frame translates gameplay actions to mGBA input indices.
Components never send EmulatorJS key codes.

## Logical inputs

Gameplay actions are Up, Down, Left, Right, A, B, L, R, Start, and Select.
Application commands are Quick Save, Quick Load, Fast Forward, Pause,
Fullscreen, and Menu. Pressed state is reference-counted by source, so releasing
one finger or device cannot release the same action while another source still
holds it.

Keyboard mappings use `KeyboardEvent.code` so physical placement is stable.
Standard gamepads use buttons 0/1, 4/5, 8/9, and 12–15 by default. Both mappings
are editable on Settings and persist in the `inputSettings` record. Gamepad
polling uses `requestAnimationFrame` only while Play or Settings is mounted.

Touch controls use pointer capture and a unique pointer source for reliable
multi-touch. The D-pad, A, B, L, R, Start, and Select positions are stored as
normalized `x`/`y` coordinates with per-control scale. Portrait and landscape
layouts are independent, validated on load, and rendered through the same
safe-area clamping rules used by the Control Editor preview. This keeps layouts
portable between screen sizes and prevents a control from becoming unreachable.

The editor does not start EmulatorJS. It provides Default, Compact, and Large
presets, pointer dragging, keyboard arrow adjustment, per-control resizing,
opacity preview, and a full layout reset. Portrait places controls below the
3:2 display; short landscape viewports overlay controls using browser safe-area
insets. Gameplay targets remain at least approximately 44px.

Blur, hidden-document, route cleanup, and controller disconnect all release
held actions. Cleanup also cancels the gamepad animation frame.
