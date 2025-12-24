// Saves options to chrome.storage
const saveOptions = () => {
  const patterns = document.getElementById('custom_patterns').value;
  let freediumBaseUrl = document.getElementById('freedium-url').value.trim();
  const openInNewTab = document.getElementById('open-in-new-tab').checked;

  if ( !freediumBaseUrl ) {
    freediumBaseUrl = 'https://freedium-mirror.cfd/';
  }

  // Ensure trailing slash
  if (!freediumBaseUrl.endsWith('/')) {
    freediumBaseUrl += '/';
  }

  chrome.storage.sync.set(
    { 
      patterns: patterns,
      freediumBaseUrl,
      openInNewTab,
    },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);

      // Let the background script know
      chrome.runtime.sendMessage({ message: "settingsSaved" });
    }
  );
};

// Restores textarea state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(
    { 
      patterns: '',
      freediumBaseUrl: 'https://freedium-mirror.cfd/',
      openInNewTab: true,
    },
    (items) => {
      document.getElementById('custom_patterns').value = items.patterns;
      document.getElementById('freedium-url').value = items.freediumBaseUrl;
      document.getElementById('open-in-new-tab').checked = items.openInNewTab;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
