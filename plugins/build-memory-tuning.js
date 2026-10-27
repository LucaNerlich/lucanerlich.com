// @ts-check

/**
 * Trim peak RSS during `docusaurus build` on memory-constrained Coolify hosts.
 * Module concatenation only saves ~3% JS and inflates bundler memory.
 *
 * @returns {import('@docusaurus/types').Plugin}
 */
function buildMemoryTuning() {
    return {
        name: 'build-memory-tuning',
        configureWebpack() {
            return {
                optimization: {
                    concatenateModules: false,
                },
            };
        },
    };
}

module.exports = buildMemoryTuning;
