import os
import re
import sys

FILE_EXTENSIONS = ['.js', '.ts', 'tsx']
IGNORE_DIRECTORIES = ['node_modules'] 

def count_use_effect(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
        count = len(re.findall(r'\buseEffect\b', content))
        return count

def search_directory_for_js_files(directory_path):
    js_files = []
    for root, dirs, files in os.walk(directory_path):
        # filter out some directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRECTORIES]
        
        for file in files:
            if any(file.endswith(extension) for extension in FILE_EXTENSIONS):
                js_files.append(os.path.join(root, file))
    return js_files

def main():
    if len(sys.argv) != 2:
        print(len(sys.argv))
        print("Usage: python script_name.py /path/to/directory")
        
    directory_path = sys.argv[1]
    js_files = search_directory_for_js_files(directory_path)
    
    total_use_effect_count = 0
    for js_file in js_files:
        use_effect_count = count_use_effect(js_file)
        print(f"{js_file}: {use_effect_count} occurrences of 'useEffect'")
        total_use_effect_count += use_effect_count
    
    print(f"Total occurrences of 'useEffect' in all files: {total_use_effect_count}")

if __name__ == "__main__":
    main()
