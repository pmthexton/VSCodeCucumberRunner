import { config } from 'process';
import * as vscode from 'vscode';
import { CucumberRunnerOptions } from './runneroptions';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private scenarioRegex: RegExp;
    private runnerOptions: CucumberRunnerOptions;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor(options: CucumberRunnerOptions) {
        this.scenarioRegex = /Scenario( Outline)?:/g;
        this.runnerOptions = options;

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    private pushRunTask(title: string, range: vscode.Range, line: number, task: vscode.Task) {
        let runTest = new vscode.CodeLens(range);
        runTest.command = {
            title: title,
            tooltip: title,
            command: "cucumberrunner.setLineAndRunTask",
            arguments: [line, task]
        };
        this.codeLenses.push(runTest);
    }

    private pushRunDebugger(title: string, range: vscode.Range, line: number, configuration: string) {
        let debugTest = new vscode.CodeLens(range);
        debugTest.command = {
            title: title,
            tooltip: title,
            command: "cucumberrunner.setLineAndLaunchDbg",
            arguments: [line, configuration]
        };
        this.codeLenses.push(debugTest);
    }

    private registerScenarios(document: vscode.TextDocument) {
        const findScenario = new RegExp(this.scenarioRegex);
        const text = document.getText();
        let matches;

        while ((matches = findScenario.exec(text)) !== null) {
            const line = document.lineAt(document.positionAt(matches.index).line);
            const indexOf = line.text.indexOf(matches[0]);
            const position = new vscode.Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position, new RegExp(this.scenarioRegex));
            if (range) {
                if (this.runnerOptions[0] !== undefined) {
                    this.pushRunTask("Run Scenario", range, line.lineNumber, this.runnerOptions[0]);
                }

                // Checking for both undefined and empty string isn't very elegant.
                if (this.runnerOptions[2] !== undefined && this.runnerOptions[2] !== "") {
                    this.pushRunDebugger("Debug Scenario", range, line.lineNumber, this.runnerOptions[2]);
                }
            }
        }
    }

    private registerFeature(document: vscode.TextDocument) {
        // Still using regex's as a bit of a hacky way to ensure
        // we don't register code lenses until they've added the
        // Feature: header to a file.
        const findFeature = new RegExp(/Feature: /g);
        const text = document.getText();
        let matches;

        while ((matches = findFeature.exec(text)) !== null) {
            const line = document.lineAt(document.positionAt(matches.index).line);
            const indexOf = line.text.indexOf(matches[0]);
            const position = new vscode.Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position, new RegExp(/Feature: /g));
            if (range) {
                if (this.runnerOptions[1] !== undefined) {
                    this.pushRunTask("Run Feature", range, line.lineNumber, this.runnerOptions[1]);
                }

                if (this.runnerOptions[3] !== undefined && this.runnerOptions[3] !== "") {
                    this.pushRunDebugger("Debug Feature", range, line.lineNumber, this.runnerOptions[3]);
                }
            }
        }
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        this.codeLenses = [];

        this.registerFeature(document);
        this.registerScenarios(document);

        return this.codeLenses;
    }

}