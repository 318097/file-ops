"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
const helpers_1 = require("./helpers");
const treeData_1 = require("./treeData");
function activate(context) {
    const taggedFilesProvider = new treeData_1.FileTagProvider(helpers_1.getWorkspacePath());
    vscode.window.registerTreeDataProvider('taggedFiles', taggedFilesProvider);
    const createTag = vscode.commands.registerCommand("file-tag.createTag", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const fileTag = new util_1.default();
            const filePath = helpers_1.getCurrentFilePath();
            if (fileTag.meta[filePath]) {
                yield vscode.window.showInformationMessage(`File Tag: Tag exists for this file. Continue to override`);
            }
            const name = yield vscode.window.showInputBox({
                placeHolder: "Enter tag name:",
            });
            if (!name) {
                return;
            }
            fileTag.meta[filePath] = helpers_1.getDefaultFileObj(name);
            fileTag.save();
            vscode.window.showInformationMessage(`File Tag: Tag created.`);
        }
        catch (err) {
            console.log(err);
        }
    }));
    const listTags = vscode.commands.registerCommand("file-tag.listTags", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const fileTag = new util_1.default();
            const { meta, list } = helpers_1.parseData(fileTag);
            const [selectedIdx] = yield helpers_1.showDropdown(list, {
                placeHolder: "Select tag to open:",
            });
            if (!selectedIdx)
                return;
            const [relativePath, { name }] = meta[selectedIdx];
            const fd = yield vscode.workspace.openTextDocument(helpers_1.getAbsolutePath(relativePath));
            vscode.window.showTextDocument(fd, {
                preserveFocus: false,
                preview: false,
            });
            yield vscode.window.showInformationMessage(`Tag:${name}`);
        }
        catch (err) {
            console.log(err);
        }
    }));
    const currentTag = vscode.commands.registerCommand("file-tag.currentTag", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const fileTag = new util_1.default();
            const filePath = helpers_1.getCurrentFilePath();
            const { name } = fileTag.meta[filePath] || {};
            vscode.window.showInformationMessage(`File Tag: ${name || "No file tag."}`);
        }
        catch (err) {
            console.log(err);
        }
    }));
    const deleteTags = vscode.commands.registerCommand("file-tag.deleteTags", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const fileTag = new util_1.default();
            const { meta, list } = helpers_1.parseData(fileTag);
            const selectedIdx = yield helpers_1.showDropdown(list, {
                canPickMany: true,
                placeHolder: "Select tag(s) to delete:",
            });
            if (!selectedIdx.length) {
                return;
            }
            meta.forEach((path, idx) => selectedIdx.includes(idx) ? delete fileTag.meta[path] : null);
            fileTag.save();
        }
        catch (err) {
            console.log(err);
        }
    }));
    const renameTag = vscode.commands.registerCommand("file-tag.renameTag", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const fileTag = new util_1.default();
            const { meta, list } = helpers_1.parseData(fileTag);
            const [selectedIdx] = yield helpers_1.showDropdown(list, {
                placeHolder: "Select tag to rename:",
            });
            if (!selectedIdx)
                return;
            const newTagName = yield vscode.window.showInputBox({
                placeHolder: "Enter new tag name:",
            });
            const [relativePath] = meta[selectedIdx];
            fileTag.meta[relativePath] = Object.assign(Object.assign({}, fileTag.meta[relativePath]), { name: newTagName, updatedAt: new Date().toString() });
            fileTag.save();
            vscode.window.showInformationMessage(`File Tag: Tag renamed.`);
        }
        catch (err) {
            console.log(err);
        }
    }));
    context.subscriptions.push(createTag, listTags, currentTag, deleteTags, renameTag);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map