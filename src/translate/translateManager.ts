import { deepLTranslate } from "./DeepLTranslate";
import { GoogleTranslate } from "./GoogleTranslate";
import * as deepl from 'deepl-node';
import { TextEditor } from "vscode";
import { ITranslationManagerOptions, ITranslationSource } from "../interfaces/interfaces";

export async function translateManager(content: string, translateSource: string, targetLanguage: string, commentType?: string) {


    return content;

    // first test if incoming text is block or JSDOC

   // remove all instances of * and // from the comments
    // if (commentType === "block") { 
    //     let jsDocReg = new RegExp("(\\@(.*))", "igm");
    //     let blockCommentReg = new RegExp("((\/\/|\\*|-) )", "igm");
    //     let blockSingleCommentReg = new RegExp("(\/\/)", 'igm');
    //     // do not translate the @return for JSDoc type of comments
    //     if (jsDocReg.test(content) || blockCommentReg.test(content)) {
    //         content = content.replace(/((\/\/|\*|-) )/gim, "");
    //         content = content.replace(/(\@(.*))/igm, "");
    //         content = content.substring(0, content.length - 1);
    //     } 
    // }
    if (translateSource === "google") {
        return await GoogleTranslate(content, targetLanguage);
    }
    if (translateSource === "deepL") {
        let t:any = targetLanguage;
        return await deepLTranslate(content, t);
    }
}


export class TranslateManager{
    /**
     * when extension is start for the first time, detect user language and check if it is part of target overlapping source languages
     * if it is part of overlapping source languages, set the target language to combine else set to google.
     * 
     * if at the first over the user's language is the same as the comment language, show option to target translation to another language and after that 
     * do not execute any other translations so as to sage api calls.
     * 
     * 
     */
    // the chosen source for translation
    private translationSource!: ITranslationSource;

    private setTranslationSource(source:"combined"|"deepL"|"google",url:string){
        this.translationSource = {
            source:source,
            url:url,
        };
    }

    public constructor(options:ITranslationManagerOptions){
        this.setTranslationSource(options.source,"");
    }

    public async translate(){

        return "";
    }
}