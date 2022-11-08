import {
  DecorationRenderOptions,
  Memento,
  Range,
  TextDocument,
  TextEditor,
  workspace,
} from "vscode";
import { LocalStorageService } from "../components/storage";
import { Configuration } from "../configuration/configuration";
import { filterComments } from "../functions/filterComments";
import {
  CommentItem,
  CommentTag,
  Contributions,
  StorageItem,
} from "./interfaces";

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
  private storage: any;

  private contributions: Contributions = workspace.getConfiguration(
    "easycomments"
  ) as any;

  // * this is used to prevent the first line of the file (specifically python) from coloring like other comments
  private ignoreFirstLine = false;

  // * this is used to trigger the events when a supported language code is found
  public supportedLanguage = true;

  private configuration: Configuration;

  public constructor(config: Configuration) {
    this.configuration = config;
    this.setTags();
  }

  private escapeRegExp(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  private setCommentFormat(
    singleLine: string | string[] | null,
    start: string | null = null,
    end: string | null = null
  ): void {
    this.delimiter = "";
    this.blockCommentStart = "";
    this.blockCommentEnd = "";

    // If no single line comment delimiter is passed, single line comments are not supported
    if (singleLine) {
      if (typeof singleLine === "string") {
        this.delimiter = this.escapeRegExp(singleLine).replace(/\//gi, "\\/");
      } else if (singleLine.length > 0) {
        // * if multiple delimiters are passed, the language has more than one single line comment format
        var delimiters = singleLine.map((s) => this.escapeRegExp(s)).join("|");
        this.delimiter = delimiters;
      }
    } else {
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

    const config = await this.configuration.getCommentConfiguration(
      languageCode
    );
    if (config) {
      let blockCommentStart = config.blockComment
        ? config.blockComment[0]
        : null;
      let blockCommentEnd = config.blockComment ? config.blockComment[1] : null;

      this.setCommentFormat(
        config.lineComment || blockCommentStart,
        blockCommentStart,
        blockCommentEnd
      );

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
    if (!this.highlightSingleLineComments) {
      return;
    }

    let text = activeEditor.document.getText();

    // if it's plain text, we have to do multiline regex to catch the start of the line with ^
    let regexFlags = this.isPlainText ? "igm" : "ig";
    let regEx = new RegExp(this.expression, regexFlags);
    if (this.expression.length === 37) {
      let temp = this.expression;
      temp =
        temp.slice(0, temp.length - 22) + "?" + temp.slice(temp.length - 22); // inject the option of comments without exclamation marks at the start of the comment
      regEx = new RegExp(temp, regexFlags);
    }
    let match: any;
    while ((match = regEx.exec(text))) {
      let startPos = activeEditor.document.positionAt(match.index);
      let endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );
      let range = new Range(startPos, endPos);

      // Required to ignore the first line of .py files
      if (
        this.ignoreFirstLine &&
        startPos.line === 0 &&
        startPos.character === 0
      ) {
        continue;
      }

      // Find which custom delimiter was used in order to add it to the collection
      let matchTag = this.tags.find(
        (item) => item.tag.toLowerCase() === match[1].toLowerCase()
      );
      if (matchTag) {
        matchTag.ranges.push(range);
        matchTag.range = range;
        this.collectSingleLineComments(matchTag);
      }
    }
  }

  public storeBlockComments(activeEditor: TextEditor): void {
    // If highlight multiline is off in package.json or doesn't apply to his language, return
    if (!this.highlightMultilineComments) {
      return;
    }

    let text = activeEditor.document.getText();

    // Build up regex matcher for custom delimiter tags
    let characters: Array<string> = [];
    for (let commentTag of this.tags) {
      characters.push(commentTag.escapedTag);
    }

    // Combine custom delimiters and the rest of the comment block matcher
    let commentMatchString = "(^)+([ \\t]*[ \\t]*)(";
    commentMatchString += characters.join("|");
    commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";

    // Use start and end delimiters to find block comments
    let regexString = "(^|[ \\t])(";
    regexString += this.blockCommentStart;
    regexString += "[\\s])+([\\s\\S]*?)(";
    regexString += this.blockCommentEnd;
    regexString += ")";

    let regEx = new RegExp(regexString, "gm");
    let commentRegEx = new RegExp(commentMatchString, "igm");

    if (commentMatchString.length === 63) {
      let temp = commentMatchString;
      temp =
        temp.slice(0, temp.length - 11) + "\\" + temp.slice(temp.length - 11); // inject the option of comments without exclamation marks at the start of the comment
      commentRegEx = new RegExp(temp, "igm");
    }
 

    // Find the multiline comment block
    let match: any;
    while ((match = regEx.exec(text))) {
      let commentBlock = match[0];

      // Find the line
      let line;
      while ((line = commentRegEx.exec(commentBlock))) {
        let startPos = activeEditor.document.positionAt(
          match.index + line.index + line[2].length
        );
        let endPos = activeEditor.document.positionAt(
          match.index + line.index + line[0].length
        );
        let range = new Range(startPos, endPos);

        // Find which custom delimiter was used in order to add it to the collection
        let matchString = line[3] as string;
        let matchTag = this.tags.find(
          (item) => item.tag.toLowerCase() === matchString.toLowerCase()
        );

        if (matchTag) {
          matchTag.ranges.push(range);
          this.collectBlockComments(matchTag);
        }
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  public FindJSDocComments(activeEditor: TextEditor): void {
    // If highlight multiline is off in package.json or doesn't apply to his language, return
    if (!this.highlightMultilineComments && !this.highlightJSDoc) {
      return;
    }

    let text = activeEditor.document.getText();

    // Build up regex matcher for custom delimiter tags
    let characters: Array<string> = [];
    for (let commentTag of this.tags) {
      characters.push(commentTag.escapedTag);
    }

    // Combine custom delimiters and the rest of the comment block matcher
    let commentMatchString = "(^)+([ \\t]*\\*[ \\t]*)("; // Highlight after leading *
    let regEx = /(^|[ \t])(\/\*\*)+([\s\S]*?)(\*\/)/gm; // Find rows of comments matching pattern /** */

    commentMatchString += characters.join("|");
    commentMatchString += ")([ ]*|[:])+([^*/][^\\r\\n]*)";

    commentMatchString = commentMatchString.replace("!", "!?");
    commentMatchString = commentMatchString.replace("todo", "[todo]?");
    let commentRegEx = new RegExp(commentMatchString, "igm");

    // Find the multiline comment block
    let match: any;
    while ((match = regEx.exec(text))) {
      let commentBlock = match[0];

      // Find the line
      let line;
      while ((line = commentRegEx.exec(commentBlock))) {
        let startPos = activeEditor.document.positionAt(
          match.index + line.index + line[2].length
        );
        let endPos = activeEditor.document.positionAt(
          match.index + line.index + line[0].length
        );
        let range = new Range(startPos, endPos);

        // Find which custom delimiter was used in order to add it to the collection
        let matchString = line[2] as string;
        let matchTag = this.tags.find(
          (item) =>
            item.tag.toLowerCase() ===
            matchString.toLowerCase().replace(new RegExp(" ", "g"), "")
        );
        if (matchTag) {
          matchTag.ranges.push(range);
          this.collectJSDocComments(matchTag);
        }
      }
    }
  }

  private setTags(): void {
    let items = this.contributions.tags;
    for (let item of items) {
      let escapedSequence = item.tag.replace(/([()[{*+.$^\\|?])/g, "\\$1");
      this.tags.push({
        tag: item.tag,
        escapedTag: escapedSequence.replace(/\//gi, "\\/"), // ! hardcoded to escape slashes
        ranges: [],
      });
    }
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

  // =================================================================================

  private singleLineCommentsArray: (CommentItem | undefined)[] = [];
  private blockCommentsArray: (CommentItem | undefined)[] = [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private JSDocCommentsArray: (CommentItem | undefined)[] = [];
  private totalComments: (CommentItem | undefined)[] = [];

  private collectSingleLineComments(comment: CommentTag) {
    let filteredComments = filterComments(comment, "single");
    this.singleLineCommentsArray = filteredComments;
  }

  private collectBlockComments(comment: CommentTag) {
    let filteredComments = filterComments(comment, "block");
    this.blockCommentsArray = filteredComments;
  }

  private collectJSDocComments(comment: CommentTag) {
    let filteredComments = filterComments(comment, "block");
    this.JSDocCommentsArray = filteredComments;
  }

  public collectData() {
    this.totalComments = [
      ...this.singleLineCommentsArray,
      ...this.blockCommentsArray,
      ...this.JSDocCommentsArray,
    ];
  }

  // make all comments available for the instance of the particular class
  public getTotalComments() { 
    return this.totalComments;
  }

  //   Store read comments to local storage
  public persistDataToStorage(
    activeEditor: TextEditor,
    storageManager: LocalStorageService
  ) {
    let key = activeEditor.document.uri.fsPath;
    let storageData: StorageItem = {
      data: this.totalComments,
      editor: activeEditor,
      uri: key,
    };
    storageManager.setValue<StorageItem>(key, storageData);
  }
}
