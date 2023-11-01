import * as vscode from 'vscode';
import * as path from 'path';
const _ = require('lodash');

const createBookmarkObj = (name: string) => ({
  name,
  createdAt: new Date().getTime(),
});

const getWorkspacePath = () => {
  const workspace = vscode.workspace.workspaceFolders;
  const workspaceBasePath = workspace ? workspace[0].uri.fsPath : "";
  return workspaceBasePath;
};

const parseBookmarks = (data) => {
  const entries = Object.entries(data);
  // @ts-ignore
  const list = entries.map(([, { name }], index) => `${index + 1}. ${name}`);
  return { entries, list };
};

const showPicker = async ({ data = [], placeHolder = '' }) => {
  const options = data.map((item, index) => `${index + 1}. ${item}`);
  const selectedIdx = await showDropdown(options, {
    placeHolder
  });
  return selectedIdx;
};

const getAbsolutePath = (relative: string) => {
  return `${getWorkspacePath()}${relative}`;
};

const cleanFilePath = (filePath) => filePath.replace(getWorkspacePath(), "");

const getCurrentFilePath = (clean: boolean = true) => {
  const activeTE = vscode.window.activeTextEditor;
  // const filePath = activeTE["_documentData"]["_uri"]["path"];
  const filePath = activeTE["document"]["fileName"];

  return clean ? cleanFilePath(filePath) : filePath;
};

const isFalsy = (value: any) => {
  const isUndefined = value === undefined || value === null;
  const isEmptyString = typeof value === 'string' && !value.trim();
  const isEmptyArray = typeof value === 'object' && Array.isArray(value) && value.length === 0;
  const isEmptyObject = typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0;

  return isUndefined || isEmptyString || isEmptyArray || isEmptyObject;
};

const showDropdown = async (list: Array<any>, options: any): Promise<number | undefined | Array<number>> => {
  const selected = await vscode.window.showQuickPick(list, options);

  const selectedOptions = [].concat(selected || []);

  if (isFalsy(selectedOptions))
    return;

  const selectedIdx = selectedOptions.map(
    (selected) => Number(selected.split(".")[0]) - 1
  );
  return options.canPickMany ? selectedIdx : selectedIdx[0];
};

const openFile = async (relativePath: string) => {
  const fd = await vscode.workspace.openTextDocument(
    getAbsolutePath(relativePath)
  );
  vscode.window.showTextDocument(fd, {
    preserveFocus: false,
    preview: false,
  });
};

const getCurrentFileInfo = () => {
  const activeTE = vscode.window.activeTextEditor;
  // const filePath = activeTE["_documentData"]["_uri"]["path"];
  const filePath = activeTE["document"]["fileName"];

  const currentFileName = path.basename(filePath);
  const directoryPath = path.dirname(filePath);
  const extensionName = path.extname(filePath);

  return {
    filePath,
    currentFileName,
    directoryPath,
    extensionName
  };
};

const openDirectoryFile = async (directoryPath: string, fileName: string) => {
  const filePath = path.resolve(directoryPath, fileName);
  const fd = await vscode.workspace.openTextDocument(
    filePath
  );
  vscode.window.showTextDocument(fd, {
    preserveFocus: false,
    preview: false,
  });
};

const getModuleSettings = (module) => {
  const userDefinedSettings = vscode.workspace.getConfiguration('fileOps');
  switch (module) {
    case 'file-import':
      const addQuotes: boolean = userDefinedSettings.get('fileImport.addQuotes');
      const addFileExtension: boolean = userDefinedSettings.get('fileImport.addFileExtension');
      return {
        addQuotes,
        addFileExtension
      };
    default: return {};
  }
};

const parseCurrentFilePath = () => {
  const currentFilePath = getCurrentFilePath(false);
  return path.parse(currentFilePath);
};

const readDataFromClipboard = () => vscode.env.clipboard.readText();

const writeDataToClipboard = (data: any) => vscode.env.clipboard.writeText(data);

const getBasePath = (obj: any) => {
  const { filePath, targetFileObj, addFileExtension } = obj;
  const { dir, name } = path.parse(filePath);

  const hasFolderInDir = /\w+$/.test(dir); // skip removing `index.js` file when the dir returns '../` and has no folder as part of the the path. This happens when you import a src `index.js` inside another target `index.js` and this target file is a child of the src `index.js` file.
  if (targetFileObj.base === 'index.js' && hasFolderInDir)
    return dir;

  if (addFileExtension) return filePath;

  return path.join(dir, name);
};

const switchCase = (text, caseType) => {
  switch (caseType) {
    case "UPPERCASE":
      return _.toUpper(text);
    case "LOWERCASE":
      return _.toLower(text);
    case "KEBABCASE":
      return _.kebabCase(text);
    case "SNAKECASE":
      return _.snakeCase(text);
    case "CAMELCASE":
      return _.camelCase(text);
    case "CAPITALIZE":
      return _.capitalize(text);
    case "TRIM_AND_REPLACE_WITH_UNDERSCORE":
      return _.replace(_.trim(text), /\s+/g, '_');
    case "REMOVE_SPACES":
      return _.replace(text, /\s/g, '');
  }
};

const updateSelectedText = (cb) => {
  let editor = vscode.window.activeTextEditor,
    document = editor.document,
    selections = editor.selections;

  editor.edit(function (editBuilder) {
    selections.forEach(function (selection) {
      // if (!selection.isSingleLine) {
      //   return;
      // }

      let range = new vscode.Range(selection.start, selection.end);

      // if (!selection.isEmpty && selection.isSingleLine) {
      editBuilder.replace(
        selection,
        cb(document.getText(range))
      );
      // }
    });
  });
};

const getFileShortName = () => {
  const parsed = parseCurrentFilePath();

  const foldersBreakdown = parsed.dir.replace(/\\/g, '/').split('/');
  return `../${_.last(foldersBreakdown)}/${parsed.base}`;
};

export {
  createBookmarkObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown,
  parseBookmarks,
  showPicker,
  cleanFilePath,
  openFile,
  getCurrentFileInfo,
  openDirectoryFile,
  isFalsy,
  getModuleSettings,
  parseCurrentFilePath,
  writeDataToClipboard,
  readDataFromClipboard,
  getBasePath,
  switchCase,
  updateSelectedText,
  getFileShortName
};