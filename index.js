const fs = require("fs");
const path = require("path");
const tsMorph = require("ts-morph");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const fileExtensions = [".js", ".ts", ".tsx"];
const ignoreDirectories = ["node_modules"];
const directoryPath =
	"/Users/user/Desktop/Personal Workspace/dodo-crx";

const searchDirectoryForFiles = async (
	directoryPath,
	fileExtensions,
	ignoreDirectories
) => {
	const targetFiles = [];

	const traverseDirectory = async (dir) => {
		const files = await readdir(dir);
		for (const file of files) {
			const filePath = path.join(dir, file);
			const fileStat = await stat(filePath);

			if (fileStat.isDirectory() && !ignoreDirectories.includes(file)) {
				await traverseDirectory(filePath);
			} else if (fileExtensions.includes(path.extname(file))) {
				targetFiles.push(filePath);
			}
		}
	};

	await traverseDirectory(directoryPath);
	return targetFiles;
};

async function main() {
	const filePaths = await searchDirectoryForFiles(
		directoryPath,
		fileExtensions,
		ignoreDirectories
	);
	const allDependencies = [];
	const project = new tsMorph.Project();

	for (const filePath of filePaths) {
		const sourceFile = project.addSourceFileAtPath(filePath);
		const dependencies = [];
		sourceFile.forEachDescendant((node) => {
			if (
				tsMorph.Node.isCallExpression(node) &&
				node.getExpression().getText() === "useEffect" &&
				node.getArguments().length > 0
			) {
				const dependencyArray = node.getArguments()[1];
				dependencyArray.forEachDescendant((innerNode) => {
					if (tsMorph.Node.isIdentifier(innerNode)) {
						const row = innerNode.getStartLineNumber();
						const col = innerNode.getStartLinePos();
						const identifierText = innerNode.getText();
						const type = innerNode.getType();
						dependencies.push({
							name: identifierText,
							type: type ? type.getText() : "unknown",
							row: row,
							col: col,
						});
					}
				});
			}
		});
		allDependencies.push({ [filePath]: dependencies });
		// console.log(`${targetFile}: ${useEffectCount} occurrences of 'useEffect'`);
		// console.log(`${targetFile}: ${dependencies.length} dependencies of 'useEffect'`);

		// for (const dependency of dependencies) {
		//     const dependencyType = isPrimitiveType(dependency) ? 'primitive' : 'object';
		//     console.log(`Dependency: ${dependency}, Type: ${dependencyType}`);
		// }
	}
	console.log(allDependencies);
}

main();
