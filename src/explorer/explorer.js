document.addEventListener('DOMContentLoaded', async () => {
    const rootEl = document.getElementById('tree-root');
    const searchInput = document.getElementById('searchInput'); // For future implementation

    // Icon constants
    const ICONS = {
        folderOpen: '📂',
        folderClosed: '📁',
        bookmark: '🔗'
    };

    // Initialize Manager
    const manager = new BookmarkManager();
    let duplicatesSet = new Set();

    try {
        await manager.loadBookmarks();
        // Identify duplicates just to get the list of URLs
        const dupesMap = manager.findDuplicates('url');
        // Flatten to set of URLs for O(1) lookup
        duplicatesSet = new Set(dupesMap.keys());

        const tree = await chrome.bookmarks.getTree();
        renderTree(tree, rootEl);
    } catch (e) {
        rootEl.innerHTML = `<div style="color:red; padding:20px;">Erreur de chargement: ${e.message}</div>`;
    }

    function renderTree(nodes, container) {
        container.innerHTML = '';
        nodes.forEach(node => {
            container.appendChild(createNodeElement(node));
        });
    }

    function createNodeElement(node) {
        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'tree-node';

        // Content Row
        const content = document.createElement('div');
        content.className = 'node-content';

        const isFolder = !node.url;

        // Icon
        const iconSpan = document.createElement('span');
        iconSpan.className = 'node-icon';
        iconSpan.textContent = isFolder ? ICONS.folderClosed : ICONS.bookmark;
        content.appendChild(iconSpan);

        // Label handling
        if (isFolder) {
            content.classList.add('is-folder');
            const label = document.createElement('span');
            label.className = 'node-label';
            label.textContent = node.title || (node.id === '0' ? 'Racine' : 'Dossier sans titre');
            content.appendChild(label);
        } else {
            // It's a link
            const link = document.createElement('a');
            link.className = 'node-label is-bookmark';
            link.href = node.url;
            link.target = '_blank';
            link.textContent = node.title || node.url;

            // Check for duplicate
            if (duplicatesSet.has(node.url)) {
                link.classList.add('is-duplicate');

                // create duplicate icon
                const dupIcon = document.createElement('span');
                dupIcon.className = 'duplicate-icon';
                dupIcon.title = 'Doublon détecté';
                dupIcon.textContent = '⚠️';

                // Insert icon before text (we need to clear textContent specific logic)
                link.textContent = '';
                link.appendChild(dupIcon);
                link.appendChild(document.createTextNode(node.title || node.url));
            }

            content.appendChild(link);
        }

        wrapper.appendChild(content);

        // Children Container (if folder)
        if (isFolder && node.children) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'node-children hidden'; // Start collapsed

            // Interaction to toggle
            content.addEventListener('click', (e) => {
                // Don't toggle if clicking a link (though here it's a folder click)
                e.stopPropagation();
                const isHidden = childrenContainer.classList.contains('hidden');

                if (isHidden) {
                    childrenContainer.classList.remove('hidden');
                    iconSpan.textContent = ICONS.folderOpen;
                } else {
                    childrenContainer.classList.add('hidden');
                    iconSpan.textContent = ICONS.folderClosed;
                }
            });

            // Special case: Root folders (id 0) should be open by default
            if (node.id === '0') {
                childrenContainer.classList.remove('hidden');
            }

            // Render children recursively
            node.children.forEach(child => {
                childrenContainer.appendChild(createNodeElement(child));
            });

            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    }

    // Simple Search Filter
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const nodes = document.querySelectorAll('.tree-node');

        nodes.forEach(node => {
            // Very simple visibility toggle based on text content
            // Note: This is a basic implementation. Ideally we'd filter the data model.
            const text = node.textContent.toLowerCase();
            // Complex logic omitted for MVP
        });
    });
});
