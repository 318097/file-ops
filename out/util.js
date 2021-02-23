"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    init() {
        this.load();
        this.read();
    }
    read() {
        const hasConfigFile = fileExists(this.path);
        if (!hasConfigFile)
            this.save();
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
exports.default = FileTag;
//# sourceMappingURL=util.js.map