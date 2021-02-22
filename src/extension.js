const vscode = require("vscode");
const FileTag = require("./util");

const getDefaultFileObj = (name) => ({
  name,
  favorite: false,
  createdAt: new Date().toString(),
});

const getWorkspacePath = () => {
  return vscode.workspace.workspaceFolders[0]["uri"]["path"];
};

const parseData = (fileTag) => {
  const meta = Object.entries(fileTag.meta);
  const list = meta.map(([, { name }], index) => `${index + 1}. ${name}`);
  return { meta, list };
};

const getAbsolutePath = (relative) => {
  return `${getWorkspacePath()}${relative}`;
};

const getCurrentFilePath = () => {
  const activeTE = vscode.window.activeTextEditor;
  // console.log(activeTE.document.fileName, activeTE.document.uri);
  // console.log(vscode.workspace.name, vscode.workspace.workspaceFolders);
  // console.log("activeTE::-", activeTE);
  const filePath = activeTE["_documentData"]["_uri"]["path"];
  return filePath.replace(getWorkspacePath(), "");
};

const showDropdown = async (list, options) => {
  const selected = await vscode.window.showQuickPick(list, options);
  const selectedOptions = [].concat(selected);
  if (!selectedOptions.length) return;

  const selectedIdx = selectedOptions.map(
    (selected) => Number(selected.split(".")[0]) - 1
  );
  return selectedIdx;
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
        const name = await vscode.window.showInputBox({
          placeHolder: "Enter tag name:",
        });

        if (!name) return;

        const filePath = getCurrentFilePath();

        fileTag.meta[filePath] = getDefaultFileObj(name);
        fileTag.save();
        vscode.window.setStatusBarMessage(`File Tag: Tag created.`, 5000);
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
        const { meta, list } = parseData(fileTag);

        const [selectedIdx] = await showDropdown(list, {
          placeHolder: "Select tag to open:",
        });
        if (!selectedIdx) return;
        const [relativePath, { name }] = meta[selectedIdx];

        const fd = await vscode.workspace.openTextDocument(
          getAbsolutePath(relativePath)
        );
        vscode.window.showTextDocument(fd, {
          preserveFocus: false,
          preview: false,
        });
        await vscode.window.setStatusBarMessage(`Tag:${name}`, 3000);
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
        const { name } = fileTag.meta[filePath];
        vscode.window.setStatusBarMessage(
          `File Tag: ${name ? name : "No file tag."}`,
          5000
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
        const { meta, list } = parseData(fileTag);

        const selectedIdx = await showDropdown(list, {
          canPickMany: true,
          placeHolder: "Select tag(s) to delete:",
        });
        if (!selectedIdx.length) return;

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
    "extension.renameTag",
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
          updatedAt: new Date().toString(),
        };
        fileTag.save();

        vscode.window.setStatusBarMessage(`File Tag: Tag renamed.`, 5000);
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
