# fdlt

**A lightweight tool for forcefully deleting files and directories, even when they are locked or in use. Supports recursive deletion on both Windows and Unix-like systems.**

---

## Features

- Delete files that may be locked by other processes (Windows / Linux / macOS).  
- Recursive deletion of directories and their contents. 

---

## Installation

Globally (recommended)

```bash
npm install -g fdlt
```

> If installing from a local `.tgz` package:

```bash
npm install -g ./fdlt-1.0.0.tgz
```

Make sure your global npm bin folder is in your PATH to use `fdlt` from anywhere.

---

## Prerequisites

[Handle](https://learn.microsoft.com/de-de/sysinternals/downloads/handle) must be installed on Windows.


## Usage

```text
USAGE:
        fdlt [FLAG] <path>

FLAGS:
        -h, --help              Prints help information
        -v, --version           Prints the fdlt version
        -r, -R, --recursive     Remove directories and their contents recursively
```

## Examples

Delete a single file:

```bash
fdlt C:\file.txt
```

Delete a directory and its contents recursively:

```bash
fdlt -r C:\my-folder
```
