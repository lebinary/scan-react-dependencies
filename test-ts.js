const tsMorph = require('ts-morph');

// Create a new Project instance
const project = new tsMorph.Project();

// Load a TypeScript source file
const filePath = '/Users/user/Desktop/Personal Workspace/dodo-crx/src/pages/Popup/Popup.tsx';
const sourceFile = project.addSourceFileAtPath(filePath);

// sourceFile.forEachDescendant(node => console.log(node));

const dependencies = [];

// Find and analyze useEffect calls
sourceFile.forEachDescendant(node => {
  if (
    tsMorph.Node.isCallExpression(node) &&
    node.getExpression().getText() === 'useEffect' &&
    node.getArguments().length > 0
  ) {
    const dependencyArray = node.getArguments()[1];
    dependencyArray.forEachDescendant(innerNode => {
      if (tsMorph.Node.isIdentifier(innerNode)) {
        const row = innerNode.getStartLineNumber();
        const col = innerNode.getStartLinePos();
        const identifierText = innerNode.getText();
        const type = innerNode.getType();
        dependencies.push({
          name: identifierText,
          type: type? type.getText() : 'unknown',
          row: row,
          col: col,
        });
      }
    });
  }
});

// Remove duplicate dependencies
const uniqueDependencies = [...new Set(dependencies)];

console.log('Dependencies of useEffect:', uniqueDependencies);
