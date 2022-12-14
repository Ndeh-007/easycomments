import { Range, TextEditor, TextLine } from "vscode";

export interface TranslationBlock {
    originalText: string,
    translatedText: string | undefined,
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

export interface IAcceptedLines {
    acceptedLines: TextLine[];
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
    ranges: Array<any>;
    range?: Range;
}

export interface CommentConfig {
    lineComment?: string;
    blockComment?: [string, string];
}

export interface CommentItem {
    type: string,
    text?: string,
    range: Range;
}

export interface StorageItem {
    editor: TextEditor;
    uri: string;
    data: (CommentItem | undefined)[];
}
export interface IGetRange {
    result: CommentItem | undefined,
    state: boolean
}

export interface ITranslationSource {
    source: "google" | "deepL" | "combined" | "microsoft";
    url: string;
}


export interface ITranslationManagerOptions {
    content: string;
    targetLanguage: string;
    source: "google" | "deepL" | "combined";
    activeEditor: TextEditor;
}

export interface ILanguagePair {
    language: string;
    code: string
}

export interface ISourceTranslatedContent {
    source:ISources
    targetLanguage: string;
}

export interface ISources{
    google: string;
    deepL: string;
    microsoft:string;
}

export interface ICorticalCompareMetric {
    cosineSimilarity: number,
    euclideanDistance: number,
    jaccardDistance: number,
    overlappingAll: number,
    overlappingLeftRight: number,
    overlappingRightLeft: number,
    sizeLeft: number,
    sizeRight: number,
    weightedScoring: number,
}

export interface ITranslationStorageItem{
    sourceLanguage:string; 
    translationSource:string | "google" | "deepL" | "combined";
    range:Range | undefined; 
    translationBlock:TranslationBlock;
    id:string|undefined;
}