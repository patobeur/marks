document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const languageSelect = document.getElementById('languageSelect');
    const scanModeRadios = document.getElementsByName('scanMode');
    const btnSave = document.getElementById('btnSave');
    const saveStatus = document.getElementById('saveStatus');

    // Load Settings
    chrome.storage.sync.get(Config.STORAGE_KEYS.SETTINGS, (result) => {
        const settings = result[Config.STORAGE_KEYS.SETTINGS] || Config.DEFAULT_SETTINGS;

        // Apply to UI
        languageSelect.value = settings.language || 'fr';

        for (const radio of scanModeRadios) {
            if (radio.value === (settings.scanMode || 'url')) {
                radio.checked = true;
            }
        }
    });

    // Save Settings
    btnSave.addEventListener('click', () => {
        const selectedScanMode = Array.from(scanModeRadios).find(r => r.checked).value;

        const newSettings = {
            language: languageSelect.value,
            scanMode: selectedScanMode,
            theme: 'system', // TODO: Add theme selector
            confirmDeletions: true
        };

        chrome.storage.sync.set({ [Config.STORAGE_KEYS.SETTINGS]: newSettings }, () => {
            // Feedback
            saveStatus.textContent = 'Options sauvegardées !';
            saveStatus.classList.add('visible');
            setTimeout(() => {
                saveStatus.classList.remove('visible');
            }, 2000);

            // Force reload if necessary or just let user know
        });
    });

    // i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const msg = chrome.i18n.getMessage(el.dataset.i18n);
        if (msg) el.textContent = msg;
    });
});
