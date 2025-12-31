/**
 * BookmarkManager.js
 * Core logic for fetching, organizing, and cleaning bookmarks.
 */

class BookmarkManager {
    constructor() {
        this.bookmarks = []; // Flat list of all bookmarks
        this.duplicates = []; // List of found duplicates
    }

    /**
     * Fetches the entire bookmark tree and flattens it.
     * @returns {Promise<Array>} The flat list of bookmarks.
     */
    async loadBookmarks() {
        try {
            const tree = await chrome.bookmarks.getTree();
            this.bookmarks = this._flattenTree(tree);
            console.log(`Loaded ${this.bookmarks.length} bookmarks.`);
            return this.bookmarks;
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            throw error;
        }
    }

    /**
     * Recursive helper to flatten the tree.
     * @param {Array} nodes - The bookmark nodes to traverse.
     * @returns {Array} - Flat array of bookmark nodes (excluding folders, or keeping them if needed).
     */
    _flattenTree(nodes) {
        let result = [];
        for (const node of nodes) {
            // If it's a folder, recurse
            if (node.children) {
                result = result.concat(this._flattenTree(node.children));
            } else {
                // It's a bookmark
                // We ensure it has a url to be considered a bookmark
                if (node.url) {
                    result.push(node);
                }
            }
        }
        return result;
    }

    /**
     * Scans for duplicates based on the current criteria.
     * @param {string} mode - 'url' or 'title' (default: 'url')
     * @returns {Object} - Map of { hash: [nodes...] }
     */
    findDuplicates(mode = 'url') {
        const map = new Map();
        const duplicatesMap = new Map();

        for (const bookmark of this.bookmarks) {
            // Determine the key based on mode
            let key = bookmark.url;
            if (mode === 'strict') {
                key = `${bookmark.url}|${bookmark.title}`;
            }

            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key).push(bookmark);
        }

        // Filter only those with > 1 entry
        for (const [key, nodes] of map.entries()) {
            if (nodes.length > 1) {
                duplicatesMap.set(key, nodes);
            }
        }

        this.duplicates = duplicatesMap;
        return duplicatesMap;
    }

    /**
     * Groups duplicates by moving them to the folder of the first occurrence.
     * @returns {Promise<void>}
     */
    async groupDuplicates() {
        if (!this.duplicates || this.duplicates.size === 0) return;

        for (const [key, nodes] of this.duplicates.entries()) {
            // Target is the first one found (oldest or first in tree)
            const target = nodes[0];
            const targetParentId = target.parentId;

            // Move others to be after the target
            // We start from index 1 because index 0 is the target
            for (let i = 1; i < nodes.length; i++) {
                const node = nodes[i];

                // If already in same folder, we might want to just reorder?
                // For now, let's just move them to the target parent
                if (node.parentId !== targetParentId) {
                    try {
                        await chrome.bookmarks.move(node.id, {
                            parentId: targetParentId,
                            // We don't specify index to just append, 
                            // or we could try to put it right after target. 
                            // chrome.bookmarks.move index is 0-based.
                        });
                    } catch (e) {
                        console.error(`Failed to move ${node.id}:`, e);
                    }
                }
            }
        }
        // Reload after changes
        await this.loadBookmarks();
    }

    /**
     * Deletes all duplicates, keeping the first one found.
     * @returns {Promise<number>} - Count of deleted items.
     */
    async deleteDuplicates() {
        if (!this.duplicates || this.duplicates.size === 0) return 0;

        let deleteCount = 0;

        for (const [key, nodes] of this.duplicates.entries()) {
            // Keep nodes[0], delete the rest
            for (let i = 1; i < nodes.length; i++) {
                try {
                    await chrome.bookmarks.remove(nodes[i].id);
                    deleteCount++;
                } catch (e) {
                    console.error(`Failed to delete ${nodes[i].id}:`, e);
                }
            }
        }

        // Clear duplicates after deletion
        this.duplicates = new Map();
        // Reload
        await this.loadBookmarks();

        return deleteCount;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookmarkManager;
} else {
    window.BookmarkManager = BookmarkManager;
}
