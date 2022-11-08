import { Range } from "vscode";
import { CommentItem, CommentTag, } from "../interfaces/interfaces";

// Filters and groups the ranges in the array returning a and array of grouped ranges
export function filterComments(comment: CommentTag, commentType: string) {

    let _comment: CommentItem;
    let _ranges: Range[] = comment.ranges;
    let _start: Range = _ranges[0];
    let _end: Range = _ranges[0];
    let _filteredComments: CommentItem[] = []; 
    // group comments
    for (let i = 0; i < _ranges.length; i++) {  

        // check if comments are close together
        if (_end.start.line + 1 === _ranges[i].end.line) { 
            _end = _ranges[i];
        }

        // jump the gap and reset the indices to what is after th gap
        if(_ranges[i].start.line - _end.end.line > 1 ){ 
            _comment = {
                range: new Range(_start.start, _end.end),
                type: commentType
            }; 
            _filteredComments.push(_comment);
            _start =  _ranges[i];
            _end =  _ranges[i]; 
        }  

        // for the last range that ends the array
        if(i === _ranges.length -1){ 
            _comment = {
                range: new Range(_start.start, _ranges[i].end),
                type: commentType
            };
            _filteredComments.push(_comment);
        }
    }  
    return _filteredComments;
}

