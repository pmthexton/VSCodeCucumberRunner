import * as vscode from 'vscode';

export type CucumberRunnerOptions = [runscenario?: vscode.Task,
	runfeature?: vscode.Task,
	debugscenario?: string,
	debugsfeature?: string];