import * as vscode from 'vscode';
import * as fs from "fs";

const filename = ".file-tag";

const fileExists = (filePath:string) => fs.existsSync(filePath);

export default class FileTag {
  path :string= "";
meta :any= {};
  
  constructor() {
    this.init();
  }

  init() {
    this.load();
    this.read();
  }

  read() {
    const hasConfigFile = fileExists(this.path);
    if (!hasConfigFile) this.save();

    this.meta = JSON.parse(fs.readFileSync(this.path, "utf-8")) || "{}";
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.meta, undefined, 3));
  }

  load() {
    const workspace = vscode.workspace.workspaceFolders;
    const workspaceBasePath = !!workspace ? workspace[0].uri.fsPath : "";
    this.path = `${workspaceBasePath}/${filename}`;
  }
}
