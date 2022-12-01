import { ExtensionContext, languages } from "vscode";
import { LocalStorageService } from "../components/storage";
import { tooltip } from "../components/tooltip";
import { Parser } from "../util/Parser";
import { TranslateManager } from "../translate/translateManager";

export function registerHover(context:ExtensionContext, canTranslateLanguages:string, parser:Parser, translateManager:TranslateManager, storageManager:LocalStorageService){
    let hoverProviderDisposable = languages.registerHoverProvider(canTranslateLanguages,{
       provideHover(document, position, token){
        return tooltip(document,position,token, parser, translateManager,storageManager);
       }
    });
    context.subscriptions.push(hoverProviderDisposable);
}