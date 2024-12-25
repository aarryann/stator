import { generateEvaluatorFromFunction, runIfTypeOfFunction } from './evaluatorNormal';
import { closestDataStack, mergeProxies } from './scope';
import { tryCatch } from './utils/error';
import { injectMagics } from './magics';
import { Parser } from 'expr-eval'; // Import expr-eval

let exprParser;

export function exprEvaluator(el, expression) {
  let dataStack = generateDataStack(el);

  // Return if the provided expression is already a function...
  if (typeof expression === 'function') {
    return generateEvaluatorFromFunction(dataStack, expression);
  }

  let evaluator = generateEvaluator(el, expression, dataStack);

  return tryCatch.bind(null, el, expression, evaluator);
}

function generateDataStack(el) {
  let overriddenMagics = {};

  injectMagics(overriddenMagics, el);

  return [overriddenMagics, ...closestDataStack(el)];
}

function prepareScopeForExprEval(scope) {
  const updatedScope = {};
  scope.objects.forEach((obj, index) => {
    Object.entries(obj).forEach(([key, value]) => {
      // Create unique keys for each object property
      updatedScope[`objects[${index}].${key}`] = value;
    });
  });
  return updatedScope;
}

function getParser() {
  if (!exprParser) {
    exprParser = new Parser();
    exprParser.functions.concat = (...args) => args.join('');
  }
  return exprParser;
}

function generateEvaluator(el, expression, dataStack) {
  // Create a parser for the expression
  const parser = getParser();

  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    let completeScope = mergeProxies([scope, ...dataStack]);
    let flattenedScope = Object.assign({}, scope, ...[...dataStack].reverse());

    let evaluatedExpression;
    try {
      // Parse and evaluate the expression with expr-eval
      const exprCheck = expression.trim();
      if (exprCheck.startsWith('{')) {
        evaluatedExpression = JSON.parse(exprCheck);
      } else {
        const updatedExpression = expression;
        const expr = parser.parse(updatedExpression);
        evaluatedExpression = expr.evaluate(flattenedScope);
      }
    } catch (e) {
      throwExpressionError(el, expression, e);
      return;
    }

    runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
  };
}

function throwExpressionError(el, expression, error) {
  console.warn(
    `Stator Error: Stator is unable to interpret the following expression using the CSP-friendly build:

        "${expression}"

        Error: ${error.message}

        Read more about Stator's CSP-friendly build restrictions here: https://stator.io/advanced/csp
        `,
    el
  );
}
