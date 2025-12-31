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
    const urlMetaMap = new Map(); // url -> { id: number, count: number }

    // Load expanded state
    const EXPANDED_KEY = 'marks_explorer_expanded';
    let expandedNodes = new Set();
    try {
        const stored = localStorage.getItem(EXPANDED_KEY);
        if (stored) expandedNodes = new Set(JSON.parse(stored));
    } catch (e) { console.error('Error loading state', e); }

    function saveExpandedState() {
        localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expandedNodes]));
    }

    try {
        await manager.loadBookmarks();
        // Identify duplicates
        const dupesMap = manager.findDuplicates('url');

        // Build metadata map
        let groupId = 1;
        for (const [url, nodes] of dupesMap.entries()) {
            urlMetaMap.set(url, {
                id: groupId++,
                count: nodes.length
            });
        }

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
            const meta = urlMetaMap.get(node.url);
            if (meta) {
                link.classList.add('is-duplicate');

                // create duplicate icon
                const dupIcon = document.createElement('span');
                dupIcon.className = 'duplicate-icon';
                dupIcon.title = 'Doublon détecté';
                dupIcon.textContent = '⚠️';

                // Insert icon before text
                link.textContent = '';
                link.appendChild(dupIcon);

                // Add title
                const text = node.title || node.url;
                link.appendChild(document.createTextNode(text));

                // Add duplicate info tag
                const dupInfo = document.createElement('span');
                dupInfo.className = 'duplicate-info';
                dupInfo.textContent = ` #${meta.id} (${meta.count})`;
                link.appendChild(dupInfo);

                // Add Delete Button (Trash Icon)
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.innerHTML = '🗑️';
                delBtn.title = 'Supprimer le favori';
                delBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDeleteModal(node, wrapper);
                });
                link.appendChild(delBtn);
            }

            content.appendChild(link);
        }

        wrapper.appendChild(content);

        // Check if previously expanded
        const isExpanded = isFolder && expandedNodes.has(node.id);

        // Children Container (if folder)
        if (isFolder && node.children) {
            const childrenContainer = document.createElement('div');
            // Use isExpanded to determine initial class
            childrenContainer.className = `node-children ${isExpanded ? '' : 'hidden'}`;

            // Set initial icon based on storage
            if (isExpanded) {
                iconSpan.textContent = ICONS.folderOpen;
            }

            // Interaction to toggle
            content.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = childrenContainer.classList.contains('hidden');

                if (isHidden) {
                    childrenContainer.classList.remove('hidden');
                    iconSpan.textContent = ICONS.folderOpen;
                    expandedNodes.add(node.id); // Add to set
                } else {
                    childrenContainer.classList.add('hidden');
                    iconSpan.textContent = ICONS.folderClosed;
                    expandedNodes.delete(node.id); // Remove from set
                }
                saveExpandedState(); // Persist
            });

            // Special case: Root folders (id 0) always open/ensured
            if (node.id === '0') {
                childrenContainer.classList.remove('hidden');
                expandedNodes.add('0');
            }

            // Render children recursively
            node.children.forEach(child => {
                childrenContainer.appendChild(createNodeElement(child));
            });

            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    }

    // Modal Logic
    const modal = document.getElementById('deleteModal');
    const modalTitle = document.getElementById('modalBookmarkTitle');
    const btnCancel = document.getElementById('btnCancelDelete');
    const btnConfirm = document.getElementById('btnConfirmDelete');
    let nodeToDelete = null;
    let domElementToDelete = null;

    function openDeleteModal(node, domElement) {
        nodeToDelete = node;
        domElementToDelete = domElement;
        modalTitle.textContent = node.title || node.url;
        modal.classList.remove('hidden');
    }

    function closeDeleteModal() {
        modal.classList.add('hidden');
        nodeToDelete = null;
        domElementToDelete = null;
    }

    btnCancel.addEventListener('click', closeDeleteModal);

    btnConfirm.addEventListener('click', async () => {
        if (!nodeToDelete) return;
        if (btnConfirm.disabled) return; // Prevent double clicks

        const url = nodeToDelete.url; // Capture URL before clearing node
        const elementToRemove = domElementToDelete; // Capture DOM element before clearing

        // Lock button
        btnConfirm.disabled = true;
        btnConfirm.style.opacity = '0.7';
        btnConfirm.textContent = '...';

        try {
            await chrome.bookmarks.remove(nodeToDelete.id);
            closeDeleteModal(); // This wipes global references

            // Remove from DOM
            if (elementToRemove) {
                elementToRemove.remove();
            }

            // Update Counts for other duplicates of this URL
            const meta = urlMetaMap.get(url);
            if (meta && meta.count > 0) {
                meta.count--;
                // Find all other links for this URL to update their count display
                // We search for links with 'is-duplicate' and matching href
                const links = document.querySelectorAll(`.is-bookmark.is-duplicate[href="${url}"]`);
                links.forEach(link => {
                    const infoSpan = link.querySelector('.duplicate-info');
                    if (infoSpan) {
                        // Keep the same Group ID, just decrement count
                        infoSpan.textContent = ` #${meta.id} (${meta.count})`;
                    }
                });
            }

        } catch (e) {
            alert('Erreur lors de la suppression: ' + e.message);
        } finally {
            // Unlock button (reset for next time)
            btnConfirm.disabled = false;
            btnConfirm.style.opacity = '1';
            btnConfirm.textContent = 'Supprimer';
        }
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });

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
