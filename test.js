const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const presetTypescript = require('@babel/preset-typescript');
const presetReact = require('@babel/preset-react');
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const targetFile =
	"/Users/user/Desktop/Personal Workspace/scan-react-dependencies/test_file.tsx";

async function searchDirectoryForFiles(
	directoryPath,
	fileExtensions,
	ignoreDirectories
) {
	const targetFiles = [];

	async function traverseDirectory(dir) {
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
	}

	await traverseDirectory(directoryPath);
	return targetFiles;
}

function main() {
	const content = fs.readFileSync(targetFile, "utf8");

	// const options = {
    //     filename: "file.ts",
	// 	presets: ["@babel/preset-env", "@babel/preset-react"],
	// };

	// const transformed = babel.transform(content, options);
	// // const extractedDependencies = [];

	// transformed.ast.program.body.forEach((node) => {
	// 	if (
	// 		node.type === "ExpressionStatement" &&
	// 		node.expression.type === "CallExpression" &&
	// 		node.expression.callee.name === "useEffect" &&
	// 		node.expression.arguments.length === 2 &&
	// 		node.expression.arguments[1].type === "ArrayExpression"
	// 	) {
	// 		const dependencies = node.expression.arguments[1].elements.map(
	// 			(dep) => dep.name
	// 		);
	// 		extractedDependencies.push(dependencies);
	// 	}
	// });

    const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx'],
        presets: [presetTypescript, presetReact],
      });

	console.log(ast);
}

main();
