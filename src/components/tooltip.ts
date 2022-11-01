import { CancellationToken, comments, Hover, MarkdownString, Position, Range, TextDocument, TextLine } from 'vscode';
import { comment, userLanguage } from '../extension';
import { selectionContains } from '../functions/highlightFunctions';
import { IAcceptedLines, TranslationBlock } from '../interfaces/interfaces'; 
import { Parser } from '../interfaces/Parser';
import { translateManager } from '../translate/translateManager';
import { isCode } from '../util/string';


export async function tooltip(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | null> {
    const translationSource = "[translationSource]";
    const translate = `[$(sync)](command:commentTranslate.changeTranslateSource "Change translate source")`;
    const pluginTitle = "Easy Comments";
    const space = '&nbsp;&nbsp;';
    const separator = `${space}|${space}`;
    const header: MarkdownString = new MarkdownString(`${pluginTitle}${space}${translate}${separator}${translationSource}`, true);

    header.isTrusted = true; 
    // let range = getRange(document,position);
    let _range = document.lineAt(1).range;
    let parser = new Parser();
    // let result = parser.extractComments(document);
     

    console.log("Range:", _range);
    // let hoveredText = document.getText(_range);
    // let hoveredText = result;

    let translationResult = await translateManager("hoveredText", "google", userLanguage);
    const translationBlock: TranslationBlock = {
        originalText: "hoveredText",
        translatedText: translationResult as string,
    };

    const tooltipBody = new MarkdownString(`${translationBlock.originalText} => ${translationBlock.translatedText}`, true);
    tooltipBody.isTrusted = true;

    const hover = new Hover([header, tooltipBody], _range);

    return hover;
}

// get the lines above the current hovered line and return them in an array
function getUpperRanges(document: TextDocument, position: Position, startLine: number) {
    let currentLine = document.lineAt(startLine);
    let nextLine = document.lineAt(currentLine.lineNumber - 1);
    let acceptedLines: TextLine[] = [];

    while (true) { 
        if (isCode(currentLine.text) === false) {
            acceptedLines.push(currentLine);
            currentLine = nextLine;
            nextLine = document.lineAt(currentLine.lineNumber - 1);
        } else {
            break;
        }
    }

    let range = new Range(acceptedLines[0].range.start, acceptedLines[acceptedLines.length - 1].range.end);
    let collectedLineData: IAcceptedLines = {
        acceptedLines: acceptedLines.reverse(),
        entireRange: range,
    }; 
    return collectedLineData;
}

// get the lines below the current hovered line and return them in an array
function getLowerRanges(document: TextDocument, position: Position, startLine: number) {
    let currentLine = document.lineAt(startLine);
    let nextLine = document.lineAt(currentLine.lineNumber + 1);
    let acceptedLines: TextLine[] = [];  
  
    while (true) { 
        if (isCode(currentLine.text) === false) {
            acceptedLines.push(currentLine);
            currentLine = nextLine;
            nextLine = document.lineAt(currentLine.lineNumber + 1);
        } else {
            break;
        }
    }

    let range = new Range(acceptedLines[0].range.start, acceptedLines[acceptedLines.length - 1].range.end); 

    let collectedLineData: IAcceptedLines = {
        acceptedLines: acceptedLines,
        entireRange: range,
    };

    return collectedLineData;
}


function getRange(document: TextDocument, position: Position) {
    let startLine = document.lineAt(position.line);
    let upperLines = getUpperRanges(document, position, startLine.lineNumber); 
    let lowerLines = getLowerRanges(document, position, startLine.lineNumber);  
    console.log(lowerLines);
    let chosenRange = [...upperLines.acceptedLines, ...lowerLines.acceptedLines]; 
    return chosenRange;
}


