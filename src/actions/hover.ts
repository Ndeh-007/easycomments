import { ExtensionContext, languages } from "vscode";
import { tooltip } from "../components/tooltip";
import { Parser } from "../interfaces/Parser";
import { TranslateManager } from "../translate/translateManager";

export function registerHover(context:ExtensionContext, canTranslateLanguages:string, parser:Parser, translateManager:TranslateManager){
    let hoverProviderDisposable = languages.registerHoverProvider(canTranslateLanguages,{
       provideHover(document, position, token){
        return tooltip(document,position,token, parser, translateManager);
       }
    });
    context.subscriptions.push(hoverProviderDisposable);
}