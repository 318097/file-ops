import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import File from './File';
import {
  createBookmarkObj,
  getWorkspacePath,
  getCurrentFilePath,
  showDropdown,
  parseBookmarks,
  showPicker,
  cleanFilePath,
  openFile,
  getCurrentFileInfo,
  openDirectoryFile,
  isFalsy,
  getModuleSettings,
  parseCurrentFilePath,
  writeDataToClipboard,
  readDataFromClipboard,
  getBasePath,
  switchCase,
  updateSelectedText,
  getFileShortName
} from './helpers';
import { FileBookmarksProvider } from './FileBookmarksProvider';
// import { FileClipboardProvider } from './FileClipboardProvider';
import config from './config';

const _ = require('lodash');
const fsPromises = require('fs').promises;

export function activate(context: vscode.ExtensionContext) {
  const fileBookmarksProvider = new FileBookmarksProvider(getWorkspacePath());
  vscode.window.registerTreeDataProvider('bookmarksTree', fileBookmarksProvider);
  vscode.commands.registerCommand('bookmarksTree.refreshData', () =>
    fileBookmarksProvider.refresh()
  );

  // const fileClipboardProvider = new FileClipboardProvider(getWorkspacePath());
  // vscode.window.registerTreeDataProvider('file-clipboard-tree', fileClipboardProvider);

  const createBookmark = async () => {
    try {
      const file = new File();
      const filePath = getCurrentFilePath();

      const doesTagExist = file.tags[filePath];

      let name = await vscode.window.showInputBox({
        prompt: doesTagExist ? `Bookmark exists. Enter new name to override` : `Enter bookmark name`,
      });

      if (!name && !doesTagExist)
        name = getFileShortName();

      file.tags[filePath] = createBookmarkObj(name);
      file.save();
      fileBookmarksProvider.refresh();
    } catch (err) {
      console.log(err);
    }
  };

  const showBookmarks = async () => {
    try {
      const file = new File();
      const { entries, list } = parseBookmarks(file.tags);

      const selectedIdx = await showDropdown(list, {
        placeHolder: "Select bookmark",
      });
      if (isFalsy(selectedIdx)) return;
      // @ts-ignore
      const [relativePath, { name }] = entries[selectedIdx];

      openFile(relativePath);
    } catch (err) {
      console.log(err);
    }
  };

  const showCurrentBookmark = async () => {
    try {
      const file = new File();
      const filePath = getCurrentFilePath();
      const { name } = file.tags[filePath] || {};
      vscode.window.showInformationMessage(
        `FileOps: ${name || "No bookmark for this file."}`
      );
    } catch (err) {
      console.log(err);
    }
  };

  const openBookmark = async (relativePath) => {
    try {
      if (!relativePath) return;
      openFile(relativePath);
    } catch (err) {
      console.log(err);
    }
  };

  // vscode.commands.registerCommand(
  //   "file-ops.copyToClipboard",
  //   async (clipboardItem) => {
  //     try {
  //       writeDataToClipboard(clipboardItem);

  //       vscode.commands.executeCommand('workbench.action.findInFiles', { query: clipboardItem, triggerSearch: true });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   }
  // );

  const deleteBookmarkHandler = async (treeItem: any) => {
    try {
      const file = new File();
      const { entries, list } = parseBookmarks(file.tags);
      if (treeItem) {
        const path = treeItem.filePath;
        delete file.tags[path];
      } else {
        const selectedIdx = await showDropdown(list, {
          canPickMany: true,
          placeHolder: "Select bookmark(s) to delete",
        });

        if (isFalsy(selectedIdx)) return;

        entries.forEach(([path], idx) => {
          // @ts-ignore
          selectedIdx.includes(idx) ? delete file.tags[path] : null;
        }
        );
      }

      file.save();
      fileBookmarksProvider.refresh();
    } catch (err) {
      console.log(err);
    }
  };

  const renameBookmarkHandler = async (treeItem: any) => {
    try {
      const file = new File();
      let relativePath, newTagName;

      if (treeItem) {
        relativePath = treeItem.filePath;
      } else {
        const { entries, list } = parseBookmarks(file.tags);

        const selectedIdx = await showDropdown(list, {
          placeHolder: "Select bookmark to rename",
        });

        if (isFalsy(selectedIdx)) return;
        // @ts-ignore
        [relativePath] = entries[selectedIdx];
      }

      newTagName = await vscode.window.showInputBox({
        placeHolder: "Enter new bookmark name",
      });

      if (!newTagName) return;

      file.tags[relativePath] = {
        ...file.tags[relativePath],
        name: newTagName,
        updatedAt: new Date().getTime(),
      };

      file.save();
      fileBookmarksProvider.refresh();
    } catch (err) {
      console.log(err);
    }
  };

  const quickSwitch = async () => {
    try {
      const pairRegex = /^([a-zA-Z._-]+)(,([a-zA-Z._-]+))*\/([a-zA-Z._-]+)(,([a-zA-Z._-]+))*$/;

      const userDefinedSettings = vscode.workspace.getConfiguration('fileOps');
      const USER_DEFINED_PAIRS: any = userDefinedSettings.get('fileSwitch.quickSwitchPairs');
      const USER_DEFINED_EXCLUDE_FILES: any = userDefinedSettings.get('fileSwitch.excludeFiles');

      const PAIRS = [...USER_DEFINED_PAIRS, ...config.QUICK_SWITCH_PAIRS];
      const {
        directoryPath, currentFileName } = getCurrentFileInfo();

      for (const pair of PAIRS) {
        const isValidPair = pairRegex.test(pair);

        if (!isValidPair) {
          vscode.window.showErrorMessage(`Invalid configuration: ${pair}`);
          continue;
        }

        const split = pair.split('/');
        const pair1 = split[0].split(',');
        const pair2 = split[1].split(',');

        let activePair: any;

        if (pair1.some(pair => currentFileName.endsWith(pair))) activePair = pair2;
        else if (pair2.some(pair => currentFileName.endsWith(pair))) activePair = pair1;
        else continue;

        const currentDirFiles = await fsPromises.readdir(directoryPath);

        const matchedFiles = currentDirFiles.filter((fileName: any) => {
          if (fileName === currentFileName ||
            USER_DEFINED_EXCLUDE_FILES.includes(fileName))
            return false;

          let match = false;
          for (let i = 0; i < activePair.length; i++) {
            if (fileName.endsWith(activePair[i])) {
              match = true;
              break;
            }
          }
          return match;
        });

        if (matchedFiles.length === 1) {
          openDirectoryFile(directoryPath, matchedFiles[0]);
          break;
        } else if (matchedFiles.length > 1) {
          const fileName = await vscode.window.showQuickPick(matchedFiles, {
            placeHolder: "Matched files",
          });

          if (fileName)
            openDirectoryFile(directoryPath, fileName);

          break;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const showOtherFilesInDirectory = async () => {
    try {
      const { currentFileName,
        directoryPath } = getCurrentFileInfo();

      const fileList = await fsPromises.readdir(directoryPath);

      const filesToDisplay: any = [];

      fileList.forEach((fileName: any) => {
        const absPath = path.resolve(directoryPath, fileName);
        const stats = fs.statSync(absPath);
        if (fileName !== currentFileName && !stats.isDirectory()) {
          filesToDisplay.push(fileName);
        };
      });

      if (!filesToDisplay.length) return;

      const fileName = await vscode.window.showQuickPick(filesToDisplay, {
        placeHolder: "Other files in current directory",
      });

      if (!fileName) return;

      openDirectoryFile(directoryPath, fileName);
    } catch (err) {
      console.log(err);
    }
  };

  const copyFileName = async () => {
    try {
      const { currentFileName } = getCurrentFileInfo();
      writeDataToClipboard(currentFileName);
    } catch (err) {
      console.log(err);
    }
  };

  const copyFilePath = async () => {
    try {
      const filePath = getCurrentFilePath(false);
      writeDataToClipboard(filePath);
    } catch (err) {
      console.log(err);
    }
  };

  const pasteFilePath = async (editor) => {
    try {
      const targetFilePath = await readDataFromClipboard();

      if (!fs.existsSync(targetFilePath))
        return vscode.window.showErrorMessage(
          `FileOps: Invalid File Path`
        );

      const sourceFileObj = parseCurrentFilePath();
      const userSettings = getModuleSettings('file-import');

      const relativePath = path.relative(sourceFileObj.dir, targetFilePath);

      // src & target file is same
      if (sourceFileObj.base === relativePath)
        return vscode.window.showErrorMessage(
          `FileOps: 'src' & 'target' file cannot be same`
        );

      const targetFileObj = path.parse(targetFilePath);

      // No need for file extension when source & target have same extension
      const addFileExtension = userSettings.addFileExtension && sourceFileObj.ext !== targetFileObj.ext;

      let output = getBasePath({ filePath: relativePath, targetFileObj, addFileExtension });

      if (process.platform === 'win32')
        output = output.replaceAll('\\', '/'); // convert all `\` to `/` for windows os

      if (!output.startsWith("../")) {
        output = `./${output}`;
      }

      if (userSettings.addQuotes) {
        output = `"${output}"`;
      }

      // insert `output` at current cursor position
      editor.edit((editBuilder) =>
        editBuilder.replace(editor.selection, output)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const saveGroup = async () => {
    try {
      const file = new File();
      const name = await vscode.window.showInputBox({
        placeHolder: "Enter Group Name",
      });

      const openFilePaths = vscode.workspace.textDocuments;

      // console.log({ visibleTextEditors: vscode.window.visibleTextEditors, activeTextEditor: vscode.window.activeTextEditor, textDocuments: vscode.workspace.textDocuments });
      const filteredFilePaths = openFilePaths
        .map((file) => {
          console.log(file, file.fileName, cleanFilePath(file.fileName));
          return cleanFilePath(file.fileName);
        })
        .filter((path) => !path.endsWith(".git"));

      file.addGroup({
        name: name || "Untitled group",
        files: filteredFilePaths,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const loadGroup = async () => {
    try {
      const file = new File();
      const selectedIdx = await showPicker({ data: _.map(file.groups, 'name'), placeHolder: "Select file group to load" });

      if (isFalsy(selectedIdx)) return;

      // await vscode.commands.executeCommand("workbench.action.closeAllEditors");

      const fileList = file.groups[Number(selectedIdx)]['files'];

      fileList.forEach(async (file: any) => {
        openFile(file);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const toggleCase = async () => {
    try {
      const CASES = [
        { name: 'UPPERCASE', value: "UPPERCASE" },
        { name: 'lowercase', value: "LOWERCASE" },
        { name: 'kebab-case', value: "KEBABCASE" },
        { name: 'snake_case', value: "SNAKECASE" },
        { name: 'camelCase', value: "CAMELCASE" },
        { name: 'Capitalize', value: "CAPITALIZE" },
        { name: 'Trim & Replace spaces with underscore', value: "TRIM_AND_REPLACE_WITH_UNDERSCORE" },
        { name: 'Remove spaces', value: "REMOVE_SPACES" },
      ];

      const selectedIdx = await showPicker({ data: _.map(CASES, 'name'), placeHolder: "Select case to convert to" });

      updateSelectedText(text => switchCase(text, CASES[Number(selectedIdx)]['value']));
    } catch (err) {
      console.log(err);
    }
  };

  const stringify = async () => {
    try {
      updateSelectedText(text => {
        let result = text;
        try {
          const parsed = eval(`(${text})`);
          // console.log('text::-', text);
          // console.log('parsed::-', parsed, typeof parsed);
          result = JSON.stringify(parsed);
        } catch (err) {
          vscode.window.showErrorMessage(`FileOps: Selected range could not be stringified.`);
        }
        return result;
      });
    } catch (err) {
      console.log(err);
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "bookmarks.createBookmark",
      createBookmark
    ),
    vscode.commands.registerCommand(
      "bookmarks.showBookmarks", showBookmarks),
    vscode.commands.registerCommand(
      "bookmarks.showCurrentBookmark", showCurrentBookmark),
    vscode.commands.registerCommand(
      "bookmarks.openBookmark", openBookmark),
    vscode.commands.registerCommand(
      "bookmarks.deleteBookmarks",
      deleteBookmarkHandler
    ),
    vscode.commands.registerCommand(
      "bookmarksTree.deleteBookmarks",
      deleteBookmarkHandler
    ),
    vscode.commands.registerCommand(
      "bookmarks.renameBookmark", renameBookmarkHandler
    ),
    vscode.commands.registerCommand(
      "bookmarksTree.renameBookmark", renameBookmarkHandler
    ),
    vscode.commands.registerCommand('switch.quickSwitch', quickSwitch),
    vscode.commands.registerCommand('switch.showOtherFilesInDirectory', showOtherFilesInDirectory),
    vscode.commands.registerTextEditorCommand(
      'fileOps.copyCurrentFileName',
      copyFileName),
    vscode.commands.registerTextEditorCommand(
      'import.copyFilePath',
      copyFilePath),
    vscode.commands.registerTextEditorCommand(
      'import.pasteRelativeFilePath',
      pasteFilePath),
    vscode.commands.registerCommand(
      "group.saveFileGroup",
      saveGroup
    ),
    vscode.commands.registerCommand(
      "group.loadGroups",
      loadGroup),
    vscode.commands.registerCommand(
      "fileOps.switchTextCasing",
      toggleCase
    ),
    vscode.commands.registerCommand(
      "fileOps.stringify",
      stringify
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }