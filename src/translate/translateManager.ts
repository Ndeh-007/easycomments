import { deepLTranslate } from "./DeepLTranslate";
import { GoogleTranslate } from "./GoogleTranslate";
import * as deepl from "deepl-node";
import { env, TextEditor } from "vscode";
import {
    ILanguagePair,
    ITranslationManagerOptions,
    ITranslationSource,
} from "../interfaces/interfaces";
import { DEEPL_LANGUAGES, LANGUAGES } from "../components/langauges";
 

export class TranslateManager {

    /**
     * when extension is start for the first time, detect user language and check if it is part of target overlapping source languages
     * if it is part of overlapping source languages, set the target language to combine else set to google.
     *
     * if at the first over the user's language is the same as the comment language, show option to target translation to another language and after that
     * do not execute any other translations so as to save api calls.
     *
     * get translation source for settings/config file if changed
     */
    // the chosen source for translation


    // Start Private Region

    private translationSource: ITranslationSource = {
        source:"google",
        url:""
    };
    private targetLanguage: string = env.language;
	private overLappingLanguages:ILanguagePair[] = [];
    private isOverlap:boolean = false;


    // check if the current target language exists in overlap
    private isOverlapping(target:string, pool:ILanguagePair[]){
         for(let i=0;i<pool.length; i++){
            if(pool[i].code.includes(target)){
                this.isOverlap = true;
                break;
            }
        }; 
    }

    private setOverLappingLanguages(){
        let googleLang = LANGUAGES;
        let deeplLang = DEEPL_LANGUAGES;

        let overLap =  googleLang.text.map((lang,index)=>{ 
            if(deeplLang.includes(lang.language))
            {
                return lang;
            }
        });
        return overLap.filter(item=>item!==undefined);
    }

    

    private async compareTranslation(content: string, targetLanguage: string) {
        return "combined results "+this.targetLanguage;
    }

    // end region

    // Public Region starts here 
    public constructor(targetLanguage:string) {
        this.setTargetLanguage(targetLanguage);
        this.overLappingLanguages =  this.setOverLappingLanguages() as ILanguagePair[];            
        this.isOverlapping(this.targetLanguage, this.overLappingLanguages);
        this.setTranslationSource("combined");
    }

    public async translate(content: string) { 
        let source = this.translationSource.source;
        if (source === "google") {
            return "google:"+this.targetLanguage;
            return await GoogleTranslate(content, this.targetLanguage);
        }
        if (source === "deepL" && this.isOverlap) {
            return "deepL:"+this.targetLanguage;
            let t: any = this.targetLanguage;
            return await deepLTranslate(content, t);
        }
        if (source === "combined" && this.isOverlap) {
            return "combined + " + await this.compareTranslation(content,this.targetLanguage) ;
            let result = await this.compareTranslation(content, this.targetLanguage);
            return result;
        }

    }

    public setTargetLanguage(target: string) {
        this.targetLanguage = target;
        
        // do not force user to use combined mode
        // when the target language is changed. after initialization of the class in the beginning
        // if(this.overLappingLanguages.length>0){
        //     this.isOverlapping(this.targetLanguage,this.overLappingLanguages);
        // }
    }

    public getTargetLanguage() {
        return this.targetLanguage;
    }

    public getTargetLanguagePair(){
       return LANGUAGES.text.filter(item=>item.code === this.targetLanguage)[0];
    }
    
    public setTranslationSource( source: "combined" | "deepL" | "google", url: string="" ) {
        this.translationSource = {
            source: source,
            url: url,
        };
    }

    public getTranslationSource(){
        return this.translationSource;
    }

}
