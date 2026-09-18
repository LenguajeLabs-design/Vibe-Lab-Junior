---
name: Radix dialog focus restoration
description: Reliable Escape dismissal and focus return for controlled Radix dialogs.
---

Keep `Dialog.Root` mounted while toggling its `open` state, and render the opener through `Dialog.Trigger asChild` within that same root.

**Why:** Conditionally mounting the entire root caused Escape to close the panel but return focus to the page body. Native listeners, delayed focus, and synchronous unmount attempts were all overwritten by dialog cleanup.

**How to apply:** When a dialog must return focus to an external action, place the trigger and portal content under one persistent controlled root rather than conditionally rendering the root only while open.