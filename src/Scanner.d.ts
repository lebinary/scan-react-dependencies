export interface Dependency {
	[filePath: string]: DependencyItem[];
}

export interface DependencyItem {
	name: string;
	type: string;
	row: number;
}
