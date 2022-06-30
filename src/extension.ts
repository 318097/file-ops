import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import File from './File';
import {
  getDefaultFileTagObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown,
  parseTagData,
  parseGroupData,
  cleanFilePath,
  openFile,
  getCurrentFileInfo,
  openDirectoryFile,
  isFalsy,
  getModuleSettings,
  parseCurrentFilePath,
  writeDataToClipboard,
  readDataFromClipboard,
  getBasePath
} from './helpers';
import { FileTagProvider } from './FileTagProvider';
import config from './config';

const fsPromises = require('fs').promises;

export function activate(context: vscode.ExtensionContext) {

  const fileTagProvider = new FileTagProvider(getWorkspacePath());

  vscode.window.registerTreeDataProvider('file-tag-tree', fileTagProvider);

  vscode.commands.registerCommand('file-tag-tree.refreshData', () =>
    fileTagProvider.refresh()
  );

  const createTag = vscode.commands.registerCommand(
    "file-tag.createTag",
    async () => {
      try {
        const file = new File();
        const filePath = getCurrentFilePath();

        const doesTagExist = file.tags[filePath];

        const name = await vscode.window.showInputBox({
          placeHolder: doesTagExist ? `Tag exists. Enter new tag name to override` : `Enter tag name:`,
        });

        if (!name) return;

        file.tags[filePath] = getDefaultFileTagObj(name);
        file.save();
        vscode.window.showInformationMessage(`File Tag: Tag ${doesTagExist ? 'updated' : 'created'}.`);
        fileTagProvider.refresh();
      } catch (err) {
        console.log(err);
      }
    }
  );

  const listTags = vscode.commands.registerCommand(
    "file-tag.listTags",
    async () => {
      try {
        const file = new File();
        const { entries, list } = parseTagData(file.tags);

        const selectedIdx = await showDropdown(list, {
          placeHolder: "Select tag to open",
        });
        if (isFalsy(selectedIdx)) return;
        // @ts-ignore
        const [relativePath, { name }] = entries[selectedIdx];

        openFile(relativePath, name);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const currentTag = vscode.commands.registerCommand(
    "file-tag.currentTag",
    async () => {
      try {
        const file = new File();
        const filePath = getCurrentFilePath();
        const { name } = file.tags[filePath] || {};
        vscode.window.showInformationMessage(
          `File Tag: ${name || "No file tag."}`
        );
      } catch (err) {
        console.log(err);
      }
    }
  );

  const openTag = vscode.commands.registerCommand(
    "file-tag.openTag",
    async (relativePath, tagName) => {
      try {
        if (!relativePath) return;
        openFile(relativePath, tagName);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const deleteTagHandler = async (treeItem: any) => {
    try {
      const file = new File();
      const { entries, list } = parseTagData(file.tags);
      if (treeItem) {
        const path = treeItem.filePath;
        delete file.tags[path];
      } else {
        const selectedIdx = await showDropdown(list, {
          canPickMany: true,
          placeHolder: "Select tag(s) to delete:",
        });

        if (isFalsy(selectedIdx)) return;

        entries.forEach(([path], idx) => {
          // @ts-ignore
          selectedIdx.includes(idx) ? delete file.tags[path] : null;
        }
        );
      }

      file.save();
      fileTagProvider.refresh();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteTags = vscode.commands.registerCommand(
    "file-tag.deleteTags",
    deleteTagHandler
  );


  const deleteTagsTree = vscode.commands.registerCommand(
    "file-tag-tree.deleteTags",
    deleteTagHandler
  );

  const renameTagHandler = async (treeItem: any) => {
    try {
      const file = new File();
      let relativePath, newTagName;

      if (treeItem) {
        relativePath = treeItem.filePath;
      } else {
        const { entries, list } = parseTagData(file.tags);

        const selectedIdx = await showDropdown(list, {
          placeHolder: "Select tag to rename:",
        });

        if (isFalsy(selectedIdx)) return;
        // @ts-ignore
        [relativePath] = entries[selectedIdx];
      }

      newTagName = await vscode.window.showInputBox({
        placeHolder: "Enter new tag name:",
      });

      if (!newTagName) return;

      file.tags[relativePath] = {
        ...file.tags[relativePath],
        name: newTagName,
        updatedAt: new Date().getTime(),
      };
      file.save();

      fileTagProvider.refresh();
      vscode.window.showInformationMessage(`File Tag: Tag renamed.`);
    } catch (err) {
      console.log(err);
    }
  };

  const renameTag = vscode.commands.registerCommand(
    "file-tag.renameTag", renameTagHandler
  );

  const renameTagTree = vscode.commands.registerCommand(
    "file-tag-tree.renameTag", renameTagHandler
  );

  const quickSwitch = vscode.commands.registerCommand('file-switch.quickSwitch', async () => {
    try {
      const pairRegex = /^(\.[a-z]+)(,(\.[a-z]+))*\/(\.[a-z]+)(,(\.[a-z]+))*$/;

      const userDefinedSettings = vscode.workspace.getConfiguration('fileOps');
      const USER_DEFINED_PAIRS: any = userDefinedSettings.get('fileSwitch.quickSwitchPairs');
      const USER_DEFINED_EXCLUDE_FILES: any = userDefinedSettings.get('fileSwitch.excludeFiles');

      const PAIRS = [...USER_DEFINED_PAIRS, ...config.QUICK_SWITCH_PAIRS];
      const {
        directoryPath, extensionName, currentFileName } = getCurrentFileInfo();

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

        if (pair1.includes(extensionName)) activePair = pair2;
        else if (pair2.includes(extensionName)) activePair = pair1;
        else continue;

        const fileList = await fsPromises.readdir(directoryPath);

        const matchedFiles = fileList.filter((fileName: any) => {
          if (fileName === currentFileName ||
            USER_DEFINED_EXCLUDE_FILES.includes(fileName))
            return false;

          let match = false;
          for (let i = 0; i < activePair.length; i++) {
            const ext = activePair[i];
            if (fileName.endsWith(ext)) {
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
            placeHolder: "Matched files:",
          });

          if (fileName)
            openDirectoryFile(directoryPath, fileName);

          break;
        }
      }
    } catch (err) {
      console.log(err);
    }
  });

  const relatedFiles = vscode.commands.registerCommand('file-switch.relatedFiles', async () => {
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
        placeHolder: "Files in current directory:",
      });

      if (!fileName) return;

      openDirectoryFile(directoryPath, fileName);
    } catch (err) {
      console.log(err);
    }
  });

  const copyFilePath = vscode.commands.registerTextEditorCommand(
    'file-import.copyFilePath',
    async () => {
      try {
        const filePath = getCurrentFilePath(false);
        writeDataToClipboard(filePath);
      } catch (err) {
        console.log(err);
      }
    });

  const pasteFilePath = vscode.commands.registerTextEditorCommand(
    'file-import.pasteFilePath',
    async (editor) => {
      try {
        const targetFilePath = await readDataFromClipboard();

        if (!fs.existsSync(targetFilePath))
          return vscode.window.showErrorMessage(
            `File Import: Invalid File Path`
          );

        const sourceFileObj = parseCurrentFilePath();
        const userSettings = getModuleSettings('file-import');

        const relativePath = path.relative(sourceFileObj.dir, targetFilePath);

        // src & target file is same
        if (sourceFileObj.base === relativePath)
          return vscode.window.showErrorMessage(
            `File Import: src & target file cannot be same`
          );

        const targetFileObj = path.parse(targetFilePath);

        // No need for file extension when source & target have same extension
        const addFileExtension = userSettings.addFileExtension && sourceFileObj.ext !== targetFileObj.ext;

        let output = getBasePath({ filePath: relativePath, targetFileObj, addFileExtension });

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
    });

  // const saveGroup = vscode.commands.registerCommand(
  //   "file-group.saveGroup",
  //   async () => {
  //     try {
  //       const file = new File();
  //       const name = await vscode.window.showInputBox({
  //         placeHolder: "Group name",
  //       });

  //       const openFilePaths = vscode.workspace.textDocuments;
  //       console.log("window.activeTextEditor", vscode.window.activeTextEditor);
  //       console.log("window.visibleTextEditors", vscode.window.visibleTextEditors);

  //       const filteredFilePaths = openFilePaths
  //         .map((file) => {
  //           console.log(file, file.fileName, cleanFilePath(file.fileName));
  //           return cleanFilePath(file.fileName);
  //         })
  //         .filter((path) => !path.endsWith(".git"));

  //       file.addGroup({
  //         name: name || "Untitled group",
  //         files: filteredFilePaths,
  //       });

  //       vscode.window.showInformationMessage(
  //         `File Group: Group created`
  //       );
  //     } catch (err) {
  //       console.log("Error: ", err);
  //     }
  //   }
  // );

  // const loadGroup = vscode.commands.registerCommand(
  //   "file-group.loadGroup",
  //   async () => {
  //     try {

  //       const file = new File();

  //       const { list } = parseGroupData(file.groups);
  //       const selectedIdx = await showDropdown(list, {
  //         placeHolder: "Select group to rename:",
  //       });
  //       if (isFalsy(selectedIdx)) return;

  //       await vscode.commands.executeCommand("workbench.action.closeAllEditors");

  //       const fileList = file.groups[selectedIdx]['files'];

  //       fileList.forEach(async (file: any) => {
  //         const handler = await vscode.workspace.openTextDocument(openFile(file));
  //         vscode.window.showTextDocument(handler, {
  //           preserveFocus: false,
  //           preview: false,
  //         });
  //       });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   });

  context.subscriptions.push(
    createTag,
    listTags,
    currentTag,
    deleteTags,
    renameTag,
    renameTagTree,
    deleteTagsTree,
    openTag,
    quickSwitch,
    relatedFiles,
    copyFilePath,
    pasteFilePath
    // saveGroup,
    // loadGroup,
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
