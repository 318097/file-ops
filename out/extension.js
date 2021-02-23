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
const showDropdown = (list, options) => __awaiter(void 0, void 0, void 0, function* () {
    const selected = yield vscode.window.showQuickPick(list, options);
    const selectedOptions = [].concat(selected);
    if (!selectedOptions.length) {
        return;
    }
    const selectedIdx = selectedOptions.map((selected) => Number(selected.split(".")[0]) - 1);
    return selectedIdx;
});
function activate(context) {
    const createTag = vscode.commands.registerCommand("file-tag.createTag", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const fileTag = new util_1.default();
            const filePath = getCurrentFilePath();
            if (fileTag.meta[filePath]) {
                yield vscode.window.showInformationMessage(`File Tag: Tag exists for this file. Continue to override`);
            }
            const name = yield vscode.window.showInputBox({
                placeHolder: "Enter tag name:",
            });
            if (!name) {
                return;
            }
            fileTag.meta[filePath] = getDefaultFileObj(name);
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
            const { meta, list } = parseData(fileTag);
            const [selectedIdx] = yield showDropdown(list, {
                placeHolder: "Select tag to open:",
            });
            if (!selectedIdx)
                return;
            const [relativePath, { name }] = meta[selectedIdx];
            const fd = yield vscode.workspace.openTextDocument(getAbsolutePath(relativePath));
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
            const filePath = getCurrentFilePath();
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
            const { meta, list } = parseData(fileTag);
            const selectedIdx = yield showDropdown(list, {
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
            const { meta, list } = parseData(fileTag);
            const [selectedIdx] = yield showDropdown(list, {
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