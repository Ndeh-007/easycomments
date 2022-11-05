import { TranslateManager } from "../translate/translateManager";
import { selectTranslateSource } from "./selectItem";

export async function changeTranslateSource( translateManager:TranslateManager){ 
    let targetLanguage:any = await selectTranslateSource();
    if(targetLanguage){ 
        translateManager.setTranslationSource(targetLanguage);
    }
}