import * as deepl from 'deepl-node'; 

const authKey = "1c52c25f-ced3-818c-6fb6-59adec7100ea:fx";
const translator = new deepl.Translator(authKey);

async function translate(text: string, target: deepl.TargetLanguageCode) {
    try {  
        const result:deepl.TextResult = await translator.translateText(text, null, target);
        return result.text;
    } catch (error) {
        console.log(error);
        return "DeepL Translation Error";
    }

}

export async function deepLTranslate(text: string, target: deepl.TargetLanguageCode) {
    return await translate(text,target);
}