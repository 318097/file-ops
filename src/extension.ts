import * as vscode from 'vscode';
import FileTag from './util';
import {
  getDefaultFileObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown, parseData
} from './helpers';
import { FileTagProvider } from './treeData';

const openFile = async (relativePath: string, name: string | undefined) => {
  const fd = await vscode.workspace.openTextDocument(
    getAbsolutePath(relativePath)
  );
  vscode.window.showTextDocument(fd, {
    preserveFocus: false,
    preview: false,
  });
  if (name) {
    await vscode.window.showInformationMessage(`Tag:${name}`);
  }
}

export function activate(context: vscode.ExtensionContext) {

  const taggedFilesProvider = new FileTagProvider(getWorkspacePath());
  vscode.window.registerTreeDataProvider('taggedFiles', taggedFilesProvider);


  const createTag = vscode.commands.registerCommand(
    "file-tag.createTag",
    async () => {
      try {
        const fileTag = new FileTag();
        const filePath = getCurrentFilePath();

        if (fileTag.meta[filePath]) {
          await vscode.window.showInformationMessage(
            `File Tag: Tag exists for this file. Continue to override`
          );
        }

        const name = await vscode.window.showInputBox({
          placeHolder: "Enter tag name:",
        });

        if (!name) { return; }

        fileTag.meta[filePath] = getDefaultFileObj(name);
        fileTag.save();
        vscode.window.showInformationMessage(`File Tag: Tag created.`);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const listTags = vscode.commands.registerCommand(
    "file-tag.listTags",
    async () => {
      try {
        const fileTag = new FileTag();
        const { meta, list } = parseData(fileTag);

        const [selectedIdx] = await showDropdown(list, {
          placeHolder: "Select tag to open:",
        });
        if (!selectedIdx) return;
        const [relativePath, { name }] = meta[selectedIdx];

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
        const fileTag = new FileTag();
        const filePath = getCurrentFilePath();
        const { name } = fileTag.meta[filePath] || {};
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
        openFile(relativePath, tagName);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const deleteTags = vscode.commands.registerCommand(
    "file-tag.deleteTags",
    async () => {
      try {
        const fileTag = new FileTag();
        const { meta, list } = parseData(fileTag);

        const selectedIdx = await showDropdown(list, {
          canPickMany: true,
          placeHolder: "Select tag(s) to delete:",
        });
        if (!selectedIdx.length) { return; }

        meta.forEach((path, idx) =>
          selectedIdx.includes(idx) ? delete fileTag.meta[path] : null
        );

        fileTag.save();
      } catch (err) {
        console.log(err);
      }
    }
  );

  const renameTag = vscode.commands.registerCommand(
    "file-tag.renameTag",
    async () => {
      try {
        const fileTag = new FileTag();
        const { meta, list } = parseData(fileTag);

        const [selectedIdx] = await showDropdown(list, {
          placeHolder: "Select tag to rename:",
        });

        if (!selectedIdx) return;

        const newTagName = await vscode.window.showInputBox({
          placeHolder: "Enter new tag name:",
        });

        const [relativePath] = meta[selectedIdx];

        fileTag.meta[relativePath] = {
          ...fileTag.meta[relativePath],
          name: newTagName,
          updatedAt: new Date().getTime(),
        };
        fileTag.save();

        vscode.window.showInformationMessage(`File Tag: Tag renamed.`);
      } catch (err) {
        console.log(err);
      }
    }
  );

  context.subscriptions.push(
    createTag,
    listTags,
    currentTag,
    deleteTags,
    renameTag,
    openTag
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }
