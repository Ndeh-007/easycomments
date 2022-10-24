import { CancellationToken, Hover, MarkdownString, Position, TextDocument } from 'vscode';
import { userLanguage } from '../extension';
import { TranslationBlock } from '../interfaces/interfaces';
import { translateManager } from '../translate/translateManager';

export async function tooltip(document:TextDocument, position:Position, token:CancellationToken): Promise<Hover> {
    const translationSource = "[translationSource]";
    const translate = `[$(sync)](command:commentTranslate.changeTranslateSource "Change translate source")`; 
    const pluginTitle = "Easy Comments";
    const space = '&nbsp;&nbsp;';
    const separator = `${space}|${space}`;
    const header:MarkdownString = new MarkdownString(`${pluginTitle}${space}${translate}${separator}${translationSource}`,true);

    header.isTrusted = true;
    
    let _range = document.getWordRangeAtPosition(position);
    let hoveredText = document.getText(_range);

    let translationResult = await translateManager(hoveredText, "google", userLanguage);
    const translationBlock:TranslationBlock={
        originalText:hoveredText,
        translatedText: translationResult as string,
    };

    const tooltipBody= new MarkdownString(`${translationBlock.originalText} => ${translationBlock.translatedText}`,true);
    tooltipBody.isTrusted = true;
    
    const hover = new Hover([header,tooltipBody],_range);

    return hover;
}