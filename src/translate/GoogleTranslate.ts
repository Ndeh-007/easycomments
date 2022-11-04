import Translate from "@google-cloud/translate";

//google api creds
let config = { 
  // eslint-disable-next-line @typescript-eslint/naming-convention
  project_id: "easycomments",
  apiKey: "AIzaSyBdfgC_vcv_h_j2TJ9tf9ESZYH2A5p7MmM",
};

// Creates a client
const translate = new Translate.v2.Translate({
  key: config.apiKey,
  projectId: config.project_id,
});

async function translateText(text: string, target: string) {
  try { 
    let translations: (string | any)[] = await translate.translate(text, target);
    translations = Array.isArray(translations) ? translations : [translations];
    let result = translations[0];
    return result;
  } catch (e) {
    let stringError = "Translation Error";
    console.log(e);
    return stringError;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function GoogleTranslate(content: string, target: string) {
  return await translateText(content, target);
}
