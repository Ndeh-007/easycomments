# EasyComments

In a bid to solve the issues the natural language barrier posses to a group of developers, EasyComments translates comments written in one language(e.g chinese) to another language (e.g French) so that people can work together or you can now clone the code of Japanese and understand the developers thought patterns by reading his comments written in Japanese.


EasyComments uses 3 translation services to provide the best translation for the user.
* `Google Translate`: Wide range of languages. Uses Neural Machine translation
* `Deepl`: Small range of languages, but offers better translation for certain languages. Uses Artificial Neural Machine Translation
* `Microsoft's Translator`: Larger range than DeepL, but smaller than google. Offers translation for fictional languages, e.g klingon. Uses Statistical and Neural Machine translation.

EasyComments the compares the results of these translations and returns the best translation to the user. This translation is done with [`Cortical.io`](https://www.cortical.io/).  
## Features

To translate a comment, `Hover` over the comment.

The default language is set to which ever language your system is in. So if your computer's language is in English, it will translate English (the language in which the comment is in) to English(the target language, which happens to be your computer's default language). To change this, you can either: 
* Press ctrl+shift+p to open the command palate and enter “change target language” and choose a language of your choice.
* Or when you hover, click on the language and choose your desired language


For example if there is an image subfolder under your extension project workspace:

![animated image of how to change target language and translation source](./images/easycomments.gif)

## Requirements
_```Reload Required ```_
When you install, you will have to reload you environment.

## Known Issues

This extension will work only for languages whose comments support the same commenting structure as javascript
That is:
* `//` for single line
* `/* */` for multiline comments
* `/** */` for multiline JSDoc Comments.

The extension does not currently properly handle JSDoc comments.
## Release Notes

### 1.0.0

Initial release of EasyComments

  
**Enjoy!**
