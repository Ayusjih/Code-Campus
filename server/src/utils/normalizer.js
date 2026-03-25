// Data consistency utility functions

/**
 * Normalizes branch input strings to a standard database format.
 * Maps 'CS', 'C.S.', 'Computer Science' -> 'CSE'
 * @param {string} branch - The branch input string
 * @returns {string} - The standardized branch name
 */
const normalizeBranch = (branch) => {
    if (!branch) return '';
    const normalized = branch.trim().toUpperCase().replace(/[\.\s]/g, ''); // Removes spaces and dots, e.g. "C.S." -> "CS"

    if (normalized.includes('COMPUTER') || normalized === 'CS' || normalized === 'CSE') {
        return 'CSE';
    }
    if (normalized.includes('INFO') || normalized === 'IT') {
        return 'IT';
    }
    if (normalized.includes('MECH') || normalized === 'ME') {
        return 'ME';
    }
    if (normalized.includes('CIVIL')) {
        return 'CIVIL';
    }
    if (normalized.includes('AIML') || normalized.includes('AI') || normalized.includes('MACHINEL')) {
        return 'AIML';
    }
    if (normalized.includes('IOT')) {
        return 'IOT';
    }

    // Default fallback
    return branch.trim().toUpperCase();
};

/**
 * Sanitizes generic string inputs by trimming trailing/leading spaces.
 */
const sanitizeInput = (text) => {
    if (typeof text !== 'string') return text;
    return text.trim();
};

module.exports = { normalizeBranch, sanitizeInput };
