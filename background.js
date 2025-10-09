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

// Candidate Freedium mirrors to try (order matters)
const FREEDIUM_BASE_URLS = [
  'https://freedium.cfd/',
  'https://freedium-mirror.cfd/',
];

// Cache the last known-good base URL for a few minutes to avoid repeated probes
let cachedBaseUrl = null;
let cachedBaseUrlCheckedAt = 0;
const BASE_URL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Lightweight "is alive" check for a URL.
 * Uses no-cors so it resolves if the host is reachable.
 * @param {string} baseUrl
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
const checkUrlAlive = async (baseUrl, timeoutMs = 1500) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(baseUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      redirect: 'follow',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Get a working Freedium base URL (cached), probing candidates if needed.
 * @returns {Promise<string>}
 */
const getFreediumBaseUrl = async () => {
  const now = Date.now();
  if (cachedBaseUrl && (now - cachedBaseUrlCheckedAt) < BASE_URL_CACHE_TTL_MS) {
    return cachedBaseUrl;
  }

  for (const url of FREEDIUM_BASE_URLS) {
    const alive = await checkUrlAlive(url);
    if (alive) {
      cachedBaseUrl = url;
      cachedBaseUrlCheckedAt = now;
      return url;
    }
  }

  // Fallback to the last known or the default
  return cachedBaseUrl || FREEDIUM_BASE_URLS[FREEDIUM_BASE_URLS.length - 1];
};

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
const openInFreedium = async (url, newTab) => {
  if (!url) {
    return;
  }

  const base = await getFreediumBaseUrl();
  const target = base + url;

  if (newTab) {
    chrome.tabs.create({ url: target });
  } else {
    chrome.tabs.update({ url: target });
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

chrome.contextMenus.onClicked.addListener(async (item) => {
  switch (item.menuItemId) {
    case 'freedium-link':
      await openInFreedium(item.linkUrl, true);
      break;
    case 'freedium-page':
      await openInFreedium(item.pageUrl, false);
      break;
  }
});
