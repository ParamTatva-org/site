"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    console.log('Sanskriti VS Code Extension is now active!');
    // 1. Install Toolchain Command
    let installDisposable = vscode.commands.registerCommand('sanskriti.installToolchain', () => {
        const terminal = vscode.window.createTerminal('Sanskriti Installer');
        terminal.show();
        terminal.sendText('curl -sSL https://raw.githubusercontent.com/ParamTatva-org/site/main/tools/install.sh | bash');
    });
    // 2. Build Sanskriti File Command
    let buildDisposable = vscode.commands.registerCommand('sanskriti.buildSanskriti', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to build.');
            return;
        }
        const document = editor.document;
        if (document.isDirty) {
            vscode.window.showWarningMessage('Please save the file before building.');
            return;
        }
        const terminal = vscode.window.createTerminal('Sanskriti Build');
        terminal.show();
        terminal.sendText(`sanskriti build "${document.fileName}"`);
    });
    // 3. Run Sassembly in Yantra Command
    let runDisposable = vscode.commands.registerCommand('sassembly.runYantra', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active file to run.');
            return;
        }
        const document = editor.document;
        if (document.isDirty) {
            vscode.window.showWarningMessage('Please save the file before running.');
            return;
        }
        // Ensure it has a .sas extension
        if (!document.fileName.endsWith('.sas')) {
            vscode.window.showWarningMessage('This command is for Sassembly (.sas) files.');
            return;
        }
        const terminal = vscode.window.createTerminal('Sassembly Run');
        terminal.show();
        terminal.sendText(`sadhana "${document.fileName}" && yantra "${document.fileName.replace('.sas', '')}"`);
    });
    context.subscriptions.push(installDisposable, buildDisposable, runDisposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map