const tsMorph = require("ts-morph");

// Create a new Project instance
const project = new tsMorph.Project();

// Load a TypeScript source file
const filePath =
"/Users/user/Desktop/Personal Workspace/scan-react-dependencies/test_file.tsx";
const sourceFile = project.addSourceFileAtPath(filePath);
const typeChecker = project.getTypeChecker();

// sourceFile.forEachDescendant(node => console.log(node));

const dependencies = [];

// Find and analyze useEffect calls
sourceFile.forEachDescendant((node) => {
	if (
		tsMorph.Node.isCallExpression(node) &&
		node.getExpression().getText() === "useEffect" &&
		node.getArguments().length > 0
	) {
		const dependencyArray = node.getArguments()[1];
		dependencyArray.forEachDescendant((innerNode) => {
			if (tsMorph.Node.isIdentifier(innerNode)) {
				const dependency = {
					name: innerNode.getText(),
					type: innerNode.getType().getText() ?? "unknown",
					row: innerNode.getStartLineNumber(),
					col: innerNode.getStartLinePos(),
					symbol: innerNode.getType().getSymbol()?.getName() ?? "unknown",
          local: innerNode.getLocal() ?? "unknown"
				};

        const originalNode = typeChecker.getSymbolAtLocation(innerNode);
				console.log(originalNode.getValueDeclaration().getText());

				dependencies.push(dependency);
			}
		});
	}
});
