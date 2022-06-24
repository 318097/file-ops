# File Ops

> Import file path, tag/alias files & quick switch

## Overview

**1. File Import** - Paste relative path to other files

**2. File Tag** - **Tag/Alias/Bookmark** files

**3. Quick Switch** - Switch between file pairs. ex. switch between **.css** & **.js** from same folder using **`Ctrl/Cmd+E`**

**4. Related Files (same folder)** - View files from the **current** directory & **switch**

[Watch Demo](https://youtu.be/ze9KtYe3f48)

## Features

### File Import

1. `File Import: Copy Path`: Copy absolute path from command menu or right click
2. `File Import: Paste Path`: Paste the relative path using command menu or right click

### File Tag

- Create file aliases. open & view files using the aliases
  1. Open, View, Edit, Delete file tags from the tree view, or
  2. Perform operations using the commands. Search for `File Tag` to get all commands

> Note: All extension data is stored in an auto generated file called `.file-tag`  
> Please do not make any changes to that file. If required, add it to `.gitignore`

![File Tag Demo](assets/file-tag-demo.gif)

### Quick Switch

Quickly switch between file pairs. ex., Switch between `.css` & `.js` files from the same folder.

_Define custom pairs using the exposed setting (fileOps.fileSwitch.excludeFiles)_

**Note**: By default, `index.js` file is excluded so it wont be considered for switching

![Quick Switch Demo](assets/quick-switch-demo.gif)

### Related Files

Show all files (except active file) from current folder

![Related Files Demo](assets/related-files-demo.gif)

---

## Commands

Run commands by opening Command Palette `Ctrl+Shift+P` / `Cmd+Shift+P`

![File Tag Commands](assets/file-tag-commands.png)

![File Switch Commands](assets/file-switch-commands.png)

## Shortcuts

| Feature                 | Shortcut                       | Description                                                                           |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| Quick Switch            | `Cmd+E` / `Ctrl+E`             | Switch between file pairs. ex., switch between `.css` & `.js` file using the shortcut |
| Related Files           | `Cmd+Shift+E` / `Ctrl+Shift+E` | Show all files (except active file) from current folder                               |
| File Import: Copy Path  | `Cmd+Shift+C` / `Ctrl+Shift+C` | Copy absolute path of active file                                                     |
| File Import: Paste Path | `Cmd+Shift+V` / `Ctrl+Shift+V` | Paste relative path to the `copied file`                                              |

## Settings

| Setting                             | Default value                                          | Description                                                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fileOps.fileSwitch.quickSwitchPairs | `[".js,.ts/.css,.sass,.scss", ".js/.js", ".json/.md"]` | Define file pairs to enable switch between them.ex., `[".json/.md"]`) will enable switching between `.json` & `.md` using `Quick Switch` shortcut. Accepted regex for a pair: `/^(\.[a-z]+)(,(\.[a-z]+))*\/(\.[a-z]+)(,(\.[a-z]+))*$/` |
| fileOps.fileSwitch.excludeFiles     | `["index.js"]`                                         | File names to be excluded from quick switch                                                                                                                                                                                            |
| fileOps.fileImport.addQuotes        | `true`                                                 | Wrap the relative path in double quotes                                                                                                                                                                                                |
| fileOps.fileImport.addFileExtension | `true`                                                 | Retain the file extension of relative path                                                                                                                                                                                             |

---

## Other projects
