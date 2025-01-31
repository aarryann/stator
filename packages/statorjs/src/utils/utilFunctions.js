import { Parser } from 'expr-eval'; // Import expr-eval

let exprParser;
export function utilFnParser() {
  if (!exprParser) {
    exprParser = new Parser();
    exprParser.functions.concat = (...args) => args.join('');
  }
  return exprParser;
}
