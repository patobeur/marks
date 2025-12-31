document.addEventListener('DOMContentLoaded', async () => {
    const listContainer = document.getElementById('duplicatesList');
    const totalEl = document.getElementById('totalDuplicates');
    const manager = new BookmarkManager();

    // Configure buttons
    document.getElementById('btnClose').addEventListener('click', () => window.close());
    document.getElementById('btnRefresh').addEventListener('click', () => loadReport());

    // Load Data
    loadReport();

    async function loadReport() {
        listContainer.innerHTML = '<div class="loading">Analyse en cours...</div>';

        try {
            await manager.loadBookmarks();
            // Default to 'url' mode or read from settings if we were persistent, 
            // but for a simple view let's defaults to URL scan as it is the most common.
            // Or ideally, read from Config if set.
            const duplicatesMap = manager.findDuplicates('url');

            renderList(duplicatesMap);
        } catch (e) {
            listContainer.textContent = "Erreur lors du chargement : " + e.message;
        }
    }

    function renderList(duplicatesMap) {
        listContainer.innerHTML = '';

        if (duplicatesMap.size === 0) {
            listContainer.innerHTML = '<div class="loading">Aucun doublon trouvé ! 🎉</div>';
            totalEl.textContent = '0';
            return;
        }

        let totalDupesCount = 0;

        duplicatesMap.forEach((nodes, key) => {
            totalDupesCount += nodes.length;

            const card = document.createElement('div');
            card.className = 'group-card';

            const header = document.createElement('div');
            header.className = 'group-header';
            header.innerHTML = `
                <div class="group-title" title="${key}">${key}</div>
                <div class="group-count">${nodes.length} copies</div>
            `;
            card.appendChild(header);

            const items = document.createElement('div');
            items.className = 'group-items';

            nodes.forEach(node => {
                const item = document.createElement('div');
                item.className = 'bookmark-item';

                // Try to format date
                const dateAdded = node.dateAdded ? new Date(node.dateAdded).toLocaleDateString() : '?';

                item.innerHTML = `
                    <div class="item-info">
                        <span class="item-path">ID: ${node.id} - Ajouté le ${dateAdded}</span>
                        <a href="${node.url}" target="_blank" class="item-link">${node.title || '(Sans titre)'}</a>
                    </div>
                `;
                items.appendChild(item);
            });

            card.appendChild(items);
            listContainer.appendChild(card);
        });

        totalEl.textContent = totalDupesCount;
    }
});
