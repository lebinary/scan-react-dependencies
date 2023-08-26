import { Scanner } from "./Scanner";

export const main = async (): Promise<void> => {
	const fileExtensions = [".tsx"];
	const ignoreDirectories = ["node_modules"];
	const directoryPath =
		"/Users/user/Desktop/Personal Workspace/testing-scanner";

	const scanner = new Scanner(directoryPath, fileExtensions, ignoreDirectories);
	scanner.ready.then(() => {
		const dependencies = scanner.scanUseEffect();
		console.log(dependencies);
	});
};
main()
