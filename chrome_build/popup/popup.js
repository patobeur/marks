document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Managers
    const manager = new BookmarkManager();

    // Elements
    const btnScan = document.getElementById('btnScan');
    const btnGroup = document.getElementById('btnGroup');
    const btnDelete = document.getElementById('btnDelete');
    const btnViewDetails = document.getElementById('btnViewDetails');
    const statusMessage = document.getElementById('statusMessage');
    const duplicateCount = document.getElementById('duplicateCount');
    const appName = document.getElementById('appName');

    // i18n
    function translate(key) {
        return chrome.i18n.getMessage(key) || key;
    }

    function applyTranslations() {
        appName.textContent = translate('appName');
        const translatables = document.querySelectorAll('[data-i18n]');
        translatables.forEach(el => {
            el.textContent = translate(el.dataset.i18n);
        });
    }

    applyTranslations();

    // Logic
    async function performScan() {
        statusMessage.textContent = 'Scanning...';
        btnScan.disabled = true;

        await manager.loadBookmarks();
        const duplicates = manager.findDuplicates(Config.DEFAULT_SETTINGS.scanMode);

        const count = duplicates.size;
        duplicateCount.textContent = count;
        statusMessage.textContent = count > 0 ? 'Doublons trouvés' : 'Aucun doublon';

        btnScan.disabled = false;
        btnGroup.disabled = count === 0;
        btnDelete.disabled = count === 0;

        if (btnViewDetails) {
            btnViewDetails.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    async function performGroup() {
        statusMessage.textContent = 'Regroupement...';
        await manager.groupDuplicates();
        await performScan(); // Rescan to confirm
        statusMessage.textContent = 'Regroupé!';
    }

    async function performDelete() {
        if (confirm('Voulez-vous vraiment supprimer tous les doublons ? Cette action est irréversible.')) {
            statusMessage.textContent = 'Suppression...';
            const deleted = await manager.deleteDuplicates();
            statusMessage.textContent = `Supprimé ${deleted} doublons`;
            await performScan();
        }
    }

    // Event Listeners
    btnScan.addEventListener('click', performScan);
    btnGroup.addEventListener('click', performGroup);
    btnDelete.addEventListener('click', performDelete);

    if (btnViewDetails) {
        btnViewDetails.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('report/report.html') });
        });
    }

    document.getElementById('linkHomepage').addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('newtab/newtab.html') });
    });

    document.getElementById('linkOptions').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});
