import Translate from "@google-cloud/translate";

//google api creds
let config = {
  type: "service_account",
  project_id: "easycomments",
  private_key_id: "5204f87f1327dfae420161eaf2d0911eddf467f9",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9JLaCEjUiOXg9\n9caBxvrO813qT2NVVSZcWOP8ZI1jyOEt+hPEF60FBZejxHyRj/J7fHczdXMsN/sC\noCXvCw9r9q5H/1m6bfUE312aOMMppjXjMtAXjCjHyI07CqOkaF0zposRdv6w/WZM\nvGH3e6+iZ1XTT/J/n8jsT7hRxBPlTSvWV9wrB+uj7T2mwpDvH8+ANMTjyIWU+jvs\nauuTQ6nG2Zd+hyjrg6X/vwNOxA/hAb+p7iPvg/LL7I8PXMUWhCCmJbQUkI/j5JB4\nunjJKbTEY6s0Rzzu0bgZtrYXcnDIxOnAFBIxP8+PzA3sdvBMoAwuvJAiIKM5iaHR\nA4fgZ8WvAgMBAAECggEAAjq/Dfxx9OPRh4VwoBH83difiEYESTq2N4tysIRs6Dqz\ncMvMVNjkmLUOqwcDYuHb/VmjvA8L2v8T7d1+ZPlv5pljR4T6hUiLhVGutEUsA78q\nTnHIYyarSmOSSppfAG6cfqHdbMjGysZJ4OitjPG/yb3HFLUSCjATebmc1hXmGCNS\nCmZTir3ARIppgxBeV5z1BBsRAEubDLoihjiSFdXiUi+aic4BLdAeUEeYRew1/x4N\nFVEyzQCJAm2xJX3PasGC8Nskg3w0iFUOXcLYrIzvGH2Rj8ndAEl/ux1lTt0//+7j\nFmBZUb45KVMNjwI/yUpgGBVE3vhx8iLMh6prZDM6yQKBgQDk8jJbrPtCDojmUZFZ\nLjZmh8hS2X0V/XWU3FsoorEeJkH+/r2QLe8ZHOrEBAvywj3w2IvNv66R57KZP/gp\nFg4Jj4n1uuUrDLnlUzD0wys6XDfqJWQwgDJyqYgPSI7ueYBC2jnDeyzEzRiMgEvn\nEepvm1c762bYNhiL/1/jYIOuxwKBgQDTfnQPoZOzmCYwEiAEOm7rBVIQfb/OQnR/\nLYYh6h7Wf6TG7KKp3h+xX3ZyJ5jS8gLfGYi9LuTIy3iRgN4YQHGNG400nV3Xp7+Q\nMuNYJfADoMjRAyW6XOSGr0U2Nu0qGUnyiJZOrkXGzzkYWdbuNTAZW8R0HRqWS5qe\nsgIR/B9p2QKBgQCM6o4YY0ZbiDq3GKmP7KPLQ/QHGpqlOFZxA5iQUGMYHZAtdXoU\nDlHGcUgG0j7QcsJRRdf3Ee5PG/+P2BHUqCCHvfO6bgi0EKczAZt2a9Jln3FDCzS5\nrY5fiP2X+p8PJXXOsCcxrNUHZP2hLS6K0Tos674rwV6R4eoF8W+Bslwa7QKBgQCp\nFI1g+cIFcHwHLlZeSwDl72j+Oiofkc1k51Y2wt9IiN+JESGyQByCR1mARdvNuSFG\njzlcVaMeTFzlpmroZIzjTMWE7NJbWIazl5tdm2bY36/sOWHuLdmdO35Pq3XLlFAk\nD8JqwLSUDpMMvrYv1mHPxCe41JOu2F6SxKkXC8NpcQKBgEFd2uHsRCvCG3TNd72w\nFPXFywkpTxGPm9eDrr84jCTAdRBLIL0ltnL6FO5Od+hK2gBEnCTeYzN3QQroCQWq\ndAz59wEmWdyyjLgtK+a7SrhAZe2jfgK7+7UGAI6kpKgwGb31TKKPddEMmU39MAl7\nCRnKJdIqxmufcCkyJEthKWYy\n-----END PRIVATE KEY-----\n",
  client_email: "easycomments@easycomments.iam.gserviceaccount.com",
  client_id: "109826625711274602533",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/easycomments%40easycomments.iam.gserviceaccount.com",
};

// Creates a client
const translate = new Translate.v2.Translate({
  // key: config.private_key,
  projectId: config.project_id,
});

async function translateText(text: string, target: string) {
  try {
    text = text.replace(`//`, "");
    console.log(text);

    let translations: (string | any)[] = await translate.translate(
      text,
      target
    );
    console.log(translations);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log("Translations:");
    translations.forEach((translation, i) => {
      console.log(`${text[i]} => (${target}) ${translation}`);
    });
    let result = translations.join(" ");
    return result;
  } catch (e) {
    return e;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function GoogleTranslate(content: string, target: string) {
  return await translateText(content, target);
}
