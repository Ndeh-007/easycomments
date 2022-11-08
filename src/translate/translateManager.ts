import { deepLTranslate } from "./DeepLTranslate";
import { GoogleDetectLanguage, GoogleTranslate } from "./GoogleTranslate";
import * as deepl from "deepl-node";
import { env, TextEditor } from "vscode";
import {
  ICorticalCompareMetric,
  ILanguagePair,
  ISourceTranslatedContent,
  ITranslationManagerOptions,
  ITranslationSource,
} from "../interfaces/interfaces";
import { DEEPL_LANGUAGES, LANGUAGES } from "../components/langauges";
import { TargetLanguageCode } from "deepl-node";
import { DetectResult } from "@google-cloud/translate/build/src/v2";
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
  //   private grammarly:Grammarly.SDK = "" as any;

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
    //first get the respective translations from their sources
    let google = await GoogleTranslate(content, targetLanguage);
    let _deepLTargetLanguage: TargetLanguageCode = targetLanguage as any;
    if (targetLanguage === "en") {
      _deepLTargetLanguage = "en-GB";
    }
    let deepL = await deepLTranslate(content, _deepLTargetLanguage);
    let results: ISourceTranslatedContent = {
      google,
      deepL,
      targetLanguage,
    };

    // then detect the translation language so that it can be used when reverse translating;
    let detectLanguage = await GoogleDetectLanguage(content);

    // reverse translate the existing translation by interchanging their sources i.e 1 <- 2 and 2 <- 1
    let reverseTranslations = await this.reverseTranslate(detectLanguage, results);

    let bestTranslation = await this.compareResults(content, reverseTranslations?.google, reverseTranslations?.deepL);
    if (bestTranslation === "google") {
      return results.google;
    }
    if (bestTranslation === "deepl") {
      return results.deepL;
    }
  }


  private async reverseTranslate(detectLanguageResult: DetectResult | null, sources: ISourceTranslatedContent) {
    if (!detectLanguageResult) {
      return;
    }

    let reversedValues: ISourceTranslatedContent = {
      google: "",
      deepL: "",
      targetLanguage: detectLanguageResult.language
    };

    let _deepLTargetLanguage: TargetLanguageCode = detectLanguageResult.language as any;
    if (detectLanguageResult.language === "en") {
      _deepLTargetLanguage = "en-GB";
    }

    reversedValues.deepL = await deepLTranslate(sources.deepL, _deepLTargetLanguage);
    reversedValues.google = await GoogleTranslate(sources.google, detectLanguageResult.language);

    return reversedValues;
  }


  private async compareResults(originalText: string, googleReversed: string | undefined, deeplReversed: string | undefined) {
    if (!deeplReversed || !googleReversed) { return; }
    // score each text and get the closest 
    let googleScore: ICorticalCompareMetric = await scoreTranslation(originalText, googleReversed);
    let deepLScore: ICorticalCompareMetric = await scoreTranslation(originalText, deeplReversed);

    let gPoints = 0, dPoints = 0;

    // use 3 item to test for similarity between the text
    (googleScore.cosineSimilarity > deepLScore.cosineSimilarity) ? gPoints++ : dPoints++;
    (googleScore.euclideanDistance < deepLScore.euclideanDistance) ? gPoints++ : dPoints++;
    (googleScore.weightedScoring > deepLScore.weightedScoring) ? gPoints++ : dPoints++;
  
    if (gPoints > dPoints) {
      return "google";
    } else {
      return "deepl";
    }
  };

  // end region

  // Public Region starts here
  public constructor(targetLanguage: string) {
    this.setTargetLanguage(targetLanguage);
    this.overLappingLanguages =
      this.setOverLappingLanguages() as ILanguagePair[];
    this.isOverlapping(this.targetLanguage, this.overLappingLanguages);

    //  this sets the default translation source to combined.
    this.setTranslationSource("combined");
    // this.grammarly = await Grammarly.init("client_4zH6b3my7FAUh9ni7h6WCP"); 
  }


  public async translate(content: string): Promise<string | undefined | null> { 
    let source = this.translationSource.source; 
    if (source === "google") {
      // return "google:" + this.targetLanguage;
      return await GoogleTranslate(content, this.targetLanguage);
    }
    if (source === "deepL" && this.isOverlap) {
      // return "deepL:" + this.targetLanguage;
      let t: any = this.targetLanguage;
      return await deepLTranslate(content, t);
    }
    if (source === "combined" && this.isOverlap) {
      //return "combined + " + await this.compareTranslation(content,this.targetLanguage);
      let result = await this.compareTranslation(content, this.targetLanguage);
      return result;
    }

  }

  public setTargetLanguage(target: string) {
    this.targetLanguage = target;
    // if the target langauge selected is not overlapping
    if(target === "combined" && this.isOverlap === false){ 
      this.translationSource.source = "google"; 
    }
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
