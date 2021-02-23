"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as vscode from 'vscode';
const fs = require("fs");
const helpers_1 = require("./helpers");
const filename = ".file-tag";
const fileExists = (filePath) => fs.existsSync(filePath);
class FileTag {
    constructor() {
        this.path = "";
        this.empty = false;
        this.meta = {};
        this.init();
    }
    init() {
        this.load();
        this.read();
    }
    read() {
        const hasConfigFile = fileExists(this.path);
        if (!hasConfigFile) {
            this.save();
            this.empty = true;
        }
        this.meta = JSON.parse(fs.readFileSync(this.path, "utf-8")) || "{}";
    }
    save() {
        fs.writeFileSync(this.path, JSON.stringify(this.meta, undefined, 3));
    }
    load() {
        const workspaceBasePath = helpers_1.getWorkspacePath();
        this.path = `${workspaceBasePath}/${filename}`;
    }
}
exports.default = FileTag;
//# sourceMappingURL=util.js.map