
// This preload script is a secure bridge for any potential
// communication between the web content (renderer process)
// and the Electron main process.

// For now, it's empty, but we can expose APIs here later for
// native OS integrations like accessing the file system.
window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded.');
});
