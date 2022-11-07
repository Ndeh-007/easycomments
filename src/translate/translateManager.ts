import { deepLTranslate } from "./DeepLTranslate";
import { GoogleDetectLanguage, GoogleTranslate } from "./GoogleTranslate";
import * as deepl from "deepl-node";
import { env, TextEditor } from "vscode";
import {
  ILanguagePair,
  ISourceTranslatedContent,
  ITranslationManagerOptions,
  ITranslationSource,
} from "../interfaces/interfaces";
import { DEEPL_LANGUAGES, LANGUAGES } from "../components/langauges";
import { TargetLanguageCode } from "deepl-node";
import { DetectResult } from "@google-cloud/translate/build/src/v2";
import * as Grammarly from "@grammarly/sdk";
import { scoreTranslation } from "./ScoreTranslations";



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
    source: "google",
    url: "",
  };
  private targetLanguage: string = env.language;
  private overLappingLanguages: ILanguagePair[] = [];
  private isOverlap: boolean = false;
  private grammarly:Grammarly.SDK = "" as any;

  // check if the current target language exists in overlap
  private isOverlapping(target: string, pool: ILanguagePair[]) {
    for (let i = 0; i < pool.length; i++) {
      if (pool[i].code.includes(target)) {
        this.isOverlap = true;
        break;
      }
    }
  }

  private setOverLappingLanguages() {
    let googleLang = LANGUAGES;
    let deeplLang = DEEPL_LANGUAGES;

    let overLap = googleLang.text.map((lang, index) => {
      if (deeplLang.includes(lang.language)) {
        return lang;
      }
    });
    return overLap.filter((item) => item !== undefined);
  }

  private async compareTranslation(content: string, targetLanguage: string) {
    let google = await GoogleTranslate(content, targetLanguage);
    let _deepLTargetLanguage: TargetLanguageCode = targetLanguage as any;
    if (targetLanguage === "en") {
      _deepLTargetLanguage = "en-GB";
    }
    let deepL = await deepLTranslate(content, _deepLTargetLanguage);
    let results:ISourceTranslatedContent = {
      google,
      deepL,
      targetLanguage,
    };
    
    let detectLanguage = await GoogleDetectLanguage(content);
    let reverseTranslations = this.reverseTranslate(detectLanguage, results);

  } 


  private async reverseTranslate(detectLanguageResult:DetectResult | null, sources:ISourceTranslatedContent){
    if(!detectLanguageResult){
        return;
    }

    let reversedValues:ISourceTranslatedContent={
        google:"",
        deepL:"",
        targetLanguage:detectLanguageResult.language
    };

    let _deepLTargetLanguage: TargetLanguageCode = detectLanguageResult.language as any;
    if (detectLanguageResult.language === "en") {
      _deepLTargetLanguage = "en-GB";
    }
    reversedValues.deepL = await deepLTranslate(sources.google,_deepLTargetLanguage);
    reversedValues.google = await GoogleTranslate(sources.deepL, detectLanguageResult.language);

    return reversedValues;
  }


  private async compareResults(originalText:string, googleReversed:string, deeplReversed:string){
    // score each text and get the closest it
    let googleScore = await scoreTranslation(googleReversed,this.grammarly);
    let deepLScore = await scoreTranslation(deeplReversed, this.grammarly);
    
  };

  // end region

  // Public Region starts here
  public constructor(targetLanguage: string, grammarly:Grammarly.SDK) {
    this.setTargetLanguage(targetLanguage);
    this.overLappingLanguages =
      this.setOverLappingLanguages() as ILanguagePair[];
    this.isOverlapping(this.targetLanguage, this.overLappingLanguages);
    this.setTranslationSource("combined");
    // this.grammarly = await Grammarly.init("client_4zH6b3my7FAUh9ni7h6WCP");
    this.grammarly = grammarly;
  }

  public async translate(content: string) {
    let source = this.translationSource.source;
    if (source === "google") {
      return "google:" + this.targetLanguage;
      return await GoogleTranslate(content, this.targetLanguage);
    }
    if (source === "deepL" && this.isOverlap) {
      return "deepL:" + this.targetLanguage;
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

  public getTargetLanguagePair() {
    return LANGUAGES.text.filter(
      (item) => item.code === this.targetLanguage
    )[0];
  }

  public setTranslationSource(
    source: "combined" | "deepL" | "google",
    url: string = ""
  ) {
    this.translationSource = {
      source: source,
      url: url,
    };
  }

  public getTranslationSource() {
    return this.translationSource;
  }
}
