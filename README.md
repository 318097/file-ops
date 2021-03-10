# File Ops README

## Features

1. FILE TAG
   - Command: Create, Edit, Delete (multiple), Open
   - Tree: View (all), Edit, Delete, Open
2. FILE SWITCH
   - Quick Switch: Quickly switch between `.css` & `.js` files. (Extend the functionality by providing custom pairs)
   - Related Files: View all the files from the current directory

## Keyboard Shortcuts

Quick Switch - `Command+D` / `Control+D`  
Related Files - `Command+Shift+D` / `Control+Shift+D`

## Todo

- [ ] Rename directly from tree item
- [ ] Swap edit and delete icon
- [x] Key bindings for commands

## Extension Settings

This extension contributes the following settings:

- `fileOps.fileSwitch.quickSwitchPairs`: Array of **quick switch** pairs. ex., `[".js,.ts/.css,.scss"]`. Accepted Regex: `(\.[a-z]+)(,(\.[a-z]+))*\/(\.[a-z]+)(,(\.[a-z]+))*`

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
