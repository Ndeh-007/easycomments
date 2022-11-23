import { CancellationToken, comments, Hover, MarkdownString, Position, Range, TextDocument, TextLine } from 'vscode'; 
import { selectionContains } from '../functions/highlightFunctions';
import { CommentItem, IAcceptedLines, IGetRange, ITranslationStorageItem, TranslationBlock } from '../interfaces/interfaces';
import { Parser } from '../interfaces/Parser';
import { TranslateManager } from '../translate/translateManager';
import { isCode } from '../util/string';
import { LocalStorageService } from './storage';


export async function tooltip(document: TextDocument, position: Position, token: CancellationToken, parser: Parser, translateManager: TranslateManager, storageManager: LocalStorageService): Promise<Hover | null> {
    const translationSource = `[${translateManager.getTranslationSource().source}](command:easycomments.changeTranslateSource "Change translate source")`;
    const targetLang = `[${translateManager.getTargetLanguagePair().language}](command:easycomments.changeTargetLanguage "Change target language")`;
    // const translate = `[$(sync)](command:commentTranslate.changeTranslateSource "Change translate source")`;
    const pluginTitle = "Easy Comments";
    const space = '&nbsp;&nbsp;';
    const separator = `${space}|${space}`;
    const header: MarkdownString = new MarkdownString(`${pluginTitle}${space}${separator}${targetLang}${separator}${translationSource}`, true);

    header.isTrusted = true;
    let hoverLine = document.lineAt(position.line);
    let range = getRange(hoverLine, parser);
    let hoveredText = '';

    if (!range.state) { return null; }

    if (!range.result?.range) { return null; }
 
    // get hovered text from the document
    hoveredText = document.getText(range?.result?.range);
    
    const codeDefine = '```';

    // check if the line or lines of text is code, and do not begin translation works
    if(isCode(hoveredText)){
        let md =  new MarkdownString(codeDefine + "\n" + hoveredText + "\n" + codeDefine);
        md.isTrusted = true;
        const hover = new Hover([header,md], range.result.range);
        return hover;
    }


    // create id for item 
    let _sourceLanguage = translateManager.getTargetLanguage();
    let _translationSource = translateManager.getTranslationSource().source;
    let _id = range.result?.range.start.character.toString() + range.result?.range.end.character.toString() + _sourceLanguage + _translationSource;

    
    // check if item is in storage and return translation for the exact parameters
    const itemFromStorage = storageManager.getValue<any>(_id);
    let storageHover:Hover = new Hover();
    if (itemFromStorage) { 
        let jsonItemFromStorage: ITranslationStorageItem = JSON.parse(itemFromStorage);
        let md = new MarkdownString(codeDefine +"\n" + jsonItemFromStorage.translationBlock.translatedText +"\n" + codeDefine, true);
        md.isTrusted = true;
        const hover = new Hover([header, md], range.result.range);
        storageHover = hover;
        console.log("file exsit, translation terminated. returning data stored from db");
        return hover;
    } 
    console.log("file does not exist but area is in range, translation continued. returning data stored from db");

    // remove all text after the @ sign
    const returnString: string = hoveredText.substring(hoveredText.indexOf("@"), hoveredText.length);
    hoveredText = hoveredText.replace(/(\@(.*))/igm, "");
    let translationResult = await translateManager.translate(hoveredText);
    const translationBlock: TranslationBlock = {
        originalText: hoveredText,
        translatedText: (translationResult?.length !== 0) ? translationResult as string : "translating...",
    };

    // append the required characters to replicate the highlighted text
    if (range.result?.type === 'block') {
        let start = '/**\n';
        let end = " " + returnString + '\n */';
        translationBlock.translatedText = start + translationBlock.translatedText + end;
    }


    // persist translation to storage.
    // collect the translation items
    const storageItem: ITranslationStorageItem = {
        sourceLanguage: _sourceLanguage,
        translationBlock,
        range: range.result?.range,
        translationSource: _translationSource,
        id: _id,
    };

    // store current translation
    storageManager.setValue(_id, JSON.stringify(storageItem));

    // create markdown body for the tooltip to display the results 
    let sentence = `${translationBlock.translatedText}`;
    const markDownContent = `${codeDefine}\n${sentence}\n ${codeDefine}`;
    let mdBody = new MarkdownString(markDownContent, true);


    // create hover item
    const hover = new Hover([header, mdBody], range.result.range);

    if(storageHover){

    }

    return hover;
}


// Get the hover range
function getRange(hoverLine: TextLine, parser: Parser) {
    let comments = parser.getTotalComments();
    let res: IGetRange = {
        state: false,
        result: undefined,
    };

    for (let i = 0; i < comments.length; i++) {
        if (comments[i]?.range.contains(hoverLine.range)) {
            res.result = comments[i];
            res.state = true;
            break;
        }
    }

    return res;
}
