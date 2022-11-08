import { TranslateManager } from "../translate/translateManager";
import { selectTranslateSource } from "./selectItem";

export async function changeTranslateSource( translateManager:TranslateManager){ 
    let translationSource:any = await selectTranslateSource();
    console.log(translationSource);
    if(translationSource){ 
        translateManager.setTranslationSource(translationSource);
    }
}