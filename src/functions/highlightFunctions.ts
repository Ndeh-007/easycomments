import { window, Position, ExtensionContext, TextEditorSelectionChangeKind, commands, } from 'vscode';
import { ICommentBlock } from '../interfaces/interfaces';
import { isCode } from '../util/string';

export function selectionContains(url: string, position: Position): ICommentBlock | null {
    let editor = window.activeTextEditor;
    if (editor && editor.document.uri.toString() === url) {
        let selection = editor.selections.find((selection) => {
            return !selection.isEmpty && selection.contains(position);
        });
        if (selection) {
            return {
                range: selection,
                comment: editor.document.getText(selection)
            };
        }
    }
    return null;
}

export function registerHighlight(context: ExtensionContext) {
    let lastShowHover: number;
    let showHoverTimer: NodeJS.Timeout;
    context.subscriptions.push(window.onDidChangeTextEditorSelection((e) => {
        if (e.kind !== TextEditorSelectionChangeKind.Mouse) { return; };
        let selections = e.selections.filter(selection => !selection.isEmpty);
        if (selections.length === 0 || selections.length > 1) { return; };

        let laterTime = 300;
        if (lastShowHover) {
            let gap = (new Date()).getTime() - lastShowHover;
            laterTime = Math.max(600 - gap, 300);
        }
        clearTimeout(showHoverTimer);
        showHoverTimer = setTimeout(() => {
            let selectionText = e.textEditor.document.getText(selections[0]);
            if (selectionText.length > 1000) { return; };
            if (isCode(selectionText)) { return; };
            commands.executeCommand('editor.action.showHover');
            lastShowHover = (new Date()).getTime();
        }, laterTime);
    }));
}