// import * as vscode from 'vscode';
import * as fs from "fs";
import { getWorkspacePath } from './helpers';

const filename = ".file-tag";

const fileExists = (filePath: string) => fs.existsSync(filePath);

export default class FileTag {
  path: string = "";
  empty: boolean = false;
  meta: any = {};

  constructor() {
    this.init();
  }

  init() {
    this.load();
    this.read();
  }

  read() {
    const hasConfigFile = fileExists(this.path);
    if (!hasConfigFile) {
      this.save();
      this.empty = true;
    }

    this.meta = JSON.parse(fs.readFileSync(this.path, "utf-8")) || "{}";
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.meta, undefined, 3));
  }

  load() {
    const workspaceBasePath = getWorkspacePath();
    this.path = `${workspaceBasePath}/${filename}`;
  }
}
