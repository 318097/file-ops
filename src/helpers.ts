import * as vscode from 'vscode';
import File from './File';

const getDefaultFileTagObj = (name: string) => ({
  name,
  createdAt: new Date().getTime(),
});

const getWorkspacePath = () => {
  const workspace = vscode.workspace.workspaceFolders;
  const workspaceBasePath = workspace ? workspace[0].uri.fsPath : "";
  return workspaceBasePath;
};

const parseData = (data) => {
  const entries = Object.entries(data);
  const list = entries.map(([, { name }], index) => `${index + 1}. ${name}`);
  return { entries, list };
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
  getDefaultFileTagObj,
  getWorkspacePath,
  getAbsolutePath,
  getCurrentFilePath,
  showDropdown,
  parseData
}