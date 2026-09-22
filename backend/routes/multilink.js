const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");

// Helper: Find common columns between two sets of headers
const findCommonColumns = (headers1, headers2) => {
    // Case-insensitive comparison
    return headers1.filter(h1 =>
        headers2.some(h2 => h2.toLowerCase() === h1.toLowerCase())
    );
};

// Helper: Merge two datasets based on a key
const mergeDatasets = (data1, data2, key) => {
    const merged = [];
    const map2 = new Map();

    // Index second dataset by key for O(1) lookup
    // Handle potential multiplicity in data2? For now assuming 1:1 or N:1
    data2.forEach(row => {
        const val = String(row[key]).trim().toLowerCase(); // Normalize key: string, trim, lower
        map2.set(val, row);
    });

    data1.forEach(row1 => {
        const val = String(row1[key]).trim().toLowerCase();
        if (map2.has(val)) {
            const row2 = map2.get(val);
            // Merge rows. handle duplicate keys by prefixing if needed?
            // For simplicity, spread row1 then row2, row2 overwrites on collision except key
            merged.push({ ...row1, ...row2 });
        }
    });

    return merged;
};

// POST /api/multilink/analyze
router.post("/analyze", authMiddleware, (req, res) => {
    try {
        const { datasets } = req.body; // Expects [{ name: 'A', data: [] }, { name: 'B', data: [] }]

        if (!datasets || !Array.isArray(datasets) || datasets.length < 2) {
            return res.status(400).json({ error: "At least two datasets are required for linking." });
        }

        // 1. Analyze detected relationships (greedy approach: link 1st to 2nd, then result to 3rd...)
        // For V1, we just link the first two for simplicity, or try to chain them.

        let mergedData = datasets[0].data;
        let mergeLog = [];
        let commonKeysFound = [];

        for (let i = 1; i < datasets.length; i++) {
            const target = datasets[i];
            const currentHeaders = Object.keys(mergedData[0] || {});
            const targetHeaders = Object.keys(target.data[0] || {});

            const common = findCommonColumns(currentHeaders, targetHeaders);

            if (common.length > 0) {
                // Use the first common column as join key
                const joinKey = common[0];
                commonKeysFound.push(joinKey);

                const beforeCount = mergedData.length;
                mergedData = mergeDatasets(mergedData, target.data, joinKey);
                const afterCount = mergedData.length;

                mergeLog.push({
                    step: `Merged ${datasets[i - 1].name} with ${target.name}`,
                    key: joinKey,
                    matches: afterCount,
                    dropped: beforeCount - afterCount // Approximation if data1 was larger
                });
            } else {
                mergeLog.push({
                    step: `Failed to link ${target.name}`,
                    error: "No common column found"
                });
            }
        }

        if (commonKeysFound.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No common columns detected between files.",
                mergeLog
            });
        }

        res.json({
            success: true,
            mergedData: mergedData.slice(0, 100), // Return preview (limit 100)
            totalRows: mergedData.length,
            commonKeys: commonKeysFound,
            mergeLog
        });

    } catch (err) {
        console.error("Multi-Link Error:", err);
        res.status(500).json({ error: "Linking analysis failed" });
    }
});

module.exports = router;
