// Generated automatically by nearley, version 2.19.2
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var EOF: any;
declare var tagend: any;
declare var tagstart: any;
declare var keyname: any;
declare var sep: any;
declare var valuestext: any;
declare var text: any;

import tokenizer from './tokenizer'
import initTagKeeper from './tagKeeper'

const tagKeeper = initTagKeeper()

interface NearleyToken {  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: NearleyToken) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: tokenizer,
  ParserRules: [
    {"name": "start", "symbols": ["content", (tokenizer.has("EOF") ? {type: "EOF"} : EOF)], "postprocess": () => tagKeeper.stop().value},
    {"name": "content$ebnf$1", "symbols": []},
    {"name": "content$ebnf$1$subexpression$1", "symbols": ["tag", "_"]},
    {"name": "content$ebnf$1", "symbols": ["content$ebnf$1", "content$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "content", "symbols": ["_", "content$ebnf$1"]},
    {"name": "tag", "symbols": ["tagstart", "inner", (tokenizer.has("tagend") ? {type: "tagend"} : tagend)], "postprocess":  ([startToken,tag,endToken]) => [[
            id(startToken) /* '[[' */,
            tag.join('::'),
            endToken.value /* ']]' */,
        ], tagKeeper.endToken(endToken.offset, tag)] },
    {"name": "tagstart", "symbols": [(tokenizer.has("tagstart") ? {type: "tagstart"} : tagstart)], "postprocess": ([startToken]) => [startToken.value, tagKeeper.startToken(startToken.offset + startToken.value.length)]},
    {"name": "inner$ebnf$1", "symbols": []},
    {"name": "inner$ebnf$1$subexpression$1", "symbols": ["tag", "_values"]},
    {"name": "inner$ebnf$1", "symbols": ["inner$ebnf$1", "inner$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "inner", "symbols": [(tokenizer.has("keyname") ? {type: "keyname"} : keyname), (tokenizer.has("sep") ? {type: "sep"} : sep), "_values", "inner$ebnf$1"], "postprocess":  ([key,,first,rest]) => [
            key.value,
            first + rest.map(([tag, vtxt]) => id(tag).join('') + vtxt),
        ] },
    {"name": "_values$ebnf$1", "symbols": []},
    {"name": "_values$ebnf$1", "symbols": ["_values$ebnf$1", (tokenizer.has("valuestext") ? {type: "valuestext"} : valuestext)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_values", "symbols": ["_values$ebnf$1"], "postprocess": ([vs]) => vs.map(v => v.value).join('')},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (tokenizer.has("text") ? {type: "text"} : text)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null}
  ],
  ParserStart: "start",
};

export default grammar;
