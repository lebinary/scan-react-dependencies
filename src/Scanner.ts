import tsMorph, { Project } from "ts-morph";
import { Directory } from "./Directory";
import { Dependency, DependencyItem } from "./types";

const PRIMATIVE_TYPES = ["string", "number", "bigint"];

export class Scanner {
	public ready: Promise<void>;
	protected filePaths: string[] = [];
	protected readonly project: Project;

	constructor(
		directoryPath: string,
		fileExtensions: string[],
		ignoreDirectories: string[]
	) {
		this.project = new tsMorph.Project();
		const directory = new Directory(directoryPath);
		this.ready = new Promise<void>((resolve, reject) => {
			(async () => {
				try {
					this.filePaths = await directory.getAllFiles(
						fileExtensions,
						ignoreDirectories
					);
					resolve();
				} catch (err) {
					reject(err);
				}
			})();
		});
	}

	scanUseEffect(): Dependency[] {
		const allDependencies: Dependency[] = [];

		for (const filePath of this.filePaths) {
			const sourceFile = this.project.addSourceFileAtPath(filePath);
			const dependencies: DependencyItem[] = [];
			sourceFile.forEachDescendant((node: any) => {
				if (
					tsMorph.Node.isCallExpression(node) &&
					node.getExpression().getText() === "useEffect" &&
					node.getArguments().length > 0
				) {
					const dependencyArray = node.getArguments()[1];
					if (dependencyArray) {
						dependencyArray.forEachDescendant((innerNode) => {
							const type = innerNode.getType()?.getText() ?? "unknown";
							if (
								tsMorph.Node.isIdentifier(innerNode) &&
								!PRIMATIVE_TYPES.includes(type)
							) {
								dependencies.push({
									name: innerNode.getText(),
									type: type,
									row: innerNode.getStartLineNumber(),
								});
							}
						});
					}
				}
			});

			if (dependencies.length > 0) {
				allDependencies.push({ [filePath]: dependencies });
			}
		}

		return allDependencies;
	}
}
