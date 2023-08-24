const fs = require("fs");
const path = require("path");
const tsMorph = require("ts-morph");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const fileExtensions = [".js", ".ts", ".tsx"];
const ignoreDirectories = ["node_modules"];
const directoryPath = "/Users/user/Desktop/Personal Workspace/dodo-crx";
const ignoreTypes = ["string", "number", "bigint"];

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
				if (dependencyArray) {
					dependencyArray.forEachDescendant((innerNode) => {
						const type = innerNode.getType()?.getText() ?? "unknown";
						if (tsMorph.Node.isIdentifier(innerNode) && !ignoreTypes.includes(type)) {
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
	console.log(JSON.stringify(allDependencies, 4));
}

main();
