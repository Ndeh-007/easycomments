import { ExtensionContext, languages } from "vscode";
import { tooltip } from "../components/tooltip";
import { Parser } from "../interfaces/Parser";

export function registerHover(context:ExtensionContext, canTranslateLanguages:string, parser:Parser){
    let hoverProviderDisposable = languages.registerHoverProvider(canTranslateLanguages,{
       provideHover(document, position, token){
        return tooltip(document,position,token, parser);
       }
    });
    context.subscriptions.push(hoverProviderDisposable);
}