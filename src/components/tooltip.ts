import { CancellationToken, comments, Hover, MarkdownString, Position, Range, TextDocument, TextLine } from 'vscode';
import { comment, userLanguage } from '../extension';
import { selectionContains } from '../functions/highlightFunctions';
import { CommentItem, IAcceptedLines, IGetRange, TranslationBlock } from '../interfaces/interfaces';
import { Parser } from '../interfaces/Parser';
import { translateManager } from '../translate/translateManager';
import { isCode } from '../util/string';


export async function tooltip(document: TextDocument, position: Position, token: CancellationToken, parser: Parser): Promise<Hover | null> {
    const translationSource = "[translationSource]";
    const translate = `[$(sync)](command:commentTranslate.changeTranslateSource "Change translate source")`;
    const pluginTitle = "Easy Comments";
    const space = '&nbsp;&nbsp;';
    const separator = `${space}|${space}`;
    const header: MarkdownString = new MarkdownString(`${pluginTitle}${space}${translate}${separator}${translationSource}`, true);

    header.isTrusted = true;
    let hoverLine = document.lineAt(position.line);
    let range = getRange(hoverLine, parser);
    let hoveredText = '';

    if (!range.state) { return null; }
    if (range.state) {
        hoveredText = document.getText(range?.result?.range);
    }

    let translationResult = await translateManager(hoveredText, "google", userLanguage);
    const translationBlock: TranslationBlock = {
        originalText: hoveredText,
        translatedText: translationResult as string,
    };
    let sentence =  `${translationBlock.originalText}`;

    let mdBody = new MarkdownString();
    mdBody.isTrusted = true;  
    mdBody.supportHtml= false;
    mdBody.appendText(sentence);
    mdBody.supportThemeIcons = true;

    const tooltipBody = new MarkdownString(`${translationBlock.originalText} => ${translationBlock.translatedText}`, true);
    tooltipBody.isTrusted = true;

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
