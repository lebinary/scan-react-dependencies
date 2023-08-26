import fs from "fs";
import path from "path";

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

	async getAllFiles(
		fileExtensions?: string[],
		ignoreDirectories?: string[]
	): Promise<string[]> {
		const targetFiles: string[] = [];

		const traverseDirectory = async (dir: string) => {
			const files = await this.readDirectory(dir);
			for (const file of files) {
				const filePath = path.join(dir, file);

				if (await this.isDirectory(filePath) && !ignoreDirectories?.includes(file)) {
					traverseDirectory(filePath);
				} else {
					if (
						!fileExtensions ||
						fileExtensions.length === 0 ||
						(fileExtensions && fileExtensions.includes(path.extname(file)))
					) {
						targetFiles.push(filePath);
					}
				}
			}
		};

		await traverseDirectory(this.directoryPath);
		return targetFiles;
	}
}
