import { ExtensionContext, Position, TextDocument, window } from "vscode";
import { ICommentBlock, ICommentToken, ITranslatedText } from "../interfaces/interfaces";
import humanizeString from 'humanize-string';
import { hasEndMark, isLowerCase, isUpperCase } from "../util/string";
import { getConfig } from "./configurations";
import { userLanguage } from "../extension";
import { translateManager } from "../translate/translateManager";


export function getHoverRange(document:TextDocument){
    // let textDoc = document.g
}

function selectionContains(url: string, position: Position): ICommentBlock | null {
	let editor = window.activeTextEditor; 

	if (editor && editor.document.uri.toString() === url) { 

		let selection = editor.selections.find((selection) => {
			return !selection.isEmpty && selection.contains(position);
		});

		if (selection) {
			return {
				range: selection,
				comment: editor.document.getText(selection)
			};
		}
	}

	return null;
}


function ignoreStringTag(tokens: ICommentToken[], regular: string) {
	// const regular = '[\\*\\s]+';
	if (regular) {
		return tokens.map(item => {
			let { ignoreStart = 0, ignoreEnd = 0, text } = item;
			const validText = text.slice(ignoreStart, text.length - ignoreEnd);
			let match = validText.match('^' + regular);
			if (match && match.length) {
				ignoreStart += match[0].length;
			}
			item.ignoreStart = ignoreStart;
			return item;
		});
	}
	return tokens;
}

// Convert a camelized/dasherized/underscored string into a humanized one 
function humanize(originText: string) {
	const needHumanize = originText.trim().indexOf(' ') < 0;
	if (needHumanize) { 
		return humanizeString(originText);
	}
	return '';
}

function combineLine(texts:string[]) {
	let combined: boolean[] = [];  
	let combinedTexts =  texts.reduce<string[]>((prev, curr, index) => {
		let lastIndex = combined.lastIndexOf(false);
		combined[index] = false;
		if (prev.length > 0) {
			let last = prev[lastIndex];
			if (isUpperCase(last) && hasEndMark(last) && isLowerCase(curr)) {
				 
				prev[lastIndex] = last + ' ' + curr;
				 
				curr = '';
				combined[index] = true;
			}
		}
		prev.push(curr);
		return prev;
	}, []);

	return {combined, combinedTexts};
}

function getIgnoreRegular(languageId:string) {
	const ignore = getConfig<{languageId:string,regular:string}[]>('ignore');
	if(!ignore){ return '';};
	let {regular=''} = ignore.find(item=>{
		return item.languageId.split(',').some((text=>text.trim()===languageId));
	}) || {};
	return regular;
}

export async function compileBlock(block:ICommentBlock,languageId:string,targetLanguage?:string): Promise<ITranslatedText> {

	let translatedText: string;
	let humanizeText: string = '';
	const { comment: originText } = block;
	let { tokens } = block;

	targetLanguage = targetLanguage || getConfig<string>('targetLanguage', userLanguage);
	if (!tokens) { 
		humanizeText = humanize(originText);
		translatedText = await translateManager(humanizeText||originText, "google", targetLanguage as string) as string;
	} else { 
		let regular = getIgnoreRegular(languageId);
		if(regular) {
			tokens = ignoreStringTag(tokens,regular);
		}
 
		let texts = tokens.map(({ text, ignoreStart = 0, ignoreEnd = 0 }) => {
			return text.slice(ignoreStart, text.length - ignoreEnd).trim();
		});
 
		let combined: boolean[] = [];  
		if (getConfig<boolean>('multiLineMerge')) {
			let res = combineLine(texts);
			combined = res.combined;
			texts = res.combinedTexts;
		}
 
		let validTexts = texts.filter(text => {
			return text.length > 0;
		});
		let validText = validTexts.join('\n');
		let validTextLen = validText.length;
		 
		if (validTextLen === 0) {
			translatedText = originText;
		} else { 
			if (tokens.length === 1) {
				humanizeText = humanize(validText);
			}
			translatedText = await translateManager(humanizeText||originText, "google", targetLanguage as string) as string;
 
			let targets = translatedText.split('\n');
			if (translatedText && validTexts.length === targets.length) {
				let translated = [];
				for (let i = 0, j = 0; i < tokens.length; i++) {
					const { text, ignoreStart = 0, ignoreEnd = 0 } = tokens[i];
					const translateText = texts[i];
					let targetText = '';
					if (translateText.length > 0) {
						targetText = targets[j];
						j += 1;
					} 
					if (targetText === '' && combined[i]) {
						continue;
					}
					const startText = text.slice(0, ignoreStart);
					const endText = text.slice(text.length - ignoreEnd);
					translated.push(startText + targetText + endText);
				}
				translatedText = translated.join('\n');
			}
		}
	}

	return {
		translatedText,
		humanizeText,
		translateLink: "translateManager.link(humanizeText || originText, { to: targetLanguage })"
	};
}