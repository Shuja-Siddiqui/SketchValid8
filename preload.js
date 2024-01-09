window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const elem = document.getElementById(selector);
    if (elem) elem.innerText = text;
  };
  for (const text of ['chrome', 'node', 'electron']) {
    replaceText(`${text}-version`, process.versions[text]);
  }
});
