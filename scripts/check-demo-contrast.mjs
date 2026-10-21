#!/usr/bin/env node
// Guards the demo colour contract in two ways:
//
// 1. WCAG AA contrast for every accent fill used by the demo modules
//    (FlexboxDemo, GridDemo, TransitionDemo). The foregrounds below are the
//    ones those modules set; update a pair when a module changes a colour.
// 2. No demo label may paint itself in an accent token. Those tokens are tuned
//    as fills; used as text on a same-hue tint they measured 2.28-3.59:1
//    (issue #618), so the rule is banned rather than modelled per selector.
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

// A demo label must inherit its colour. An accent token as `color` has no
// contrast guarantee against the tint it sits on, and modelling six
// `color-mix` backgrounds here would drift from the CSS it guards (#618).
const offenders = [];
for (const file of readdirSync(new URL('../src/components', import.meta.url), {recursive: true})) {
    if (!file.endsWith('.module.css')) continue;
    const text = readFileSync(new URL(`../src/components/${file}`, import.meta.url), 'utf8');
    text.split('\n').forEach((line, index) => {
        if (/^\s*color:\s*var\(--custom-accent-/.test(line)) {
            offenders.push(`src/components/${file}:${index + 1}`);
        }
    });
}

if (offenders.length > 0) {
    console.error('demo labels must not use an accent token as text colour:');
    for (const where of offenders) console.error(`  ${where}`);
    process.exit(1);
}
console.log('no demo label paints itself in an accent token');
