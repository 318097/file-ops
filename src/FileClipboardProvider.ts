import * as vscode from 'vscode';
import File from './File';
import { parseBookmarks } from './helpers';

export class FileClipboardProvider implements vscode.TreeDataProvider<TreeItem> {
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

    if (!element) {
      const clipboardTreeItems = this.file.clipboardList.map(clipboardItem => new TreeItem(clipboardItem, vscode.TreeItemCollapsibleState.None));

      return Promise.resolve(clipboardTreeItems);
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
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
  }

  command = {
    title: 'open',
    command: 'file-ops.copyToClipboard',
    arguments: [this.label]
  };

  // contextValue = this.isRoot ? 'ROOT' : "CHILD";

  // iconPath = new vscode.ThemeIcon(this.isRoot ? "tag" : "file");
}
