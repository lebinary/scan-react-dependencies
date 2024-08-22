import { Scanner } from "./Scanner";

export const main = async (): Promise<void> => {
	const fileExtensions = [".tsx"];
	const ignoreDirectories = ["node_modules"];

  // Get the directory path from command line arguments
  const directoryPath = process.argv[2];

  if (!directoryPath) {
    console.error("Please provide a directory path as an argument.");
    process.exit(1);
  }

	const scanner = new Scanner(directoryPath, fileExtensions, ignoreDirectories);
	scanner.ready.then(() => {
		const dependencies = scanner.scanUseEffect();
		console.log(dependencies);
	});
};
main()
