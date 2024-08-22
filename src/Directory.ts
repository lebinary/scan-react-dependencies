import fs from "fs";
import path from "path";
import { PathInfo } from "./types";
import { resolve } from "node:path/win32";

export class Directory {
	protected directoryPath: string;

	constructor(directoryPath: string) {
		this.directoryPath = directoryPath;
	}

	async readDirectory(dir: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			fs.readdir(dir, (err: NodeJS.ErrnoException | null, files: string[]) => {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					resolve(files);
				}
			});
		});
	}

	async isDirectory(dir: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			fs.stat(dir, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					resolve(stats.isDirectory());
				}
			});
		});
	}

  async checkPath(dir: string): Promise<PathInfo> {
    return new Promise<PathInfo>((resolve, reject) => {
      fs.stat(dir, (err: NodeJS.ErrnoException | null, stats: fs.Stats) => {
        if (err) {
          console.log(err);
          reject({
            exists: false,
            isDirectory: false,
            isFile: false
          });
        } else {
          resolve({
            exists: true,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
          });
        }
      });
    });
  };

  isValidFile(fileName: string, fileExtensions?: string[]): Boolean {
    return 	!fileExtensions ||
				fileExtensions.length === 0 ||
				(fileExtensions && fileExtensions.includes(path.extname(fileName)))
  }

	async getAllFiles(
		fileExtensions?: string[],
		ignoreDirectories?: string[]
	): Promise<string[]> {
		const targetFiles: string[] = [];

    const pathInfo = await this.checkPath(this.directoryPath);

    if(pathInfo.isDirectory){
  		const traverseDirectory = async (dir: string) => {
  			const files = await this.readDirectory(dir);
  			for (const file of files) {
  				const filePath = path.join(dir, file);
          const pathInfo = await this.checkPath(filePath);

  				if (pathInfo.isDirectory && !ignoreDirectories?.includes(file)) {
  					traverseDirectory(filePath);
  				} else {
  					if (this.isValidFile(file, fileExtensions)) {
  						targetFiles.push(filePath);
  					}
  				}
  			}
  		};
  		await traverseDirectory(this.directoryPath);
    } else if (pathInfo.isFile && this.isValidFile(this.directoryPath, fileExtensions)) {
      targetFiles.push(this.directoryPath)
    }

		return targetFiles;
	}
}
