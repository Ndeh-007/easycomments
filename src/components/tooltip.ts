import { CancellationToken, comments, Hover, MarkdownString, Position, Range, TextDocument, TextLine } from 'vscode';
import { comment, userLanguage } from '../extension';
import { selectionContains } from '../functions/highlightFunctions';
import { CommentItem, IAcceptedLines, IGetRange, TranslationBlock } from '../interfaces/interfaces';
import { Parser } from '../interfaces/Parser';
import { TranslateManager } from '../translate/translateManager';
import { isCode } from '../util/string';


export async function tooltip(document: TextDocument, position: Position, token: CancellationToken, parser: Parser, translateManager:TranslateManager): Promise<Hover | null> {
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

    if (!range.state) {   return null; }
    if (range.state) {
        hoveredText = document.getText(range?.result?.range);
    }
    // remove all text after the @ sign
    const returnString:string = hoveredText.substring(hoveredText.indexOf("@"), hoveredText.length);
    hoveredText = hoveredText.replace(/(\@(.*))/igm, "");
    let translationResult = await translateManager.translate(hoveredText);
    const translationBlock: TranslationBlock = {
        originalText: hoveredText,
        translatedText: (translationResult?.length !== 0)?translationResult as string:"translating...",
    };
 

    // append the required characters to replicate the highlighted text
    if(range.result?.type === 'block'){
        let start = '/**\n';
        let end = " " + returnString + '\n */';
        translationBlock.translatedText = start + translationBlock.translatedText + end;
    }

    let sentence =  `${translationBlock.translatedText}`;
    
    const codeDefine = '```';
    const markDownContent = `${codeDefine}\n${sentence}\n ${codeDefine}`; 
    let mdBody = new MarkdownString(markDownContent,true);    

    const hover = new Hover([header, mdBody], range?.result?.range);
 
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
