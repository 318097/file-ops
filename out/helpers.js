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
exports.showDropdown = exports.getCurrentFilePath = exports.getAbsolutePath = exports.getWorkspacePath = exports.getDefaultFileObj = void 0;
const vscode = require("vscode");
const getDefaultFileObj = (name) => ({
    name,
    favorite: false,
    createdAt: new Date().toString(),
});
exports.getDefaultFileObj = getDefaultFileObj;
const getWorkspacePath = () => {
    return vscode.workspace.workspaceFolders[0]["uri"]["path"];
};
exports.getWorkspacePath = getWorkspacePath;
const parseData = (fileTag) => {
    const meta = Object.entries(fileTag.meta);
    const list = meta.map(([, { name }], index) => `${index + 1}. ${name}`);
    return { meta, list };
};
const getAbsolutePath = (relative) => {
    return `${getWorkspacePath()}${relative}`;
};
exports.getAbsolutePath = getAbsolutePath;
const getCurrentFilePath = () => {
    const activeTE = vscode.window.activeTextEditor;
    // console.log(activeTE.document.fileName, activeTE.document.uri);
    // console.log(vscode.workspace.name, vscode.workspace.workspaceFolders);
    // console.log("activeTE::-", activeTE);
    const filePath = activeTE["_documentData"]["_uri"]["path"];
    return filePath.replace(getWorkspacePath(), "");
};
exports.getCurrentFilePath = getCurrentFilePath;
const showDropdown = (list, options) => __awaiter(void 0, void 0, void 0, function* () {
    const selected = yield vscode.window.showQuickPick(list, options);
    const selectedOptions = [].concat(selected);
    if (!selectedOptions.length) {
        return;
    }
    const selectedIdx = selectedOptions.map((selected) => Number(selected.split(".")[0]) - 1);
    return selectedIdx;
});
exports.showDropdown = showDropdown;
//# sourceMappingURL=helpers.js.map