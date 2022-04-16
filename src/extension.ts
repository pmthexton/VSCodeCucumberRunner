// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { config } from 'process';
import * as vscode from 'vscode';
import { ExtensionContext, languages, commands, Disposable, workspace, window } from 'vscode';
import { DebugConfigurationProvider } from 'vscode';
import { CodelensProvider } from './CodelensProvider';
import { CucumberRunnerOptions } from './runneroptions';

let disposables: Disposable[] = [];

type CucumberTasks = [scenario?: vscode.Task, feature?: vscode.Task];

async function getOptions(settings: vscode.WorkspaceConfiguration) {
	var options: CucumberRunnerOptions = [undefined, undefined, undefined, undefined];

	for(var task of await vscode.tasks.fetchTasks()) {
		if (task.name === settings.get("scenarioTask")) {
			options[0] = task;
		} else if (task.name === settings.get("featureTask")) {
			options[1] = task;
		}
	}

	if (settings.has("scenarioLauncher")) {
		options[2] = settings.get("scenarioLauncher")!;
	}
	if (settings.has("featureLauncher")) {
		options[3] = settings.get("featureLauncher")!;
	}

	return options;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const settings = vscode.workspace.getConfiguration("cucumberRunner");
	const options = await getOptions(settings);

	const codelensProvider = new CodelensProvider(options);
	languages.registerCodeLensProvider("*", codelensProvider);

	// This is an intermediary, simply set the cursor at the test's line position and then invoke
	// the already created task in the workspace
	// It may be possible to do this directly from the code lens rather than passing through to
	// this intermediate commmand?
	let taskRunner = vscode.commands.registerCommand("cucumberrunner.setLineAndRunTask", 
												async (line: number, task: vscode.Task) => {
		const editor = vscode.window.activeTextEditor;
		const position = editor?.selection.active;

		if (editor !== null && position !== null) {
			var newPosition = position?.with(line, 0);
			var newSelection = new vscode.Selection(newPosition!, newPosition!);
			editor!.selection = newSelection;
		}

		vscode.tasks.executeTask(task);
	});

	let debugLauncher = vscode.commands.registerCommand('cucumberrunner.setLineAndLaunchDbg', async (line: number, configuration: string) => {
		const editor = vscode.window.activeTextEditor;
		const position = editor?.selection.active;

		if (editor !== null && position !== null) {
			var newPosition = position?.with(line, 0);
			var newSelection = new vscode.Selection(newPosition!, newPosition!);
			editor!.selection = newSelection;
		}

		let dbg = await vscode.debug.startDebugging(vscode.workspace.workspaceFolders![0], configuration);
	});
	
	context.subscriptions.push(taskRunner, debugLauncher);

}

// this method is called when your extension is deactivated
export function deactivate() { }
