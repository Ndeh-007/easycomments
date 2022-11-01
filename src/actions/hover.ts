import { ExtensionContext, languages } from "vscode";
import { tooltip } from "../components/tooltip";

export function registerHover(context:ExtensionContext, canTranslateLanguages:string[]){
    let hoverProviderDisposable = languages.registerHoverProvider(canTranslateLanguages,{
       provideHover(document, position, token){
        return tooltip(document,position,token);
       }
    });
    context.subscriptions.push(hoverProviderDisposable);
}