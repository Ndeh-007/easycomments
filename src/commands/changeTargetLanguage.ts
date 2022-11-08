import { getConfiguration } from "../functions/configurations";
import { TranslateManager } from "../translate/translateManager";
import { selectTargetLanguage } from "./selectItem";

export async function changeTargetLanguage( translateManager:TranslateManager){
    let targetLanguage = await selectTargetLanguage(); 
    if(targetLanguage){ 
        translateManager.setTargetLanguage(targetLanguage);
    }
}