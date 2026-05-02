---
title: "Images and Media"
sidebar_label: "Images & media"
description: Meaningful alt text, decorative images, video controls, captions, and audio practices for accessible, scannable pages.
slug: /web-content/images-and-media
tags: [ux, accessibility, images, video, alt-text, captions]
keywords:
  - alt text
  - decorative image
  - captions
  - transcripts
  - autoplay
  - alt empty
sidebar_position: 7
---

# Images and media

Images, charts, and video carry meaning that visual readers absorb in a glance. Accessible alternatives -- `alt`, captions, transcripts -- carry that same meaning to anyone using assistive tech, anyone with images blocked, or anyone watching with the sound off. Back to the [section overview](./overview.md).

## Alternative text

`alt` should convey the **job** of the image: what a sighted user learns from it. Decorative images use **`alt=""`** so assistive technologies skip them.

### Do

```html
<img
    src="/img/quarterly-revenue.webp"
    alt="Bar chart: revenue grew from 2M to 3.4M between Q1 and Q4."
    width="640"
    height="360"
>
```

### Don't

```html
<!-- Keyword stuffing and missing insight -->
<img src="/img/chart.webp" alt="chart graph money finance stock revenue money">

<!-- File name as alt -->
<img src="/img/IMG_02934.webp" alt="IMG_02934">
```

### Do (decorative)

```html
<img src="/img/section-divider.svg" alt="" role="presentation">
```

## Video and audio

Avoid **autoplay** with sound. Provide **captions** for speech and a **transcript** when content is central.

### Do

```html
<video controls preload="metadata">
    <source src="/media/product-tour.webm" type="video/webm">
    <track
        kind="captions"
        src="/media/product-tour-en.vtt"
        srclang="en"
        label="English"
        default
    >
</video>
```

### Don't

```html
<video autoplay loop src="/media/promo.mp4"></video>
```

## Related

- [Web Performance -- Images](../web-performance.md) -- responsive image patterns with `srcset` and `sizes`.
- [Semantic HTML](../semantic-html.mdx) -- `<figure>`, `<figcaption>`, `<picture>`, and media element references.
