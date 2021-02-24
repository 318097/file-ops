import * as vscode from 'vscode';
import * as path from 'path';
import File from './File';
import { parseTagData } from './helpers';
export class FileTagProvider implements vscode.TreeDataProvider<TreeItem> {
  file: File;

  constructor(private workspaceRoot: string) {
    this.file = new File();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('Cannot use extension in empty workspace.');
      return Promise.resolve([]);
    }

    if (this.file.empty) {
      return Promise.resolve([]);
    }

    if (element) {
      const item = new TreeItem(element.filePath, undefined, vscode.TreeItemCollapsibleState.None);
      return Promise.resolve([item]);
    } else {
      const { entries } = parseTagData(this.file.tags);
      const tagList = entries.map(([filePath, { name }]) => new TreeItem(name, filePath, vscode.TreeItemCollapsibleState.Collapsed, true));

      return Promise.resolve(tagList);
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
    this.file = new File();
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public filePath: string | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public isRoot: boolean = false
  ) {
    super(label, collapsibleState);
    this.filePath = this.filePath;
    this.tooltip = this.label;
    this.isRoot = this.isRoot;
  }

  command = {
    title: 'open',
    command: 'file-tag.openTag',
    arguments: [this.filePath]
  };

  contextValue = this.isRoot ? 'ROOT' : "CHILD";

  iconPath = this.isRoot ? {
    light: path.join(__filename, '..', '..', 'resources', 'dark', 'tag.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'tag.svg')
  } : undefined;
}
