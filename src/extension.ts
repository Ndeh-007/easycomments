// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below 
import { commands, window, env, ExtensionContext, TextEditor, extensions, workspace, Memento, Disposable } from 'vscode';
import { registerHover } from './actions/hover';
import { registerCommands } from './commands/commands';
import { LocalStorageService } from './components/storage';
import { Configuration } from './configuration/configuration';
import { canTranslateLanguage, filterLanguages } from './functions/filterLanguages';
import { registerHighlight } from './functions/highlightFunctions';
import { Parser } from './interfaces/Parser'; 
import { TranslateManager } from './translate/translateManager';

export let canLanguages = ["plaintext"];
export let userLanguage: string;
 
export async function activate(context: ExtensionContext) {


	let activeEditor: TextEditor;
	let configuration: Configuration = new Configuration();
	let parser: Parser = new Parser(configuration);


	let translateManager: TranslateManager = new TranslateManager(env.language);
	let storageManager = new LocalStorageService(context.workspaceState);

	let extractComments = function () {
		if (!activeEditor) { return; };

		if (!parser.supportedLanguage) { return; };

		parser.storeSingleLineComments(activeEditor);

		parser.storeBlockComments(activeEditor);

		parser.FindJSDocComments(activeEditor);

		parser.collectData();

		// parser.persistDataToStorage(activeEditor,storageManager);
	};

	let disposable = commands.registerCommand('easycomments.easycomments', () => {
		window.showInformationMessage('EasyComments Started');
	});

	// // filter for languages the extension can Translate
	// let grammarExtensions = filterLanguages(context);
	// let canTranslateLanguages = canTranslateLanguage(grammarExtensions, canLanguages);

	// // get the user's environment language
	// userLanguage = env.language;



	// Get the active editor for the first time and initialize the regex
	if (window.activeTextEditor) {
		activeEditor = window.activeTextEditor;

		await parser.setRegex(activeEditor.document.languageId);
		// Trigger first update of decorators
		triggerExtractComments();

		// register all commands, and highlights 
		registerHover(context, activeEditor.document.languageId, parser, translateManager, storageManager);
		// registerHighlight(context);

		registerCommands(context, translateManager);
  

		window.showInformationMessage("EasyComments extension launched");
	}

	// * Handle extensions being added or removed
	extensions.onDidChange(() => {
		configuration.UpdateLanguagesDefinitions();
	}, null, context.subscriptions);

	// * Handle active file changed
	window.onDidChangeActiveTextEditor(async editor => {
		if (editor) {
			activeEditor = editor;

			// Set regex for updated language
			await parser.setRegex(editor.document.languageId);

			// Trigger update to set decorations for newly active file
			triggerExtractComments();
		}
	}, null, context.subscriptions);

	// * Handle file contents changed
	workspace.onDidChangeTextDocument(event => {

		// Trigger updates if the text was changed in the same document
		if (activeEditor && event.document === activeEditor.document) {
			triggerExtractComments();
		}
	}, null, context.subscriptions);



	var timeout: NodeJS.Timer;

	function triggerExtractComments() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(extractComments, 100);
	}

	context.subscriptions.push(disposable, storageManager.clearStorageDisposabe());
}

// This method is called when extension is deactivated
export function deactivate() { }
