import { GoogleTranslate } from "./GoogleTranslate";

export async function translateManager(content: string, translateSource:string, targetLanguage:string){
    if(translateSource ==="google"){
        // TODO execute google translate
        return await GoogleTranslate(content,targetLanguage);
    }
    if(translateSource ==="deepL"){
        // execute deepL Translate

    }
}