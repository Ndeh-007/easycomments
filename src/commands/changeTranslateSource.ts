import { TranslateManager } from "../translate/translateManager";
import { selectTranslateSource } from "./selectItem";

export async function changeTranslateSource( translateManager:TranslateManager){ 
    let translationSource:any = await selectTranslateSource(); 
    if(translationSource){ 
        translateManager.setTranslationSource(translationSource);
    }
}