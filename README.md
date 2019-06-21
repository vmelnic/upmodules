# upmodules

Install npm modules and manipulate files of Node.js modules after installation.

Inspired from https://www.npmjs.com/package/postinstall module.

## Usage

Install `upmodules` package: `npm install upmodules --save`

Declare `upmodules` script in package.json:

    {
      "name": "mypkg",
      "version": "1.0.0",
      "dependencies": {
        "upmodules": "*"
      },
      "scripts": {
        "postinstall": "upmodules"
      }
    }

It is also possible to configure `upmodules` in another json file:

    {
      "scripts": {
        "postinstall": "upmodules myconfig.json"
      }
    }

`myconfig.json` file example:

    "upmodules": {
        "some-npm-package": {
          "command": "npm",
          "output": "./custom_directory",
          "repository": "some-npm-package"
        }
    }

## Syntax

### Short form

    upmodules: {
        "<module>/<input>": "<command> --<option>=<value> <output>"
    }

### Long form

    upmodules: {
        "<module>/<input>": {
            "command": "<command>",
            "output": "<output>",
            "<option>": "<value>"
        }
    }

`input` can be a path, with an optional star in its filename or npm module.

`command` default available commands: copy, link (cross-platform), move, symlink, npm.

`output` can be a path, with an optional star in its filename.


## Custom commands

New commands can be added to `upmodules` and they just need to be available
as `upmodules-<command>` modules exporting a single function:

    module.exports = function(inputs, output, options) {
        // inputs is an array of paths
        // output is a path
        // options is an object (possibly empty)
        // can return promise
    };

Bundled commands: copy, link (cross-platform), move, symlink, npm.
