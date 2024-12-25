import { generateEvaluatorFromFunction, runIfTypeOfFunction } from './evaluatorNormal';
import { closestDataStack, mergeProxies } from './scope';
import { tryCatch } from './utils/error';
import { injectMagics } from './magics';
import { Parser } from 'expr-eval'; // Import expr-eval

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

function generateEvaluator(el, expression, dataStack) {
  // Create a parser for the expression
  const parser = new Parser();

  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    let completeScope = mergeProxies([scope, ...dataStack]);

    let evaluatedExpression;
    try {
      // Parse and evaluate the expression with expr-eval
      const exprCheck = expression.trim();
      if (exprCheck.startsWith('{')) {
        evaluatedExpression = JSON.parse(exprCheck);
      } else {
        const expr = parser.parse(expression);
        evaluatedExpression = expr.evaluate(completeScope);
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
