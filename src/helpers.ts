import * as vscode from 'vscode';
import FileTag from './FileTag';

const getDefaultFileObj = (name: string) => ({
  name,
  createdAt: new Date().getTime(),
});

const getWorkspacePath = () => {
  const workspace = vscode.workspace.workspaceFolders;
  const workspaceBasePath = workspace ? workspace[0].uri.fsPath : "";
  return workspaceBasePath;
};

const parseData = (fileTag: FileTag) => {
  const meta = Object.entries(fileTag.meta);
  const list = meta.map(([, { name }], index) => `${index + 1}. ${name}`);
  return { meta, list };
};

const getAbsolutePath = (relative: string) => {
  return `${getWorkspacePath()}${relative}`;
};

const getCurrentFilePath = () => {
  const activeTE = vscode.window.activeTextEditor;
  const filePath = activeTE["_documentData"]["_uri"]["path"];
  return filePath.replace(getWorkspacePath(), "");
};

const showDropdown = async (list: Array<any>, options: any): Promise<number | undefined> => {
  const selected = await vscode.window.showQuickPick(list, options);
  const selectedOptions = [].concat(selected);
  if (!selectedOptions.length) {
    return;
  }

  const selectedIdx = selectedOptions.map(
    (selected) => Number(selected.split(".")[0]) - 1
  );
  return selectedIdx;
};

export {
  getDefaultFileObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown,
  parseData
}