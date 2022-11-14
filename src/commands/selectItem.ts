import { QuickPickItem, window } from "vscode";
import { LANGUAGES } from "../components/langauges";

export async function selectTranslateSource(
  placeHolder: string = "Select translate Source"
) {
  let items: QuickPickItem[] = [
    {
      label: "google",
      description:
        "Use Google translate. Has a wider range of supported languages",
    },
    {
      label: "deepL",
      description:
        "Use DeepL translate. Has a smaller range of supported languages.",
    },
    {
      label: "microsoft",
      description:
        "Use Microsoft translate. Wide range, supports mythical languages, e.g klingon",
    },
    {
      label: "combined",
      description:
        "For overlapping supported languages, compare and provide the best translation between Google and DeepL. Source will be set to google. ",
    },
  ];

  let res: QuickPickItem | undefined = await window.showQuickPick(items, {
    placeHolder,
  });
  if (res) {
    return res.label;
  }
  return null;
}

export async function selectTargetLanguage(
    placeHolder: string = "Select target language"
  ) {
  let items: QuickPickItem[] = [];
  items = LANGUAGES.text.map((lang) => {
    return {
      label: lang.code,
      description: lang.language,
    };
  });

  let res: QuickPickItem | undefined = await window.showQuickPick(items, {
    placeHolder,
  });
  if (res) {
    return res.label;
  } 
  return null;
}
