const CONTEXT_MENU_CONTENTS = {
  /** @type {chrome.contextMenus.CreateProperties[]} */
  link: [
    {
      title: 'Open in Freedium',
      type: 'normal',
      id: 'freedium-link',
      targetUrlPatterns: [
        '*://*.medium.com/*',
        '*://medium.com/*',
      ],
    },
  ],
  /** @type {chrome.contextMenus.CreateProperties[]} */
  page: [
    {
      title: 'Open in Freedium',
      type: 'normal',
      id: 'freedium-page',
      documentUrlPatterns: [
        '*://*.medium.com/*',
        '*://medium.com/*',
      ],
    },
  ],
}

const setUpContextMenus = () => {
  chrome.storage.sync.get(
    { patterns: '' },
    (items) => {
      /** @type {string} */
      const patterns = items.patterns;
      const patternsArray = patterns.replace(/\r/g, '').split('\n').filter(p => p).map(p => p.trim());

      CONTEXT_MENU_CONTENTS.link.forEach((command) => {
        chrome.contextMenus.create({
          title: command.title,
          type: command.type,
          id: command.id,
          targetUrlPatterns: command.targetUrlPatterns.concat(patternsArray),
          contexts: ['link'],
        });
      });
      CONTEXT_MENU_CONTENTS.page.forEach((command) => {
        chrome.contextMenus.create({
          title: command.title,
          type: command.type,
          id: command.id,
          documentUrlPatterns: command.documentUrlPatterns.concat(patternsArray),
          contexts: ['page'],
        });
      });
    }
  );
};

/**
 * Open a URL in Freedium
 * @param {string} url 
 * @param {boolean} newTab - open in a new tab?
 * @returns 
 */
const openInFreedium = (url, newTab) => {
  if (!url) {
    return;
  }

  if (newTab) {
    chrome.tabs.create({
      url: 'https://freedium.cfd/' + url,
    })
  } else {
    chrome.tabs.update({
      url: 'https://freedium.cfd/' + url,
    })
  }
};

chrome.runtime.onInstalled.addListener(() => {
  setUpContextMenus();
});

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.message === "settingsSaved") {
      chrome.contextMenus.removeAll(() => {
        setUpContextMenus();
      });
    }
  }
);

chrome.contextMenus.onClicked.addListener((item) => {
  switch (item.menuItemId) {
    case 'freedium-link':
      openInFreedium(item.linkUrl, true);
      break;
    case 'freedium-page':
      openInFreedium(item.pageUrl, false);
      break;
  }
});
