import { generateEvaluatorFromFunction, runIfTypeOfFunction } from './evaluatorNormal';
import { closestDataStack, mergeProxies } from './scope';
import { tryCatch } from './utils/error';
import { toJson } from './utils/toJson';
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
    //console.log(completeScope);
    let flattenedScope = Object.assign({}, scope, ...[...dataStack].reverse());

    let evaluatedExpression;
    try {
      // Parse and evaluate the expression with expr-eval
      const exprStr = expression.trim();
      if (exprStr.startsWith('{')) {
        //evaluatedExpression = JSON.parse(exprStr);
        evaluatedExpression = toJson(exprStr);
      } else {
        const updatedExpression = expression;
        const expr = parser.parse(updatedExpression);
        evaluatedExpression = expr.evaluate(flattenedScope);
        console.log(10);
        console.log(completeScope);
        console.log(evaluatedExpression);
      }
    } catch (e) {
      throwExpressionError(el, expression, e);
      return;
    }

    runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
  };
}

function runExprEvaluator(expression, completeScope) {
  if (!exprParser) {
    exprParser = new Parser();
    exprParser.functions.concat = (...args) => args.join('');
  }

  const exprArr = expression.split(';');
  let evaluatedExpression;
  if (/^[\n\s]*if.*\(.*\)/.test(expression.trim())) {
    const parsedExpr = exprParser.parse(expression);
    evaluatedExpression = expression.evaluate(completeScope);
  } else {
    exprArr.array.forEach(expr => {
      const parsedExpr = exprParser.parse(expr);
      evaluatedExpression = expr.evaluate(completeScope);
    });
  }
}

function extractVariableNames(expression) {
  const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g; // Matches valid variable names
  const matches = [];
  let match;

  while ((match = regex.exec(expression)) !== null) {
    matches.push(match[1]);
  }

  // Remove duplicates (if needed)
  return [...new Set(matches)];
}

function extractScopeVariables(expression) {
  const variables = new Set();

  const chunks = expression.split(/[\{\},:;\?\(&\|]/).filter(Boolean);

  for (let chunk of chunks) {
    chunk = chunk.trim();
    if (/^(if|else|let|const|var)\s+/.test(chunk)) {
      continue;
    }
    const match = chunk.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
    if (match) {
      variables.add(match[1]); // Extract the variable name
      continue;
    }
    const incMatch = chunk.match(/([a-zA-Z_$][a-zA-Z0-9_$]*)(\+\+|--)/);
    if (incMatch) {
      variables.add(incMatch[1]); // Extract the variable name
      continue;
    }
    const standaloneMatch = chunk.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
    if (standaloneMatch) {
      variables.add(standaloneMatch[1]); // Add the variable name
      continue;
    }
    const returnMatch = chunk.match(/^return\s+([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
    if (returnMatch) {
      variables.add(returnMatch[1]); // Add the variable name
      continue;
    }
  }

  return Array.from(variables); // Return the variables as an array
}

export const workerScript = `
  let evaluatorMemo = {};
  self.onmessage = function(e) {
    const { expression, scope } = e.data;
    if (!evaluatorMemo[expression]) {
      let AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      let rightSideSafeExpression =
        /^[\n\s]*if.*\(.*\)/.test(expression.trim()) ||
        /^(let|const)\s/.test(expression.trim())
          ? \`(async()=>{ \${expression} })()\`
          : expression;

      try {
        let func = new AsyncFunction(['scope'], \`with (scope) { return \${rightSideSafeExpression} }\`);
        evaluatorMemo[expression] = func;
      } catch (error) {
        self.postMessage({ success: false, error: error.message });
        return;
      }
    }
    let func = evaluatorMemo[expression];

    try {
      let result = func(scope);

      if (result instanceof Promise) {
        result
          .then(resolvedValue => {
            self.postMessage({ success: true, result: resolvedValue });
          })
          .catch(error => {
            self.postMessage({ success: false, error: error.message });
          });
      } else {
        self.postMessage({ success: true, result });
      }
    } catch (error) {
      self.postMessage({ success: false, error: error.message });
    }
  };
`;

let evalWorker;
export function createWorker(script) {
  const blob = new Blob([script], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

const evaluateExpression = (expression, scope) => {
  if (!evalWorker) {
    evalWorker = createWorker(workerScript);
  }
  sendMessageToWorker(evalWorker, expression, scope);
};

const terminateWorker = evalWorker => {
  evalWorker.terminate();
  evalWorker = null;
};

const sendMessageToWorker = (worker, expression, scope) => {
  if (!evalWorker) {
    evalWorker = createWorker(workerScript);
  }
  return new Promise((resolve, reject) => {
    worker.onmessage = event => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data.result);
      }
    };
    worker.postMessage({ expression, scope });
  });
};

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
