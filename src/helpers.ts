import * as vscode from 'vscode';
import * as path from 'path';

const getDefaultFileTagObj = (name: string) => ({
  name,
  createdAt: new Date().getTime(),
});

const getWorkspacePath = () => {
  const workspace = vscode.workspace.workspaceFolders;
  const workspaceBasePath = workspace ? workspace[0].uri.fsPath : "";
  return workspaceBasePath;
};

const parseTagData = (data) => {
  const entries = Object.entries(data);
  // @ts-ignore
  const list = entries.map(([, { name }], index) => `${index + 1}. ${name}`);
  return { entries, list };
};

const parseGroupData = (data = []) => {
  const list = data.map(({ name }, index) => `${index + 1}. ${name}`);
  return { list };
};

const getAbsolutePath = (relative: string) => {
  return `${getWorkspacePath()}${relative}`;
};

const cleanFilePath = (filePath) => filePath.replace(getWorkspacePath(), "");

const getCurrentFilePath = () => {
  const activeTE = vscode.window.activeTextEditor;
  // const filePath = activeTE["_documentData"]["_uri"]["path"];
  const filePath = activeTE["document"]["fileName"];

  return cleanFilePath(filePath);
};

const isFalsy = (value: any) => {
  const isUndefined = value === undefined || value === null;
  const isEmptyString = typeof value === 'string' && !value.trim();
  const isEmptyArray = typeof value === 'object' && Array.isArray(value) && value.length === 0;
  const isEmptyObject = typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0;

  return isUndefined || isEmptyString || isEmptyArray || isEmptyObject;
};

const showDropdown = async (list: Array<any>, options: any): Promise<number | undefined | Array<number>> => {
  const multiSelect = options.canPickMany;
  const selected = await vscode.window.showQuickPick(list, options);

  const selectedOptions = [].concat(selected || []);

  if (isFalsy(selectedOptions))
    return;

  const selectedIdx = selectedOptions.map(
    (selected) => Number(selected.split(".")[0]) - 1
  );
  return multiSelect ? selectedIdx : selectedIdx[0];
};

const openFile = async (relativePath: string, name: string | undefined) => {
  const fd = await vscode.workspace.openTextDocument(
    getAbsolutePath(relativePath)
  );
  vscode.window.showTextDocument(fd, {
    preserveFocus: false,
    preview: false,
  });
  if (name) {
    await vscode.window.showInformationMessage(`Tag:${name}`);
  }
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

const writeFileUriToClipboard = async (uri: vscode.Uri) => {
  vscode.env.clipboard.writeText(uri.fsPath);
};

export {
  getDefaultFileTagObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown,
  parseTagData,
  parseGroupData,
  cleanFilePath,
  openFile,
  getCurrentFileInfo,
  openDirectoryFile,
  isFalsy,
  writeFileUriToClipboard
};