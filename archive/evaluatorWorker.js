import { generateEvaluatorFromFunction, runIfTypeOfFunction } from '../packages/statorjs/src/evaluatorNormal';
import { closestDataStack, mergeProxies } from '../packages/statorjs/src/scope';
import { tryCatch, handleError } from '../packages/statorjs/src/utils/error';
import { toJson } from '../packages/statorjs/src/utils/toJson';
import { injectMagics } from '../packages/statorjs/src/magics';
import { data } from '../packages/statorjs/src/datas';

let exprParser;

export function workerEvaluator(el, expression) {
  let dataStack = generateDataStack(el);

  // Return if the provided expression is already a function...
  if (typeof expression === 'function') {
    return generateEvaluatorFromFunction(dataStack, expression);
  }

  let evaluator = generateEvaluatorSync(el, expression, dataStack);

  return tryCatch.bind(null, el, expression, evaluator);
}

function generateDataStack(el) {
  let overriddenMagics = {};

  injectMagics(overriddenMagics, el);

  return [overriddenMagics, ...closestDataStack(el)];
}

function generateEvaluatorAsync(el, expression, dataStack) {
  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    let completeScope = mergeProxies([scope, ...dataStack]);

    try {
      // Parse and evaluate the expression with expr-eval
      const exprStr = expression.trim();
      if (exprStr.startsWith('{')) {
        const evaluatedExpression = toJson(exprStr, completeScope);
        runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
      } else {
        sendMessageToWorkerAsync(expression, completeScope)
          .then(evaluatedExpression => {
            runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
          })
          .catch(error => handleError(error, el, expression));
      }
    } catch (e) {
      throwExpressionError(el, expression, e);
      return;
    }
  };
}

function generateEvaluatorSync(el, expression, dataStack) {
  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    let completeScope = mergeProxies([scope, ...dataStack]);

    let evaluatedExpression;
    try {
      // Parse and evaluate the expression with expr-eval
      const exprStr = expression.trim();
      if (exprStr.startsWith('{')) {
        evaluatedExpression = toJson(exprStr, completeScope);
      } else {
        evaluatedExpression = sendMessageToWorkerGenerator(expression, completeScope);
      }
    } catch (e) {
      throwExpressionError(el, expression, e);
      return;
    }

    runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
  };
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

export const workerScript1 = `onmessage = e => {console.log(e); return postMessage(e.data*2)}`;

export const workerScript = `
  let evaluatorMemo = {};

  self.onmessage = function(e) {
    const { expression, scope, id } = e.data;

    try {
      if (!evaluatorMemo[expression]) {
        let AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        let rightSideSafeExpression =
          /^[\\n\s]*if.*\(.*\)/.test(expression.trim()) ||
          /^(let|const)\s/.test(expression.trim())
            ? \`(async()=>{ \${expression} })()\`
            : expression;

        evaluatorMemo[expression] = new AsyncFunction(['scope'], \`with (scope) { return \${rightSideSafeExpression} }\`);
      }

      let func = evaluatorMemo[expression];
      let result = func(scope);

      Promise.resolve(result)
        .then(value => {
          self.postMessage({ id, success: true, result: value });
        })
        .catch(error => {
          self.postMessage({ id, success: false, error: error.message });
        });
    } catch (error) {
      self.postMessage({ id, success: false, error: error.message });
    }
  };
`;

let evalWorker;
export function createWorker(script) {
  const blob = new Blob([script], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

const sendMessageToWorker = (expression, scope) => {
  if (!evalWorker) {
    evalWorker = createWorker(workerScript);
  }
  const lock = new Int32Array(new SharedArrayBuffer(4));
  Atomics.store(lock, 0, 0);
  let result, error;
  let done = false;
  evalWorker.onmessage = event => {
    if (event.data.error) {
      error = event.data.error;
    } else {
      result = event.data.result;
    }
    done = true;
  };
  evalWorker.postMessage({ expression, scope, lock });

  Atomics.wait(lock, 0, 0); // Blocks until worker signals completion

  if (error) throw new Error(error);
  return result;
};

const terminateWorker = evalWorker => {
  evalWorker.terminate();
  evalWorker = null;
};

function sendMessageToWorkerSync(expression, scope) {
  if (!evalWorker) {
    evalWorker = createWorker(workerScript);
  }
  let workerTask = { done: false, result: null, error: null };
  evalWorker.onmessage = event => {
    if (event.data.error) {
      workerTask.error = event.data.error;
    } else {
      workerTask.result = event.data.result;
    }
    workerTask.done = true;
  };
  evalWorker.postMessage({ expression, scope });

  //if (error) throw new Error(error);

  return workerTask;
}

const sendMessageToWorkerAsync = (expression, scope) => {
  if (!evalWorker) {
    evalWorker = createWorker(workerScript);
  }
  evalWorker.postMessage({ expression, scope });
  return new Promise((resolve, reject) => {
    evalWorker.onmessage = event => {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data.result);
      }
    };
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

let currentId = 100;
const pendingRequests = new Map();

function setupWorker() {
  if (!evalWorker) {
    evalWorker = createWorker(workerScript);
  }
}

export function* evaluateExpression(expression, scope) {
  setupWorker();
  evalWorker.onmessage = event => {
    const { id, success, result, error } = event.data;
    const generator = pendingRequests.get(id);
    if (generator) {
      if (success) {
        generator.next(result);
      } else {
        generator.throw(new Error(error));
      }
      pendingRequests.delete(id);
    }
  };

  const id = currentId++;
  const generator = yield;
  pendingRequests.set(id, generator);

  evalWorker.postMessage({ expression, scope, id });
  const result = yield;
  yield;
  return result;
}

export const runEvaluation = (expression, scope) => {
  const generator = evaluateExpression(expression, scope);
  generator.next(); // Start generator
  generator.next(generator); // Pass generator instance back in
  return generator;
};

export const sendMessageToWorkerGenerator = (expression, scope) => {
  const { value, done } = runEvaluation(expression, scope).next();

  return value;
};
