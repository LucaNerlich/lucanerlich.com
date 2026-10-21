#!/usr/bin/env node
// Recomputes WCAG AA contrast for every accent fill used by the demo modules
// (FlexboxDemo, GridDemo, TransitionDemo). The foregrounds below are the ones
// those modules set; update a pair when a module changes a colour, then run:
//
//     node scripts/check-demo-contrast.mjs
//
// The accent values are read from src/css/custom.css, so a token change is
// picked up here without editing this file.
import {readFileSync} from 'node:fs';

const AA_NORMAL_TEXT = 4.5;

const css = readFileSync(new URL('../src/css/custom.css', import.meta.url), 'utf8');
const darkStart = css.indexOf("html[data-theme='dark']");
const parseAccents = (block) =>
    Object.fromEntries(
        [...block.matchAll(/--custom-accent-([a-z]+):\s*(#[0-9a-f]{6})/gi)]
            .map(([, name, value]) => [name, value.toLowerCase()]),
    );
const themes = {
    light: parseAccents(css.slice(0, darkStart)),
    dark: parseAccents(css.slice(darkStart)),
};

// [theme, accent, foreground, where the pair is rendered]
const pairs = [
    ['light', 'purple', '#ffffff', 'Flexbox item 1, Grid default, Transition card'],
    ['light', 'green', '#000000', 'Flexbox item 2, Grid 2n, Transition active card'],
    ['light', 'amber', '#111111', 'Flexbox item 3, Grid 3n'],
    ['light', 'red', '#ffffff', 'Flexbox item 4'],
    ['dark', 'purple', '#111111', 'Flexbox item 1, Grid default, Transition card'],
    ['dark', 'green', '#111111', 'Flexbox item 2, Grid 2n, Transition active card'],
    ['dark', 'amber', '#111111', 'Flexbox item 3, Grid 3n'],
    ['dark', 'red', '#111111', 'Flexbox item 4'],
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
for (const [theme, accent, foreground, where] of pairs) {
    const background = themes[theme]?.[accent];
    if (!background) {
        console.error(`missing --custom-accent-${accent} for ${theme}`);
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
    console.error(`${failed} accent pair(s) below ${AA_NORMAL_TEXT}:1`);
    process.exit(1);
}
console.log(`all ${pairs.length} accent pairs >= ${AA_NORMAL_TEXT}:1`);
