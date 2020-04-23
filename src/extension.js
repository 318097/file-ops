const vscode = require("vscode");
const FileTag = require("./util");

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
        const activeTE = vscode.window.activeTextEditor;
        const filePath = activeTE["_documentData"]["_uri"]["path"];
        fileTag.addTag({ [filePath]: fileDescription });
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

  context.subscriptions.push(createTag, listTags);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
