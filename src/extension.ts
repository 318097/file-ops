import * as vscode from 'vscode';
import File from './File';
import {
  getDefaultFileTagObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown,
  parseData
} from './helpers';
import { FileTagProvider } from './FileTagProvider';

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
};

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
        const { entries, list } = parseData(file.tags);

        const [selectedIdx] = await showDropdown(list, {
          placeHolder: "Select tag to open",
        });
        if (!selectedIdx) return;

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

  const deleteTags = vscode.commands.registerCommand(
    "file-tag.deleteTags",
    async (treeItem) => {
      try {
        const file = new File();
        const { entries, list } = parseData(file.tags);
        if (treeItem) {
          const path = treeItem.filePath;
          delete file.tags[path];
        } else {
          const selectedIdx = await showDropdown(list, {
            canPickMany: true,
            placeHolder: "Select tag(s) to delete:",
          });
          if (!selectedIdx.length) return;

          entries.forEach((path, idx) =>
            selectedIdx.includes(idx) ? delete file.tags[path] : null
          );
        }

        file.save();
        fileTagProvider.refresh();
      } catch (err) {
        console.log(err);
      }
    }
  );

  const renameTag = vscode.commands.registerCommand(
    "file-tag.renameTag",
    async (treeItem) => {
      try {
        const file = new File();
        let relativePath, newTagName;
        if (treeItem) {
          relativePath = treeItem.filePath;
        } else {
          const { entries, list } = parseData(file.tags);

          const [selectedIdx] = await showDropdown(list, {
            placeHolder: "Select tag to rename:",
          });

          if (!selectedIdx) return;
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
