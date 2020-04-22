const vscode = require("vscode");
const FileTag = require("./util");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "file-tag" is now active!');
  let disposable = vscode.commands.registerCommand(
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

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
