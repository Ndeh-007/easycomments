import { Range, TextLine } from "vscode";

export interface TranslationBlock{
    originalText: string,
    translatedText:string,
}

export interface IGrammarExtensions {
    value: ITMSyntaxExtensionPoint[];
    extensionLocation: string;
    languages: ITMLanguageExtensionPoint[];
}

export interface ITMSyntaxExtensionPoint {
    language: string;
    scopeName: string;
    path: string;
    embeddedLanguages: IEmbeddedLanguagesMap;
    tokenTypes: TokenTypesContribution;
    injectTo: string[];
}
 
export interface TokenTypesContribution {
    [scopeName: string]: string;
}

export interface IEmbeddedLanguagesMap {
    [scopeName: string]: string;
}

export interface ITMLanguageExtensionPoint {
    id: number;
    name: string;
}

export interface ICommentBlock {
	humanize?: boolean;
	range: Range;
	comment: string;
	tokens?: ICommentToken[];
}

export interface ICommentToken {
	ignoreStart?: number;
	ignoreEnd?: number;
	text: string;
	scope: IScopeLen[];
}

interface IScopeLen {
	scopes: string[];
	len: number;
}

export interface ITranslatedText {
	translatedText: string;
	humanizeText?: string;
	translateLink: string;
}

export interface IAcceptedLines{
    acceptedLines:TextLine[];
    entireRange: Range;
}
export interface Contributions {
    multilineComments: boolean;
    useJSDocStyle: boolean;
    highlightPlainText: boolean;
    tags: [{
        tag: string;
        // color: string;
        // strikethrough: boolean;
        // underline: boolean;
        // bold: boolean;
        // italic: boolean;
        // backgroundColor: string;
    }];
}

export interface CommentTag {
    tag: string;
    escapedTag: string;
    decoration: any;
    ranges: Array<any>;
}

export interface CommentConfig {
    lineComment?: string;
    blockComment?: [string, string];
}