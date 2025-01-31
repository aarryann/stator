/* eslint-disable no-prototype-builtins */
/**
 * This code has been taken from Angular.js parse provider. It is able to parse and
 * evaluate JavaScript expressions without having to use eval() or Function(). This is part
 * of an experiment.
 *
 * https://github.com/angular/angular.js/blob/47bf11ee94664367a26ed8c91b9b586d3dd420f5/src/ng/parse.js
 *
 * There's a lot of code in here that is broken; or makes references to functions that
 * don't exist. But, as long as there is the happy-path, we are OK.
 */
function createMap() {
  return Object.create(null);
}

function isFunction(value) {
  return typeof value === 'function';
}

function isDefined(value) {
  return typeof value !== 'undefined';
}

function isArray(arr) {
  return Array.isArray(arr) || arr instanceof Array;
}

function lowercase(string) {
  return isString(string) ? string.toLowerCase() : string;
}

function uppercase(string) {
  return isString(string) ? string.toUpperCase() : string;
}

function throwParseError(type, message, expression) {
  throw new Error(`[NgParser:${type}] ${message.replace('{0}', expression)}`);
}

function copy(source) {
  return JSON.parse(JSON.stringify(source)); // Basic deep copy
}

function noop() {}

function getStringValue(name) {
  return name + '';
}

function isString(value) {
  return typeof value === 'string';
}

