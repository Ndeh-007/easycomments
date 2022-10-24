import { ExtensionContext, extensions } from "vscode";
import { IGrammarExtensions, ITMLanguageExtensionPoint } from "../interfaces/interfaces";

export function filterLanguages(context: ExtensionContext, languageId:number = 2 ){
    let grammarExtensions: IGrammarExtensions[] = extensions.all.filter(({ packageJSON }) => {
        return packageJSON.contributes && packageJSON.contributes.grammars;
    }).map(({ packageJSON, extensionPath }) => {
        const contributesLanguages = packageJSON.contributes.languages || [];
        const languages: ITMLanguageExtensionPoint[] = contributesLanguages.map((item: any) => {
            return {
                id: languageId++,
                name: item.id
            };
        });
        return {
            languages,
            value: packageJSON.contributes.grammars,
            extensionLocation: extensionPath
        };
    });
    return grammarExtensions;
}

export function canTranslateLanguage(grammarExtensions:IGrammarExtensions[], canLanguages:string[]){
    canLanguages = grammarExtensions.reduce<string[]>(((prev, item) => {
        let lang:string[] = item.value.map((grammar) => grammar.language).filter(v => v);
        return prev.concat(lang);
    }), canLanguages);

    return canLanguages;
}