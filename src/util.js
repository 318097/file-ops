const vscode = require("vscode");
const fs = require("fs");

const filename = ".file-tag";

const fileExists = (filePath) => fs.existsSync(filePath);

class FileTag {
  constructor() {
    this.path = "";
    this.meta = {};
    this.init();
  }

  init = () => {
    this.load();
    this.read();
  };

  read = () => {
    const hasConfigFile = fileExists(this.path);
    if (!hasConfigFile) this.save();

    this.meta = JSON.parse(fs.readFileSync(this.path, "utf-8")) || "{}";
  };

  save = () => {
    fs.writeFileSync(this.path, JSON.stringify(this.meta, undefined, 3));
  };

  load = () => {
    const workspace = vscode.workspace.workspaceFolders;
    const workspaceBasePath = !!workspace ? workspace[0].uri.fsPath : "";
    this.path = `${workspaceBasePath}/${filename}`;
  };

  addTag = (data) => {
    this.meta = { ...this.meta, ...data };
    this.save();
  };

  deleteTags = (fileList) => {
    fileList.forEach((path) =>
      this.meta[path] ? delete this.meta[path] : null
    );
    this.save();
  };
}
module.exports = FileTag;
