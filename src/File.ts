import * as fs from "fs";
import { getWorkspacePath } from './helpers';
import config from './config';
export default class File {
  path: string = "";
  empty: boolean = false;
  tags: any = {};
  groups: any = [];

  constructor() {
    this.setFilePath();
    this.read();
  }

  fileExists = () => fs.existsSync(this.path);

  read() {
    if (!this.fileExists()) {
      this.empty = true;
      return;
    }

    const { tags, groups } = JSON.parse(fs.readFileSync(this.path, "utf-8"));
    this.tags = tags;
    this.groups = groups;
  }

  save() {
    const data = {
      tags: this.tags,
      groups: this.groups
    };
    fs.writeFileSync(this.path, JSON.stringify(data, undefined, 2));
  }

  setFilePath() {
    const workspaceBasePath = getWorkspacePath();
    this.path = `${workspaceBasePath}/${config.FILE_NAME}`;
  }

  addGroup(data: any) {
    this.groups.push({ ...data, createdAt: new Date().getTime() });
    this.save();
  }
}