function forEach(obj, iterator, context) {
  let key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        if (key !== 'prototype' && key !== 'length' && key !== 'name' && obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj)) {
      const isPrimitive = typeof obj !== 'object';
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context, obj);
    } else if (isBlankObject(obj)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      for (key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    } else if (typeof obj.hasOwnProperty === 'function') {
      // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else {
      // Slow path for objects which do not have a method `hasOwnProperty`
      for (key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}

function isBlankObject(value) {
  return value !== null && typeof value === 'object' && !getPrototypeOf(value);
}

const getPrototypeOf = Object.getPrototypeOf;

const OPERATORS = createMap();
forEach('+ - * / % === !== == != < > <= >= && || ! = |'.split(' '), function (operator) {
  OPERATORS[operator] = true;
});
const ESCAPE = { n: '\n', f: '\f', r: '\r', t: '\t', v: '\v', "'": "'", '"': '"' };

/**
 * @constructor
 */
class Lexer {
  constructor() {
    this.text = '';
    this.index = 0;
    this.tokens = [];
  }

  lex(text) {
    this.text = text;
    this.index = 0;
    this.tokens = [];

    while (this.index < this.text.length) {
      const ch = this.text.charAt(this.index);
      if (ch === '"' || ch === "'") {
        // Handle string literals
        this.readString(ch);
      } else if (ch === '`') {
        // Handle template literals (backticks)
        this.readTemplateLiteral();
      } else if (this.isNumber(ch) || (ch === '.' && this.isNumber(this.peek()))) {
        // Handle numbers (integer or float)
        this.readNumber();
      } else if (this.isIdentifierStart(this.peekMultichar())) {
        // Handle identifiers
        this.readIdent();
      } else if (this.is(ch, '(){}[].,;:?')) {
        // Handle punctuation and symbols
        this.tokens.push({ index: this.index, text: ch });
        this.index++;
      } else if (ch === '$' && this.peek() === '{') {
        // Handle interpolation `${...}` syntax
        this.index++; // Skip the '$'
        this.tokens.push({ index: this.index - 1, text: '${', type: 'INTERPOLATION_START' });
        this.index++; // Skip the '{'
        this.readInterpolation();
      } else if (this.isWhitespace(ch)) {
        // Handle whitespaces
        this.index++;
      } else {
        // Unexpected character
        const ch2 = ch + this.peek();
        const ch3 = ch2 + this.peek(2);
        const op1 = OPERATORS[ch];
        const op2 = OPERATORS[ch2];
        const op3 = OPERATORS[ch3];
        if (op1 || op2 || op3) {
          const token = op3 ? ch3 : op2 ? ch2 : ch;
          this.tokens.push({ index: this.index, text: token, operator: true });
          this.index += token.length;
        } else {
          this.throwError('Unexpected next character ', this.index, this.index + 1);
        }
      }
    }
    return this.tokens;
  }

  is(ch, chars) {
    return chars.indexOf(ch) !== -1;
  }

  peek(i) {
    const num = i || 1;
    return this.index + num < this.text.length ? this.text.charAt(this.index + num) : false;
  }

  isNumber(ch) {
    return '0' <= ch && ch <= '9' && typeof ch === 'string';
  }

  isWhitespace(ch) {
    // IE treats non-breaking space as \u00A0
    return ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n' || ch === '\v' || ch === '\u00A0';
  }

  isIdentifierStart(ch) {
    return this.isValidIdentifierStart(ch);
  }

  isValidIdentifierStart(ch) {
    return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || '_' === ch || ch === '$';
  }

  isIdentifierContinue(ch) {
    return this.isValidIdentifierContinue(ch);
  }

  isValidIdentifierContinue(ch, cp) {
    return this.isValidIdentifierStart(ch, cp) || this.isNumber(ch);
  }

  codePointAt(ch) {
    if (ch.length === 1) return ch.charCodeAt(0);
    return (ch.charCodeAt(0) << 10) + ch.charCodeAt(1) - 0x35fdc00;
  }

  peekMultichar() {
    const ch = this.text.charAt(this.index);
    const peek = this.peek();
    if (!peek) {
      return ch;
    }
    const cp1 = ch.charCodeAt(0);
    const cp2 = peek.charCodeAt(0);
    if (cp1 >= 0xd800 && cp1 <= 0xdbff && cp2 >= 0xdc00 && cp2 <= 0xdfff) {
      return ch + peek;
    }
    return ch;
  }

  isExpOperator(ch) {
    return ch === '-' || ch === '+' || this.isNumber(ch);
  }

  throwError(error, start, end) {
    end = end || this.index;
    const colStr = isDefined(start) ? 's ' + start + '-' + this.index + ' [' + this.text.substring(start, end) + ']' : ' ' + end;
    throw throwParseError('lexerr', 'Lexer Error: {0} at column{1} in expression [{2}].', error, colStr, this.text);
  }

  // Handle template literals enclosed in backticks
  readTemplateLiteral() {
    let templateContent = '';
    let ch;

    // Start reading content within the backticks
    this.index++; // Skip the backtick
    while (this.index < this.text.length) {
      ch = this.text.charAt(this.index);

      if (ch === '`') {
        // End of template literal
        this.tokens.push({ index: this.index, text: templateContent, type: 'TEMPLATE_LITERAL_CONTENT' });
        this.tokens.push({ index: this.index, text: '`', type: 'TEMPLATE_LITERAL_END' });
        this.index++;
        return;
      }

      // Handle interpolation syntax inside template literal
      if (ch === '$' && this.peek() === '{') {
        this.index++; // Skip the '$'
        this.tokens.push({ index: this.index - 1, text: '${', type: 'INTERPOLATION_START' });
        this.index++; // Skip the '{'
        this.readInterpolation();
      } else {
        templateContent += ch; // Add character to content
        this.index++;
      }
    }

    this.throwError('Unclosed template literal', this.index);
  }

  // Add readInterpolation function to capture the interpolation content
  readInterpolation() {
    let interpolationContent = '';
    let ch;

    while (this.index < this.text.length) {
      ch = this.text.charAt(this.index);

      if (ch === '}') {
        // End of interpolation
        this.tokens.push({ index: this.index, text: interpolationContent, type: 'INTERPOLATION_CONTENT' });
        this.tokens.push({ index: this.index, text: '}', type: 'INTERPOLATION_END' });
        this.index++;
        return;
      }

      interpolationContent += ch;
      this.index++;
    }

    this.throwError('Unclosed interpolation expression', this.index);
  }

  readNumber() {
    let number = '';
    const start = this.index;
    while (this.index < this.text.length) {
      const ch = lowercase(this.text.charAt(this.index));
      if (ch === '.' || this.isNumber(ch)) {
        number += ch;
      } else {
        const peekCh = this.peek();
        if (ch === 'e' && this.isExpOperator(peekCh)) {
          number += ch;
        } else if (this.isExpOperator(ch) && peekCh && this.isNumber(peekCh) && number.charAt(number.length - 1) === 'e') {
          number += ch;
        } else if (this.isExpOperator(ch) && (!peekCh || !this.isNumber(peekCh)) && number.charAt(number.length - 1) === 'e') {
          this.throwError('Invalid exponent');
        } else {
          break;
        }
      }
      this.index++;
    }
    this.tokens.push({
      index: start,
      text: number,
      constant: true,
      value: Number(number)
    });
  }

  readIdent() {
    const start = this.index;
    this.index += this.peekMultichar().length;
    while (this.index < this.text.length) {
      const ch = this.peekMultichar();
      if (!this.isIdentifierContinue(ch)) {
        break;
      }
      this.index += ch.length;
    }
    this.tokens.push({
      index: start,
      text: this.text.slice(start, this.index),
      identifier: true
    });
  }

  readString(quote) {
    const start = this.index;
    this.index++;
    let string = '';
    let rawString = quote;
    let escape = false;
    while (this.index < this.text.length) {
      const ch = this.text.charAt(this.index);
      rawString += ch;
      if (escape) {
        if (ch === 'u') {
          const hex = this.text.substring(this.index + 1, this.index + 5);
          if (!hex.match(/[\da-f]{4}/i)) {
            this.throwError('Invalid unicode escape [\\u' + hex + ']');
          }
          this.index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          const rep = ESCAPE[ch];
          string = string + (rep || ch);
        }
        escape = false;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === quote) {
        this.index++;
        this.tokens.push({
          index: start,
          text: rawString,
          constant: true,
          value: string
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
    this.throwError('Unterminated quote', start);
  }
}

class AST {
  constructor(lexer) {
    this.lexer = lexer;
    this.options = {
      literals: {
        true: true,
        false: false,
        null: null,
        undefined: undefined
      }
    };
  }

  static Program = 'Program';
  static ExpressionStatement = 'ExpressionStatement';
  static AssignmentExpression = 'AssignmentExpression';
  static ConditionalExpression = 'ConditionalExpression';
  static LogicalExpression = 'LogicalExpression';
  static BinaryExpression = 'BinaryExpression';
  static UnaryExpression = 'UnaryExpression';
  static CallExpression = 'CallExpression';
  static MemberExpression = 'MemberExpression';
  static Identifier = 'Identifier';
  static Literal = 'Literal';
  static ArrayExpression = 'ArrayExpression';
  static Property = 'Property';
  static ObjectExpression = 'ObjectExpression';
  static ThisExpression = 'ThisExpression';
  static LocalsExpression = 'LocalsExpression';

  // Internal use only
  static NGValueParameter = 'NGValueParameter';

  ast(text) {
    this.text = text;
    this.tokens = this.lexer.lex(text);

    const value = this.program();

    if (this.tokens.length !== 0) {
      this.throwError('is an unexpected token', this.tokens[0]);
    }

    return value;
  }

  program() {
    const body = [];
    while (true) {
      if (this.tokens.length > 0 && !this.peek('}', ')', ';', ']')) body.push(this.expressionStatement());
      if (!this.expect(';')) {
        return { type: AST.Program, body: body };
      }
    }
  }

  expressionStatement() {
    return { type: AST.ExpressionStatement, expression: this.filterChain() };
  }

  filterChain() {
    let left = this.expression();
    while (this.expect('|')) {
      left = this.filter(left);
    }
    return left;
  }

  expression() {
    return this.assignment();
  }

  assignment() {
    let result = this.ternary();
    if (this.expect('=')) {
      if (!isAssignable(result)) {
        throw throwParseError('lval', 'Trying to assign a value to a non l-value');
      }

      result = { type: AST.AssignmentExpression, left: result, right: this.assignment(), operator: '=' };
    }
    return result;
  }

  ternary() {
    const test = this.logicalOR();
    let alternate, consequent;
    if (this.expect('?')) {
      alternate = this.expression();
      if (this.consume(':')) {
        consequent = this.expression();
        return { type: AST.ConditionalExpression, test: test, alternate: alternate, consequent: consequent };
      }
    }
    return test;
  }

  logicalOR() {
    let left = this.logicalAND();
    while (this.expect('||')) {
      left = { type: AST.LogicalExpression, operator: '||', left: left, right: this.logicalAND() };
    }
    return left;
  }

  logicalAND() {
    let left = this.equality();
    while (this.expect('&&')) {
      left = { type: AST.LogicalExpression, operator: '&&', left: left, right: this.equality() };
    }
    return left;
  }

  equality() {
    let left = this.relational();
    let token;
    while ((token = this.expect('==', '!=', '===', '!=='))) {
      left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.relational() };
    }
    return left;
  }

  relational() {
    let left = this.additive();
    let token;
    while ((token = this.expect('<', '>', '<=', '>='))) {
      left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.additive() };
    }
    return left;
  }

  additive() {
    let left = this.multiplicative();
    let token;
    while ((token = this.expect('+', '-'))) {
      left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.multiplicative() };
    }
    return left;
  }

  multiplicative() {
    let left = this.unary();
    let token;
    while ((token = this.expect('*', '/', '%'))) {
      left = { type: AST.BinaryExpression, operator: token.text, left: left, right: this.unary() };
    }
    return left;
  }

  unary() {
    let token;
    if ((token = this.expect('+', '-', '!'))) {
      return { type: AST.UnaryExpression, operator: token.text, prefix: true, argument: this.unary() };
    } else {
      return this.primary();
    }
  }

  primary() {
    let primary;
    if (this.expect('(')) {
      primary = this.filterChain();
      this.consume(')');
    } else if (this.expect('[')) {
      primary = this.arrayDeclaration();
    } else if (this.expect('{')) {
      primary = this.object();
    } else if (this.peek().text === '`') {
      // **🔹 Detect template literals**
      primary = this.templateLiteral();
    } else if (this.selfReferential.hasOwnProperty(this.peek().text)) {
      primary = copy(this.selfReferential[this.consume().text]);
    } else if (this.options.literals.hasOwnProperty(this.peek().text)) {
      primary = { type: AST.Literal, value: this.options.literals[this.consume().text] };
    } else if (this.peek().identifier) {
      primary = this.identifier();
    } else if (this.peek().constant) {
      primary = this.constant();
    } else {
      this.throwError('not a primary expression', this.peek());
    }

    let next;
    while ((next = this.expect('(', '[', '.'))) {
      if (next.text === '(') {
        primary = { type: AST.CallExpression, callee: primary, arguments: this.parseArguments() };
        this.consume(')');
      } else if (next.text === '[') {
        primary = { type: AST.MemberExpression, object: primary, property: this.expression(), computed: true };
        this.consume(']');
      } else if (next.text === '.') {
        primary = { type: AST.MemberExpression, object: primary, property: this.identifier(), computed: false };
      } else {
        this.throwError('IMPOSSIBLE');
      }
    }
    return primary;
  }

  /**
   * **🔹 New Method: Parses Template Literals with Interpolation**
   */
  templateLiteral() {
    let elements = [];

    this.consume('`'); // **Consume opening backtick**

    while (this.tokens.length > 0) {
      let token = this.tokens[0];

      if (token.type === 'TEMPLATE_LITERAL_CONTENT') {
        elements.push({ type: AST.Literal, value: token.text });
        this.tokens.shift();
      } else if (token.type === 'INTERPOLATION_START') {
        this.consume('${'); // **Consume `${`**
        elements.push(this.expression()); // **Parse expression inside interpolation**
        this.consume('}'); // **Ensure `}` is present**
      } else if (token.text === '`') {
        this.consume('`'); // **Consume closing backtick**
        return { type: AST.TemplateLiteral, elements: elements };
      } else {
        this.throwError('Unexpected token in template literal', token);
      }
    }

    this.throwError('Unclosed template literal');
  }

  filter(baseExpression) {
    const args = [baseExpression];
    const result = { type: AST.CallExpression, callee: this.identifier(), arguments: args, filter: true };

    while (this.expect(':')) {
      args.push(this.expression());
    }

    return result;
  }

  parseArguments() {
    const args = [];
    if (this.peekToken().text !== ')') {
      do {
        args.push(this.filterChain());
      } while (this.expect(','));
    }
    return args;
  }

  identifier() {
    const token = this.consume();
    if (!token.identifier) {
      this.throwError('is not a valid identifier', token);
    }
    return { type: AST.Identifier, name: token.text };
  }

  constant() {
    // TODO check that it is a constant
    return { type: AST.Literal, value: this.consume().value };
  }

  arrayDeclaration() {
    const elements = [];
    if (this.peekToken().text !== ']') {
      do {
        if (this.peek(']')) {
          // Support trailing commas per ES5.1.
          break;
        }
        elements.push(this.expression());
      } while (this.expect(','));
    }
    this.consume(']');

    return { type: AST.ArrayExpression, elements: elements };
  }

  object() {
    const properties = [];
    let property;
    if (this.peekToken().text !== '}') {
      do {
        if (this.peek('}')) {
          // Support trailing commas per ES5.1.
          break;
        }
        property = { type: AST.Property, kind: 'init' };
        if (this.peek().constant) {
          property.key = this.constant();
          property.computed = false;
          this.consume(':');
          property.value = this.expression();
        } else if (this.peek().identifier) {
          property.key = this.identifier();
          property.computed = false;
          if (this.peek(':')) {
            this.consume(':');
            property.value = this.expression();
          } else {
            property.value = property.key;
          }
        } else if (this.peek('[')) {
          this.consume('[');
          property.key = this.expression();
          this.consume(']');
          property.computed = true;
          this.consume(':');
          property.value = this.expression();
        } else {
          this.throwError('invalid key', this.peek());
        }
        properties.push(property);
      } while (this.expect(','));
    }
    this.consume('}');

    return { type: AST.ObjectExpression, properties: properties };
  }

  throwError(msg, token) {
    throw throwParseError('syntax', "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].", token.text, msg, token.index + 1, this.text, this.text.substring(token.index));
  }

  consume(e1) {
    if (this.tokens.length === 0) {
      throw throwParseError('ueoe', 'Unexpected end of expression: {0}', this.text);
    }

    const token = this.expect(e1);
    if (!token) {
      this.throwError('is unexpected, expecting [' + e1 + ']', this.peek());
    }
    return token;
  }

  peekToken() {
    if (this.tokens.length === 0) {
      throw throwParseError('ueoe', 'Unexpected end of expression: {0}', this.text);
    }
    return this.tokens[0];
  }

  peek(e1, e2, e3, e4) {
    return this.peekAhead(0, e1, e2, e3, e4);
  }

  peekAhead(i, e1, e2, e3, e4) {
    if (this.tokens.length > i) {
      const token = this.tokens[i];
      const t = token.text;
      if (t === e1 || t === e2 || t === e3 || t === e4 || (!e1 && !e2 && !e3 && !e4)) {
        return token;
      }
    }
    return false;
  }

  expect(e1, e2, e3, e4) {
    const token = this.peek(e1, e2, e3, e4);
    if (token) {
      this.tokens.shift();
      return token;
    }
    return false;
  }

  selfReferential = {
    this: { type: AST.ThisExpression },
    $locals: { type: AST.LocalsExpression }
  };
}

class ASTInterpreter {
  compile(ast) {
    let assignable;
    let assign;
    if ((assignable = assignableAST(ast))) {
      assign = this.recurse(assignable);
    }

    const expressions = [];
    ast.body.forEach(expression => {
      expressions.push(this.recurse(expression.expression));
    });
    const fn =
      ast.body.length === 0
        ? noop
        : ast.body.length === 1
        ? expressions[0]
        : (scope, locals) => {
            let lastValue;
            expressions.forEach(exp => {
              lastValue = exp(scope, locals);
            });
            return lastValue;
          };
    if (assign) {
      fn.assign = function (scope, value, locals) {
        return assign(scope, locals, value);
      };
    }
    // if (inputs) {
    //   fn.inputs = inputs;
    // }
    return fn;
  }

  recurse(ast, context, create) {
    let left,
      right,
      self = this,
      args;
    // if (ast.input) {
    //   return this.inputs(ast.input, ast.watchId);
    // }
    switch (ast.type) {
      case AST.Literal:
        return this.value(ast.value, context);
      case AST.UnaryExpression:
        right = this.recurse(ast.argument, context);
        return this['unary' + ast.operator](right, context);
      case AST.BinaryExpression:
        left = this.recurse(ast.left, context);
        right = this.recurse(ast.right, context);
        return this['binary' + ast.operator](left, right, context);
      case AST.LogicalExpression:
        left = this.recurse(ast.left, context);
        right = this.recurse(ast.right, context);
        return this['binary' + ast.operator](left, right, context);
      case AST.ConditionalExpression:
        return this['ternary?:'](this.recurse(ast.test, context), this.recurse(ast.alternate, context), this.recurse(ast.consequent, context), context);
      case AST.Identifier:
        return self.identifier(ast.name, context, create);
      case AST.MemberExpression:
        left = this.recurse(ast.object, false, !!create);
        if (!ast.computed) {
          right = ast.property.name;
        }
        if (ast.computed) right = this.recurse(ast.property, context);
        return ast.computed ? this.computedMember(left, right, context, create) : this.nonComputedMember(left, right, context, create);
      case AST.CallExpression:
        args = [];
        forEach(ast.arguments, function (expr) {
          args.push(self.recurse(expr, context));
        });
        right = this.recurse(ast.callee, true);
        return function (scope, locals, assign, inputs) {
          const rhs = right(scope, locals, assign, inputs);
          let value;
          if (rhs.value != null) {
            const values = [];
            for (let i = 0; i < args.length; ++i) {
              values.push(args[i](scope, locals, assign, inputs));
            }
            value = rhs.value.apply(rhs.context, values);
          }
          return context ? { value: value } : value;
        };
      case AST.AssignmentExpression:
        left = this.recurse(ast.left, true, 1);
        right = this.recurse(ast.right, context);
        return function (scope, locals, assign, inputs) {
          const lhs = left(scope, locals, assign, inputs);
          const rhs = right(scope, locals, assign, inputs);
          lhs.context[lhs.name] = rhs;
          return context ? { value: rhs } : rhs;
        };
      case AST.ArrayExpression:
        args = [];
        forEach(ast.elements, function (expr) {
          args.push(self.recurse(expr, context));
        });
        return function (scope, locals, assign, inputs) {
          const value = [];
          for (let i = 0; i < args.length; ++i) {
            value.push(args[i](scope, locals, assign, inputs));
          }
          return context ? { value: value } : value;
        };
      case AST.ObjectExpression:
        args = [];
        forEach(ast.properties, function (property) {
          if (property.computed) {
            args.push({ key: self.recurse(property.key, context), computed: true, value: self.recurse(property.value, context) });
          } else {
            args.push({ key: property.key.type === AST.Identifier ? property.key.name : '' + property.key.value, computed: false, value: self.recurse(property.value, context) });
          }
        });
        return function (scope, locals, assign, inputs) {
          const value = {};
          for (let i = 0; i < args.length; ++i) {
            if (args[i].computed) {
              value[args[i].key(scope, locals, assign, inputs)] = args[i].value(scope, locals, assign, inputs);
            } else {
              value[args[i].key] = args[i].value(scope, locals, assign, inputs);
            }
          }
          return context ? { value: value } : value;
        };
      case AST.ThisExpression:
        return function (scope) {
          return context ? { value: scope } : scope;
        };
      case AST.LocalsExpression:
        return function (scope, locals) {
          return context ? { value: locals } : locals;
        };
      case AST.NGValueParameter:
        return function (scope, locals, assign) {
          return context ? { value: assign } : assign;
        };
      case AST.TemplateLiteral:
        const elements = ast.elements.map(element => this.recurse(element, context));

        return function (scope, locals, assign, inputs) {
          let result = '';
          elements.forEach(element => {
            result += element(scope, locals, assign, inputs); // Concatenate evaluated string parts
          });
          return context ? { value: result } : result;
        };
    }
  }

  'unary+'(argument, context) {
    return function (scope, locals, assign, inputs) {
      let arg = argument(scope, locals, assign, inputs);
      if (isDefined(arg)) {
        arg = +arg;
      } else {
        arg = 0;
      }
      return context ? { value: arg } : arg;
    };
  }
  'unary-'(argument, context) {
    return function (scope, locals, assign, inputs) {
      let arg = argument(scope, locals, assign, inputs);
      if (isDefined(arg)) {
        arg = -arg;
      } else {
        arg = -0;
      }
      return context ? { value: arg } : arg;
    };
  }
  'unary!'(argument, context) {
    return function (scope, locals, assign, inputs) {
      const arg = !argument(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary+'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const lhs = left(scope, locals, assign, inputs);
      const rhs = right(scope, locals, assign, inputs);
      const arg = plusFn(lhs, rhs);
      return context ? { value: arg } : arg;
    };
  }
  'binary-'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const lhs = left(scope, locals, assign, inputs);
      const rhs = right(scope, locals, assign, inputs);
      const arg = (isDefined(lhs) ? lhs : 0) - (isDefined(rhs) ? rhs : 0);
      return context ? { value: arg } : arg;
    };
  }
  'binary*'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) * right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary/'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) / right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary%'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) % right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary==='(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) === right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary!=='(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) !== right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary=='(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) == right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary!='(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) != right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary<'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) < right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary>'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) > right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary<='(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) <= right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary>='(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) >= right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary&&'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) && right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'binary||'(left, right, context) {
    return function (scope, locals, assign, inputs) {
      const arg = left(scope, locals, assign, inputs) || right(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  'ternary?:'(test, alternate, consequent, context) {
    return function (scope, locals, assign, inputs) {
      const arg = test(scope, locals, assign, inputs) ? alternate(scope, locals, assign, inputs) : consequent(scope, locals, assign, inputs);
      return context ? { value: arg } : arg;
    };
  }
  value(value, context) {
    return function () {
      return context ? { context: undefined, name: undefined, value: value } : value;
    };
  }
  identifier(name, context, create) {
    return function (scope, locals, assign, inputs) {
      const base = locals && name in locals ? locals : scope;
      if (create && create !== 1 && base && base[name] == null) {
        base[name] = {};
      }
      const value = base ? base[name] : undefined;
      if (context) {
        return { context: base, name: name, value: value };
      } else {
        return value;
      }
    };
  }
  computedMember(left, right, context, create) {
    return function (scope, locals, assign, inputs) {
      const lhs = left(scope, locals, assign, inputs);
      let rhs;
      let value;
      if (lhs != null) {
        rhs = right(scope, locals, assign, inputs);
        rhs = getStringValue(rhs);
        if (create && create !== 1) {
          if (lhs && !lhs[rhs]) {
            lhs[rhs] = {};
          }
        }
        value = lhs[rhs];
      }
      if (context) {
        return { context: lhs, name: rhs, value: value };
      } else {
        return value;
      }
    };
  }
  nonComputedMember(left, right, context, create) {
    return function (scope, locals, assign, inputs) {
      const lhs = left(scope, locals, assign, inputs);
      if (create && create !== 1) {
        if (lhs && lhs[right] == null) {
          lhs[right] = {};
        }
      }
      const value = lhs != null ? lhs[right] : undefined;
      if (context) {
        return { context: lhs, name: right, value: value };
      } else {
        return value;
      }
    };
  }
}

function isAssignable(ast) {
  return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
}

function assignableAST(ast) {
  if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
    return { type: AST.AssignmentExpression, left: ast.body[0].expression, right: { type: AST.NGValueParameter }, operator: '=' };
  }
}

function isLiteral(ast) {
  return ast.body.length === 0 || (ast.body.length === 1 && (ast.body[0].expression.type === AST.Literal || ast.body[0].expression.type === AST.ArrayExpression || ast.body[0].expression.type === AST.ObjectExpression));
}

function isConstant(ast) {
  return ast.constant;
}

function plusFn(l, r) {
  if (typeof l === 'undefined') return r;
  if (typeof r === 'undefined') return l;
  return l + r;
}

// ------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------- //

/**
 * I parse the given expression into an evaluator function.
 */
function parse(expression) {
  const lexer = new Lexer();
  const astCreator = new AST(lexer);
  const astCompiler = new ASTInterpreter();
  const ast = astCreator.ast(expression);
  const compiledFn = astCompiler.compile(ast);

  return function (scope = {}, locals = {}) {
    return compiledFn(scope, locals); // Pass the scope and locals to the compiled function
  };
}

export { Lexer, AST, ASTInterpreter, parse };
