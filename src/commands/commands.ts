import { commands, ExtensionContext } from "vscode";
import { TranslateManager } from "../translate/translateManager";
import { changeTargetLanguage } from "./changeTargetLanguage";
import { changeTranslateSource } from "./changeTranslateSource";

export function registerCommands(
  context: ExtensionContext,
  translateManager: TranslateManager
) {
  context.subscriptions.push(
    commands.registerCommand("easycomments.changeTranslateSource", () => {
      changeTranslateSource(translateManager);
    }),
    commands.registerCommand("easycomments.changeTargetLanguage", () => {
      changeTargetLanguage(translateManager);
    })
  );
}
