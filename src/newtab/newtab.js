document.addEventListener('DOMContentLoaded', () => {
    const greetingId = document.getElementById('greetingId');
    const dateDisplay = document.getElementById('dateDisplay');
    const topSitesList = document.getElementById('topSitesList');
    const recentList = document.getElementById('recentList');
    const searchInput = document.getElementById('searchInput');

    // Date & Time
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString(undefined, options);

    const hour = now.getHours();
    let greet = 'Bonjour';
    if (hour >= 18) greet = 'Bonsoir';
    greetingId.textContent = greet;

    // Search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    });

    // Default Home Button Logic
    const btnDefaultHome = document.getElementById('btnDefaultHome');
    if (btnDefaultHome) {
        btnDefaultHome.addEventListener('click', () => {
            // Detect if Firefox by checking for browser object availability specific quirk
            // or simply try/catch. 
            // In Firefox, 'browser' is defined. In Chrome it is too, but checks differ.
            // We can check userAgent.
            const isFirefox = navigator.userAgent.includes("Firefox");

            if (isFirefox) {
                // Open about:home (Standard Firefox Start Page)
                chrome.tabs.update({ url: 'about:home' });
            } else {
                // For Chrome, chrome://new-tab-page is the internal one for Google NTP
                // chrome://newtab would loop back to us.
                chrome.tabs.update({ url: 'chrome://new-tab-page' });
            }
        });
    }

    // Load Top Sites
    chrome.topSites.get((sites) => {
        topSitesList.innerHTML = '';
        sites.slice(0, Config.HOMEPAGE.MAX_TOP_SITES).forEach(site => {
            const card = document.createElement('a');
            card.className = 'site-card';
            card.href = site.url;

            // Try to get favicon
            const img = document.createElement('img');
            img.className = 'site-icon';
            // Use Google's service for favicons as fallback, or chrome://favicon if permitted
            img.src = `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`;

            const title = document.createElement('span');
            title.className = 'site-title';
            title.textContent = site.title || site.url;

            card.appendChild(img);
            card.appendChild(title);
            topSitesList.appendChild(card);
        });
    });

    // Load Recent Bookmarks
    chrome.bookmarks.getRecent(Config.HOMEPAGE.MAX_RECENT_ITEMS, (items) => {
        recentList.innerHTML = '';
        items.forEach(item => {
            if (!item.url) return; // Skip folders

            const link = document.createElement('a');
            link.className = 'list-item';
            link.href = item.url;

            const icon = document.createElement('img');
            icon.src = `https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}&sz=32`;
            icon.style.width = '20px';
            icon.style.height = '20px';
            icon.style.borderRadius = '4px';

            const title = document.createElement('span');
            title.textContent = item.title || item.url;

            const urlDisplay = document.createElement('span');
            urlDisplay.className = 'url';
            urlDisplay.textContent = new URL(item.url).hostname;

            link.appendChild(icon);
            link.appendChild(title);
            link.appendChild(urlDisplay);
            recentList.appendChild(link);
        });
    });

    // i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const msg = chrome.i18n.getMessage(el.dataset.i18n);
        if (msg) el.textContent = msg;
    });
});
