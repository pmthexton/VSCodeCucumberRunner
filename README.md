# Cucumber Code Lens provider

Provides in-line clickable links for running/debugging when editing Cucumber .feature files

## Limitations

* Due to there being so many different language implementations (both officially maintained and community provided), this extension requires you to already have a working setup in VSCode for running and debugging your cucumber tests.  The extension only provides the Code Lens in-line clickable links.
* The extension currently only recognises English language Gherkin verbs.

## Setup
### Define tasks to invoke cucumber

In order to provide a clickable link to run a given `Feature`, `Scenario[ Outline]`, you must first have a working entry in your workspace's `tasks.json` file.

When the extension launches the designated task it will first ensure that the cursor is set to the correct line in the open `.feature` file so that the task can access the correct line number when invoking cucumber.

For example, on a macOS host with `cucumber-ruby` installed globally via `gem`, the following tasks are defined

```javascript
{
    "version": "2.0.0",
    "tasks": [
         {
            "label": "Run Feature",
            "type": "shell",
            "command": [
                "/usr/local/bin/cucumber",
                "${relativeFile}"
            ],
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "showReuseMessage": false,
                "clear": true
            },
            "problemMatcher": []
        },
        {
            "label": "Run Scenario",
            "type": "shell",
            "command": [
                "/usr/local/bin/cucumber",
                "${relativeFile}:${lineNumber}"
            ],
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared",
                "showReuseMessage": false,
                "clear": true
            },
            "problemMatcher": []
        }
    ]
}
```

### Define debug launcher if required

If your chosen variant of Cucumber has language debugging support in VSCode, you can create debugging configurations in your workspace's `launch.json` file.  

For example, on a macOS host with `cucumber-ruby` installed globally via `gem`, along with `ruby-debug-ide` and `debase`, the following debug configurations are defined

```javascript
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Cucumber: Current File",
            "type": "Ruby",
            "request": "launch",
            "program": "/usr/local/bin/cucumber",
            "args": [
                "${relativeFile}"
            ],
            "cwd": "${workspaceFolder}",
            "env": {
                "Path": "/usr/local/bin",
                "GEM_HOME": "/Library/Ruby/Gems/2.6.0"
            },
            "showDebuggerOutput": true
        },
        {
            "name": "Cucumber: Current Scenario",
            "type": "Ruby",
            "request": "launch",
            "program": "/usr/local/bin/cucumber",
            "args": [
                "${relativeFile}:${lineNumber}"
            ],
            "cwd": "${workspaceFolder}",
            "env": {
                "Path": "/usr/local/bin",
                "GEM_HOME": "/Library/Ruby/Gems/2.6.0"
            },
            "showDebuggerOutput": true
        }
    ]
}

```

### Configuring CucumberRunner

Once you have your chosen tasks and debug configurations defined, you must inform this extension of the `label` or `name` of your implementations. The following settings can be provided to make use of the above examples for `tasks` and `debug configuration`

```javascript
{
    "cucumberRunner.scenarioTask": "Run Scenario",
    "cucumberRunner.scenarioLauncher": "Cucumber: Current Scenario",
    "cucumberRunner.featureTask": "Run Feature",
    "cucumberRunner.featureLauncher": "Cucumber: Current File"
}
```

## Release Notes

### 0.0.1

Initial release