/**
 * CargoFitter3D - 3D Bin Packing Algorithm
 * Implements Bottom-Left-Back fill strategy for optimal cargo fitting
 */
class CargoFitter3D {
    constructor(options = {}) {
        this.items = [];
        this.fittedItems = [];
        this.viewMode = options.viewMode || 'top';
        this.canvasTop = options.canvasTop || null;
        this.canvasSide = options.canvasSide || null;
        this.onUpdate = options.onUpdate || (() => {});
        this.colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#ffeaa7', '#dda0dd', '#98fb98', '#f4a261'
        ];
    }

    /**
     * Add a 3D item to the cargo list
     */
    addItem(length, width, height, name, metadata = {}) {
        const item = {
            id: Date.now() + Math.random(),
            length: parseFloat(length),
            width: parseFloat(width),
            height: parseFloat(height),
            name: name || `Item ${this.items.length + 1}`,
            fitted: false,
            x: 0, // Length position
            y: 0, // Width position
            z: 0, // Height position
            ...metadata
        };

        if (this.validateItem(item)) {
            this.items.push(item);
            this.onUpdate('itemAdded', item);
            return item.id;
        }
        return null;
    }

    /**
     * Remove item by ID
     */
    removeItem(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            const removed = this.items.splice(index, 1)[0];
            this.fittedItems = this.fittedItems.filter(item => item.id !== id);
            this.onUpdate('itemRemoved', removed);
            return true;
        }
        return false;
    }

    /**
     * Clear all items
     */
    clearItems() {
        this.items = [];
        this.fittedItems = [];
        this.onUpdate('itemsCleared');
    }

    /**
     * Validate item dimensions
     */
    validateItem(item) {
        return item.length > 0 && item.width > 0 && item.height > 0;
    }

    /**
     * Main fitting algorithm - 3D Bottom-Left-Back Fill
     */
    fitItems(containerLength, containerWidth, containerHeight) {
        // Reset all items
        this.items.forEach(item => {
            item.fitted = false;
            item.x = 0;
            item.y = 0;
            item.z = 0;
        });
        
        this.fittedItems = [];
        
        // Sort items by volume (largest first) for better packing
        const sortedItems = [...this.items].sort((a, b) => 
            (b.length * b.width * b.height) - (a.length * a.width * a.height)
        );

        for (let item of sortedItems) {
            const position = this.findBestPosition3D(
                item, containerLength, containerWidth, containerHeight
            );
            
            if (position) {
                item.x = position.x;
                item.y = position.y;
                item.z = position.z;
                item.fitted = true;
                this.fittedItems.push(item);
            }
        }

        this.onUpdate('fittingComplete', {
            total: this.items.length,
            fitted: this.fittedItems.length,
            efficiency: this.calculateEfficiency(containerLength, containerWidth, containerHeight)
        });

        return this.getFittingResults();
    }

    /**
     * Find best 3D position using Bottom-Left-Back strategy
     */
    findBestPosition3D(item, containerLength, containerWidth, containerHeight) {
        // Try all possible positions starting from bottom-left-back
        for (let z = 0; z <= containerHeight - item.height; z++) {
            for (let y = 0; y <= containerWidth - item.width; y++) {
                for (let x = 0; x <= containerLength - item.length; x++) {
                    if (this.canPlaceItem3D(item, x, y, z, containerLength, containerWidth, containerHeight)) {
                        return { x, y, z };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Check if item can be placed at given 3D position
     */
    canPlaceItem3D(item, x, y, z, containerLength, containerWidth, containerHeight) {
        // Check container bounds
        if (x + item.length > containerLength || 
            y + item.width > containerWidth || 
            z + item.height > containerHeight) {
            return false;
        }

        // Check for overlaps with placed items
        for (let placedItem of this.fittedItems) {
            if (this.boxesOverlap3D(
                x, y, z, item.length, item.width, item.height,
                placedItem.x, placedItem.y, placedItem.z, 
                placedItem.length, placedItem.width, placedItem.height
            )) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if two 3D boxes overlap
     */
    boxesOverlap3D(x1, y1, z1, l1, w1, h1, x2, y2, z2, l2, w2, h2) {
        return !(x1 + l1 <= x2 || x2 + l2 <= x1 || 
                y1 + w1 <= y2 || y2 + w2 <= y1 || 
                z1 + h1 <= z2 || z2 + h2 <= z1);
    }

    /**
     * Calculate space efficiency
     */
    calculateEfficiency(containerLength, containerWidth, containerHeight) {
        const containerVolume = containerLength * containerWidth * containerHeight;
        const usedVolume = this.fittedItems.reduce((sum, item) => 
            sum + (item.length * item.width * item.height), 0
        );
        
        return containerVolume > 0 ? (usedVolume / containerVolume) * 100 : 0;
    }

    /**
     * Get fitting results summary
     */
    getFittingResults() {
        return {
            totalItems: this.items.length,
            fittedItems: this.fittedItems.length,
            unfittedItems: this.items.length - this.fittedItems.length,
            fittedList: this.fittedItems.map(item => ({
                id: item.id,
                name: item.name,
                dimensions: [item.length, item.width, item.height],
                position: [item.x, item.y, item.z]
            })),
            unfittedList: this.items.filter(item => !item.fitted).map(item => ({
                id: item.id,
                name: item.name,
                dimensions: [item.length, item.width, item.height]
            }))
        };
    }

    /**
     * Export fitting data as JSON
     */
    exportData() {
        return {
            items: this.items,
            fittedItems: this.fittedItems,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import fitting data from JSON
     */
    importData(data) {
        if (data.items && Array.isArray(data.items)) {
            this.items = data.items;
            this.fittedItems = data.fittedItems || [];
            this.onUpdate('dataImported', data);
            return true;
        }
        return false;
    }

    /**
     * Get item by ID
     */
    getItem(id) {
        return this.items.find(item => item.id === id);
    }

    /**
     * Update item properties
     */
    updateItem(id, updates) {
        const item = this.getItem(id);
        if (item) {
            Object.assign(item, updates);
            this.onUpdate('itemUpdated', item);
            return true;
        }
        return false;
    }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CargoFitter3D;
} else if (typeof window !== 'undefined') {
    window.CargoFitter3D = CargoFitter3D;
}