document.addEventListener('DOMContentLoaded', () => {
  let test = document.createElement('div');
  test.textContent = 'Document is fully loaded from test.js!';
  document.querySelector('blockquote').after(test);
  console.log('Document is fully loaded!');
});
