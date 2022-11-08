import * as deepl from 'deepl-node';
import { SourceLanguageCode } from 'deepl-node';

const authKey = "1c52c25f-ced3-818c-6fb6-59adec7100ea:fx";
const translator = new deepl.Translator(authKey);

async function translate(text: string, target: deepl.TargetLanguageCode, source: SourceLanguageCode | null = null) {
    try {
        //  escape the "//" characters so that the translator does not see it as you are omitting the text. I do not know why this is happening. but it works
        text = text.replace(/(\/\/)/gim, "\\/\\/");
        console.log(text, target);
        const result: deepl.TextResult = await translator.translateText(text, source, target);

        // restructure the results to show as proper text in the vs code hover tooltip
        let r1 = result.text.replace(/(\/\/)|((\\N-))/gm, "//");
        if (r1.match(/(\\\/\\\/)/g)) {
            return r1.replace("\\/\\/", "//"); 
        } else {
            return r1;
        }
    } catch (error) {
        return "DeepL Translation Error";
    }

}

export async function deepLTranslate(text: string, target: deepl.TargetLanguageCode, source: SourceLanguageCode | null = null) {
    return await translate(text, target, source);
}