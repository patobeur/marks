document.addEventListener('DOMContentLoaded', async () => {
    const rootEl = document.getElementById('gallery-root');

    // Icons
    const ICONS = {
        folderOpen: '📂',
        folderClosed: '📁',
        bookmark: '🔗'
    };

    try {
        const tree = await chrome.bookmarks.getTree();
        renderGallery(tree, rootEl);
    } catch (e) {
        rootEl.innerHTML = `<div style="color:red">Erreur: ${e.message}</div>`;
    }

    function renderGallery(nodes, container) {
        container.innerHTML = '';
        nodes.forEach(node => {
            container.appendChild(createSection(node));
        });
    }

    function createSection(node) {
        // If it's a bookmark (leaf), it shouldn't be processed here usually, 
        // unless it's at the root level.
        // But our structure is recursive. We want to group current level bookmarks.

        // Actually, let's treat 'node' as the container folder.
        // But chrome.bookmarks.getTree returns an array of root nodes.

        // Let's create a recursive function that takes a Node and returns a DOM element (Section or Card).
        // Since we want to Separate Folders and Files visually:
        // Folder -> <div class="folder-section"> <header> ... </header> <grid>...files...</grid> <nested>...folders...</nested> </div>

        // If node is a bookmark, return a card.
        if (node.url) {
            return createCard(node);
        }

        // Use a container for the folder
        const section = document.createElement('div');
        section.className = 'folder-section';

        // Header (only if not root 0 which is virtual usually, but let's show all)
        const header = document.createElement('div');
        header.className = 'folder-header';
        header.innerHTML = `
            <span class="folder-icon">${ICONS.folderOpen}</span>
            <span class="folder-title">${node.title || 'Dossier'}</span>
        `;

        // Toggle logic
        header.addEventListener('click', () => {
            const content = section.querySelector('.folder-content');
            const icon = header.querySelector('.folder-icon');
            content.classList.toggle('hidden');
            if (content.classList.contains('hidden')) {
                icon.textContent = ICONS.folderClosed;
            } else {
                icon.textContent = ICONS.folderOpen;
            }
        });

        section.appendChild(header);

        // Content Wrapper
        const contentVal = document.createElement('div');
        contentVal.className = 'folder-content';

        // Separate Children into Files and Folders
        const files = node.children ? node.children.filter(c => c.url) : [];
        const folders = node.children ? node.children.filter(c => !c.url) : [];

        // 1. Grid for Files
        if (files.length > 0) {
            const grid = document.createElement('div');
            grid.className = 'bookmarks-grid';
            files.forEach(file => {
                grid.appendChild(createCard(file));
            });
            contentVal.appendChild(grid);
        }

        // 2. Nested Folders
        if (folders.length > 0) {
            const nestedContainer = document.createElement('div');
            nestedContainer.className = 'nested-folders';
            folders.forEach(folder => {
                nestedContainer.appendChild(createSection(folder));
            });
            contentVal.appendChild(nestedContainer);
        }

        // If empty
        if (files.length === 0 && folders.length === 0) {
            const empty = document.createElement('div');
            empty.style.color = '#64748b';
            empty.style.fontStyle = 'italic';
            empty.style.padding = '10px';
            empty.textContent = '(Vide)';
            contentVal.appendChild(empty);
        }

        section.appendChild(contentVal);
        return section;
    }

    function createCard(node) {
        const card = document.createElement('a');
        card.className = 'bookmark-card';
        card.href = node.url;
        card.target = '_blank';

        // Attempt to guess icon or use default
        // In a real app we might use the chrome favicon API: `_favicon/?pageUrl=${encodeURIComponent(node.url)}&size=32`
        // But permissions are needed. Let's use simple emoji or generic.

        // Let's see if we have favicon permission. Manifest says yes ("favicon").
        // "chrome://favicon/size/16@1x/" + node.url
        // The standard way is using the chrome://favicon/ URL

        const faviconUrl = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(node.url)}&size=32`;
        // Since we don't have the _favicon permission explicitly declared as that string in manifest (we have "favicon"),
        // "favicon" permission allows using the "chrome://favicon/" url, but "chrome-extension://.../_favicon/" is for the favicon API.
        // Actually, `chrome://favicon/` is deprecated/removed in MV3 for general use? 
        // MV3 recommends the `chrome.request.favicon` or using the `_favicon` helper in specific cases.
        // Let's stick to a generic icon to be safe and avoid broken images, OR try to use a simple image tag if possible.
        // User asked for "Cards", usually implies an image.

        card.innerHTML = `
            <div class="card-icon">🔗</div>
            <div class="card-title">${node.title || 'Sans titre'}</div>
            <div class="card-url">${node.url}</div>
        `;

        return card;
    }

    // Search (Simple Client Side)
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.bookmark-card');

        cards.forEach(card => {
            const text = (card.textContent + card.href).toLowerCase();
            if (text.includes(term)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        // Also hide empty folders? (Optional, might be complex for pure JS without state)
    });
});
