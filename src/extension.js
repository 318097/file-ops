const vscode = require("vscode");
const FileTag = require("./util");

const getWorkspacePath = () => {
  return vscode.workspace.workspaceFolders[0]["uri"]["path"];
};

const getCurrentFilePath = () => {
  const activeTE = vscode.window.activeTextEditor;
  console.log(activeTE.document.fileName, activeTE.document.uri);
  console.log(vscode.workspace.name, vscode.workspace.workspaceFolders);
  // console.log("activeTE::-", activeTE);
  const workspacePath = getWorkspacePath();
  const filePath = activeTE["_documentData"]["_uri"]["path"];
  const relativePath = filePath.replace(workspacePath, "");
  return relativePath;
};

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const createTag = vscode.commands.registerCommand(
    "extension.createTag",
    async () => {
      try {
        const fileTag = new FileTag();
        const fileDescription = await vscode.window.showInputBox({
          placeHolder: "Enter tag description:",
        });
        const filePath = getCurrentFilePath();
        fileTag.meta[filePath] = fileDescription;
        fileTag.save();
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
          placeHolder: "Select tag to load:",
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
          placeHolder: "Select tags to delete:",
        });

        if (!selectedList) return;

        const selectedIdx = selectedList.map(
          (selected) => Number(selected.split(".")[0]) - 1
        );

        meta
          .filter((_, idx) => selectedIdx.includes(idx))
          .map(([path]) => path)
          .forEach((path) =>
            fileTag.meta[path] ? delete fileTag.meta[path] : null
          );

        fileTag.save();
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
          placeHolder: "Select tag to rename:",
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

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
