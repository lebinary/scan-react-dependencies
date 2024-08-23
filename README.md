# UseEffect Scanner

## What does this do?
We all know it is not recommended to pass **an Object inside useEffect's dependency array**.

**Why?**\
Because React uses shallow comparison to determine if dependencies have changed. Objects are compared by reference, not by their content.\
This means that even if the object's contents haven't changed, React might treat it as a new dependency if it's recreated on each render.

**Solution:**\
This tool scan your files and returns those onjects that were passed in useEffect's dependency array.

## Getting started

### Install packages
Navigate to the project directory and run this in terminal
```bash
npm install
```

### Build the project
```bash
npm run build
```

### Start scanning for dependencies
```bash
npm run start -- "[Path to your file/directory]"
```
