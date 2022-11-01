import { Range, TextDocument, TextEditor, workspace } from "vscode";
import { Configuration } from "../configuration/configuration";
import { CommentTag, Contributions } from "./interfaces";

export class Parser {
    private tags: CommentTag[] = [];
    private expression: string = "";
    private singleLineComments = [];

    private isPlainText = false;
    private delimiter: string = "";
    private blockCommentStart: string = "";
    private blockCommentEnd: string = "";

    private highlightSingleLineComments = true;
    private highlightMultilineComments = false;
    private highlightJSDoc = false;

    private contributions: Contributions = workspace.getConfiguration('easycomments') as any;


    // * this is used to prevent the first line of the file (specifically python) from coloring like other comments
    private ignoreFirstLine = false;

    // * this is used to trigger the events when a supported language code is found
    public supportedLanguage = true;

    
    private configuration: Configuration;

    public constructor(config: Configuration) {
        this.configuration = config;
    }


    private escapeRegExp(input: string): string {
        return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    private setCommentFormat(
        singleLine: string | string[] | null,
        start: string | null = null,
        end: string | null = null): void {

        this.delimiter = "";
        this.blockCommentStart = "";
        this.blockCommentEnd = "";

        // If no single line comment delimiter is passed, single line comments are not supported
        if (singleLine) {
            if (typeof singleLine === 'string') {
                this.delimiter = this.escapeRegExp(singleLine).replace(/\//ig, "\\/");
            }
            else if (singleLine.length > 0) {
                // * if multiple delimiters are passed, the language has more than one single line comment format
                var delimiters = singleLine
                    .map(s => this.escapeRegExp(s))
                    .join("|");
                this.delimiter = delimiters;
            }
        }
        else {
            this.highlightSingleLineComments = false;
        }

        if (start && end) {
            this.blockCommentStart = this.escapeRegExp(start);
            this.blockCommentEnd = this.escapeRegExp(end);

            this.highlightMultilineComments = this.contributions.multilineComments;
        }
    }

    private async setDelimiter(languageCode: string): Promise<void> {
        this.supportedLanguage = false;
        this.ignoreFirstLine = false;
        this.isPlainText = false;
 
        console.log(languageCode,": before config");
        const config = await this.configuration.getCommentConfiguration(languageCode);
        console.log(languageCode, config, ":after getting configuration");
        if (config) {
            let blockCommentStart = config.blockComment ? config.blockComment[0] : null;
            let blockCommentEnd = config.blockComment ? config.blockComment[1] : null;

            this.setCommentFormat(config.lineComment || blockCommentStart, blockCommentStart, blockCommentEnd);

            this.supportedLanguage = true;
        }

        switch (languageCode) {
            case "apex":
            case "javascript":
            case "javascriptreact":
            case "typescript":
            case "typescriptreact":
                this.highlightJSDoc = true;
                break;

            case "elixir":
            case "python":
            case "tcl":
                this.ignoreFirstLine = true;
                break;

            case "plaintext":
                this.isPlainText = true;

                // If highlight plaintext is enabled, this is a supported language
                this.supportedLanguage = this.contributions.highlightPlainText;
                break;
        }
    }


    // look through the current file and get all the comments and store in local storage
    public storeSingleLineComments(activeEditor: TextEditor) {

        let text = activeEditor.document.getText();

        console.log("single line called");
        // if it's plain text, we have to do mutliline regex to catch the start of the line with ^
        let regexFlags = (this.isPlainText) ? "igm" : "ig";
        let regEx = new RegExp(this.expression, regexFlags);
        let temp;
        let match: any;
        while (match = regEx.exec(text)) {
            console.log(match.index)
            let startPos = activeEditor.document.positionAt(match.index);
            let endPos = activeEditor.document.positionAt(match.index + match[0].length);
            let range = { range: new Range(startPos, endPos) };


            // Find which custom delimiter was used in order to add it to the collection
            let matchTag = this.tags.find(item => item.tag.toLowerCase() === match[3].toLowerCase());

            if (matchTag) {
                matchTag.ranges.push(range);
            }
        }
        console.log(match);
    }


    public async setRegex(languageCode: string) {
        await this.setDelimiter(languageCode);

        // if the language isn't supported, we don't need to go any further
        if (!this.supportedLanguage) {
            return;
        }

        let characters: Array<string> = [];
        for (let commentTag of this.tags) {
            characters.push(commentTag.escapedTag);
        }

        if (this.isPlainText && this.contributions.highlightPlainText) {
            // start by tying the regex to the first character in a line
            this.expression = "(^)+([ \\t]*[ \\t]*)";
        } else {
            // start by finding the delimiter (//, --, #, ') with optional spaces or tabs
            this.expression = "(" + this.delimiter + ")+( |\t)*";
        }

        // Apply all configurable comment start tags
        this.expression += "(";
        this.expression += characters.join("|");
        this.expression += ")+(.*)";
    }
}