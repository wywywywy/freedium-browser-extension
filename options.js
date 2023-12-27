// Saves options to chrome.storage
const saveOptions = () => {
  const patterns = document.getElementById('custom_patterns').value;

  chrome.storage.sync.set(
    { patterns: patterns, },
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
    { patterns: '' },
    (items) => {
      document.getElementById('custom_patterns').value = items.patterns;
    }
  );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
