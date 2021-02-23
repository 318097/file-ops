import * as vscode from 'vscode';
import * as path from 'path';
import FileTag from './FileTag';
import { parseData } from './helpers';

export class FileTagProvider implements vscode.TreeDataProvider<TreeItem> {
  fileTag: FileTag;

  constructor(private workspaceRoot: string) {
    this.fileTag = new FileTag();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('Cannot use extension in empty workspace.');
      return Promise.resolve([]);
    }

    if (this.fileTag.empty) {
      vscode.window.showInformationMessage('No tags.');
      return Promise.resolve([]);
    }

    if (element) {
      const item = new TreeItem(element.filePath, undefined, undefined, vscode.TreeItemCollapsibleState.None);
      return Promise.resolve([item]);
    } else {
      const { meta } = parseData(this.fileTag);
      const tagList = meta.map(([filePath, { name }]) => new TreeItem(name, filePath, '', vscode.TreeItemCollapsibleState.Collapsed));

      return Promise.resolve(tagList);
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
    this.fileTag = new FileTag();
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public filePath: string | undefined,
    private description: string | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.filePath = this.filePath;
    this.description = this.description;
    this.tooltip = this.label;
  }

  command = {
    title: 'open',
    command: 'file-tag.openTag',
    arguments: [this.filePath]
  };

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'dark', 'tag.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'tag.svg')
  };
}
