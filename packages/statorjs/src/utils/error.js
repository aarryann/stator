export function tryCatch(el, expression, callback, ...args) {
  console.log(5);
  console.log(args);
  console.log(6);
  try {
    return callback(...args);
  } catch (e) {
    handleError(e, el, expression);
  }
}

export function handleError(error, el, expression = undefined) {
  error = Object.assign(error ?? { message: 'No error message given.' }, { el, expression });

  console.warn(`Stator Expression Error: ${error.message}\n\n${expression ? 'Expression: "' + expression + '"\n\n' : ''}`, el);

  setTimeout(() => {
    throw error;
  }, 0);
}
