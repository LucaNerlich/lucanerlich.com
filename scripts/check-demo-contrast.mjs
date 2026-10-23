#!/usr/bin/env node
// Guards the demo colour contract in two ways:
//
// 1. WCAG AA contrast for every accent fill used by the demo modules
//    (FlexboxDemo, GridDemo, TransitionDemo). The foregrounds below are the
//    ones those modules set; update a pair when a module changes a colour.
// 2. No label in a demo or an app page may paint itself in an accent token.
//    Those tokens are tuned as fills; used as text on a same-hue tint they
//    measured 2.28-3.59:1 (issue #618), so the rule is banned rather than
//    modelled per selector. Text colours come from the --custom-text-* pair.
//
// Run it (also part of `pnpm test`):
//
//     node scripts/check-demo-contrast.mjs
//
// The accent values are read from src/css/custom.css, so a token change is
// picked up here without editing this file.
import {readFileSync, readdirSync} from 'node:fs';

const AA_NORMAL_TEXT = 4.5;

const css = readFileSync(new URL('../src/css/custom.css', import.meta.url), 'utf8');
const darkStart = css.indexOf("html[data-theme='dark']");
const parseTokens = (block) =>
    Object.fromEntries(
        [...block.matchAll(/--custom-(accent|text)-([a-z]+):\s*(#[0-9a-f]{6})/gi)]
            .map(([, group, name, value]) => [`${group}-${name}`.toLowerCase(), value.toLowerCase()]),
    );
const themes = {
    light: parseTokens(css.slice(0, darkStart)),
    dark: parseTokens(css.slice(darkStart)),
};

// [theme, token, foreground, where the pair is rendered]. `accent-*` are fill
// tokens; `text-*` are the text-safe pair used by the splitter.
const pairs = [
    ['light', 'accent-purple', '#ffffff', 'Flexbox item 1, Grid default, Transition card'],
    ['light', 'accent-green', '#000000', 'Flexbox item 2, Grid 2n, Transition active card'],
    ['light', 'accent-amber', '#111111', 'Flexbox item 3, Grid 3n'],
    ['light', 'accent-red', '#ffffff', 'Flexbox item 4'],
    ['dark', 'accent-purple', '#111111', 'Flexbox item 1, Grid default, Transition card'],
    ['dark', 'accent-green', '#111111', 'Flexbox item 2, Grid 2n, Transition active card'],
    ['dark', 'accent-amber', '#111111', 'Flexbox item 3, Grid 3n'],
    ['dark', 'accent-red', '#111111', 'Flexbox item 4'],
    // Worst case in the splitter: an odd balance row / a chip hover, which use
    // the emphasis tints rather than the card surface.
    ['light', 'text-positive', '#ebedf0', 'splitter balances and errors'],
    ['light', 'text-negative', '#ebedf0', 'splitter balances and errors'],
    ['dark', 'text-positive', '#3a3d40', 'splitter balances and errors'],
    ['dark', 'text-negative', '#3a3d40', 'splitter balances and errors'],
];

const channel = (value) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

let failed = 0;
for (const [theme, token, foreground, where] of pairs) {
    const background = themes[theme]?.[token];
    if (!background) {
        console.error(`missing --custom-${token} for ${theme}`);
        failed += 1;
        continue;
    }
    const value = ratio(foreground, background);
    const ok = value >= AA_NORMAL_TEXT;
    if (!ok) failed += 1;
    console.log(
        `${ok ? 'ok  ' : 'FAIL'} ${value.toFixed(2)}:1  ${theme.padEnd(5)} ${foreground} on ${background}  (${where})`,
    );
}

if (failed > 0) {
    console.error(`${failed} colour pair(s) below ${AA_NORMAL_TEXT}:1`);
    process.exit(1);
}
console.log(`all ${pairs.length} colour pairs >= ${AA_NORMAL_TEXT}:1`);

// A demo label must inherit its colour. An accent token as `color` has no
// contrast guarantee against the tint it sits on, and modelling six
// `color-mix` backgrounds here would drift from the CSS it guards (#618).
const offenders = [];
for (const root of ['src/components', 'src/pages']) {
    for (const file of readdirSync(new URL(`../${root}`, import.meta.url), {recursive: true})) {
        if (!file.endsWith('.module.css')) continue;
        const text = readFileSync(new URL(`../${root}/${file}`, import.meta.url), 'utf8');
        text.split('\n').forEach((line, index) => {
            if (/^\s*color:\s*var\(--custom-accent-/.test(line)) {
                offenders.push(`${root}/${file}:${index + 1}`);
            }
        });
    }
}

if (offenders.length > 0) {
    console.error('demo labels must not use an accent token as text colour:');
    for (const where of offenders) console.error(`  ${where}`);
    process.exit(1);
}
console.log('no demo label paints itself in an accent token');
