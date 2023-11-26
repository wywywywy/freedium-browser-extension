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
  CONTEXT_MENU_CONTENTS.link.forEach((command) => {
    chrome.contextMenus.create({
      title: command.title,
      type: command.type,
      id: command.id,
      targetUrlPatterns: command.targetUrlPatterns,
      contexts: ['link'],
    });
  });
  CONTEXT_MENU_CONTENTS.page.forEach((command) => {
    chrome.contextMenus.create({
      title: command.title,
      type: command.type,
      id: command.id,
      documentUrlPatterns: command.documentUrlPatterns,
      contexts: ['page'],
    });
  });
};

const freedium = (url, newTab) => {
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

chrome.contextMenus.onClicked.addListener((item) => {
  switch (item.menuItemId) {
    case 'freedium-link':
      freedium(item.linkUrl, true);
      break;
    case 'freedium-page':
      freedium(item.pageUrl, false);
      break;
  }
});
