import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves a file path relative to the projects root directory.
 * @param {string} filepath - Path to a file.
 * @returns Resolved file path.
 */
export const resolveFile = (filepath) =>
    resolve(dirname(fileURLToPath(import.meta.url)), '..', filepath);
