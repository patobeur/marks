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

            // Header with Title, Count, and Group Delete Button
            const header = document.createElement('div');
            header.className = 'group-header';
            header.innerHTML = `
                <div class="group-info">
                    <div class="group-title" title="${key}">${key}</div>
                    <div class="group-count">${nodes.length} copies</div>
                </div>
                <button class="btn-delete-group" title="Supprimer la sélection" disabled>🗑️</button>
            `;
            card.appendChild(header);

            const items = document.createElement('div');
            items.className = 'group-items';

            // Helper for Toasts
            function showToast(message, type = 'info') {
                const container = document.getElementById('toast-container');
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;

                let icon = 'ℹ️';
                if (type === 'success') icon = '✅';
                if (type === 'error') icon = '❌';

                toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
                container.appendChild(toast);

                setTimeout(() => {
                    toast.style.animation = 'fadeOut 0.3s ease-in forwards';
                    setTimeout(() => toast.remove(), 300);
                }, 2000); // 2 seconds dissipation as requested
            }

            // Delete Group Button Logic
            const btnDeleteGroup = header.querySelector('.btn-delete-group');
            btnDeleteGroup.addEventListener('click', async () => {
                const checkboxes = items.querySelectorAll('.item-checkbox:checked');
                if (checkboxes.length === 0) return;

                // Action direct sans confirmation bloquante
                let deletedCount = 0;
                let errors = 0;

                for (const checkbox of checkboxes) {
                    try {
                        await chrome.bookmarks.remove(checkbox.value);
                        // Find the item row and remove it
                        const itemRow = checkbox.closest('.bookmark-item');
                        itemRow.remove();
                        deletedCount++;
                    } catch (e) {
                        console.error('Failed to delete', checkbox.value, e);
                        errors++;
                    }
                }

                // Update Counts
                const currentTotal = parseInt(totalEl.textContent) || 0;
                totalEl.textContent = Math.max(0, currentTotal - deletedCount);

                const remaining = items.querySelectorAll('.bookmark-item').length;
                header.querySelector('.group-count').textContent = `${remaining} copies`;

                if (remaining === 0) {
                    card.remove();
                }

                btnDeleteGroup.disabled = true;
                btnDeleteGroup.style.opacity = '0.5';

                // Toast Feedback
                if (errors > 0) {
                    showToast(`${deletedCount} supprimés, ${errors} échecs`, 'error');
                } else {
                    showToast(`${deletedCount} favoris supprimés`, 'success');
                }
            });

            // Render Items
            nodes.forEach(node => {
                const item = document.createElement('div');
                item.className = 'bookmark-item';

                // Try to format date
                const dateAdded = node.dateAdded ? new Date(node.dateAdded).toLocaleDateString() : '?';

                item.innerHTML = `
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="item-checkbox" value="${node.id}">
                    </div>
                    <div class="item-info">
                        <span class="item-path">ID: ${node.id} - Ajouté le ${dateAdded}</span>
                        <a href="${node.url}" target="_blank" class="item-link">${node.title || '(Sans titre)'}</a>
                    </div>
                `;

                // Enable/Disable group delete button based on selection
                const checkbox = item.querySelector('.item-checkbox');
                checkbox.addEventListener('change', () => {
                    const anyChecked = items.querySelectorAll('.item-checkbox:checked').length > 0;
                    btnDeleteGroup.disabled = !anyChecked;
                    btnDeleteGroup.style.opacity = anyChecked ? '1' : '0.5';
                });

                items.appendChild(item);
            });

            card.appendChild(items);
            listContainer.appendChild(card);
        });

        totalEl.textContent = totalDupesCount;
    }
});
