const vscode = require("vscode");
const FileTag = require("./util");

const getCurrentFilePath = () => {
  const activeTE = vscode.window.activeTextEditor;
  const filePath = activeTE["_documentData"]["_uri"]["path"];
  return filePath;
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "file-tag" is now active!');
  const createTag = vscode.commands.registerCommand(
    "extension.createTag",
    async () => {
      try {
        const fileTag = new FileTag();
        const fileDescription = await vscode.window.showInputBox({
          placeHolder: "Enter description",
        });
        const filePath = getCurrentFilePath();
        fileTag.addTag({ [filePath]: fileDescription });
        vscode.window.showInformationMessage(`File Tag: Tag created.`);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const listTags = vscode.commands.registerCommand(
    "extension.listTags",
    async () => {
      try {
        const fileTag = new FileTag();
        const meta = Object.entries(fileTag.meta);
        const list = meta.map(([path, tag], index) => `${index + 1}. ${tag}`);

        const selected = await vscode.window.showQuickPick(list, {
          placeHolder: "Select tag to load file",
        });

        if (!selected) return;

        const selectedIndex = Number(selected.split(".")[0]) - 1;
        const [path, tag] = meta[selectedIndex];

        const fd = await vscode.workspace.openTextDocument(path);
        vscode.window.showTextDocument(fd, {
          preserveFocus: false,
          preview: false,
        });
        await vscode.window.setStatusBarMessage(`Tag:${tag}`, 2000);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const currentTag = vscode.commands.registerCommand(
    "extension.currentTag",
    async () => {
      try {
        const fileTag = new FileTag();
        const filePath = getCurrentFilePath();
        const currentFileTag = fileTag.meta[filePath];
        vscode.window.showInformationMessage(
          `File Tag: ${currentFileTag ? currentFileTag : "No file tag."}`
        );
      } catch (err) {
        console.log(err);
      }
    }
  );

  const deleteTags = vscode.commands.registerCommand(
    "extension.deleteTags",
    async () => {
      try {
        const fileTag = new FileTag();
        const meta = Object.entries(fileTag.meta);
        const list = meta.map(([path, tag], index) => `${index + 1}. ${tag}`);

        const selectedList = await vscode.window.showQuickPick(list, {
          canPickMany: true,
          placeHolder: "Select tag to load file",
        });

        if (!selectedList) return;

        const selectedIdx = selectedList.map(
          (selected) => Number(selected.split(".")[0]) - 1
        );

        const pathList = meta
          .filter((_, idx) => selectedIdx.includes(idx))
          .map(([path]) => path);

        fileTag.deleteTags(pathList);
      } catch (err) {
        console.log(err);
      }
    }
  );

  const renameTag = vscode.commands.registerCommand(
    "extension.renameTag",
    async () => {
      try {
        const fileTag = new FileTag();
        const meta = Object.entries(fileTag.meta);
        const list = meta.map(([path, tag], index) => `${index + 1}. ${tag}`);

        const selected = await vscode.window.showQuickPick(list, {
          placeHolder: "Select tag to rename",
        });

        if (!selected) return;

        const newTag = await vscode.window.showInputBox({
          placeHolder: "Enter new tag:",
        });

        const selectedIndex = Number(selected.split(".")[0]) - 1;
        const [path] = meta[selectedIndex];
        fileTag.meta[path] = newTag;
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
    renameTag
  );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
