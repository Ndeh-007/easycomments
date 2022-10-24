// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below 
import {commands,window, env, ExtensionContext} from 'vscode';
import { registerHover } from './actions/hover';
import { canTranslateLanguage, filterLanguages } from './functions/filterLanguages';

export let canLanguages = ["plaintext"];
export let userLanguage:string; 

export async function activate(context: ExtensionContext) { 

	let disposable = commands.registerCommand('easycomments.easycomments', () => { 
		window.showInformationMessage('EasyComments Started');
	});

	// filter for languages the extension can Translate
	let grammarExtensions = filterLanguages(context); 
	let canTranslateLanguages = canTranslateLanguage(grammarExtensions,canLanguages);
	
	// get the user's environment language
	userLanguage = env.language;

	// register actions: hover, highlight && all commands
	registerHover(context,canTranslateLanguages);

	context.subscriptions.push(disposable);
}

// This method is called when extension is deactivated
export function deactivate() {}
