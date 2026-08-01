# Performance Baseline

This document records the measured ArcFort Weld performance baseline used to set CI budgets. It is
synthetic test evidence, not Chrome UX Report field data and not a guarantee for every buyer network.

## Live Mobile Measurement

Measurement date: 2026-08-02

Target: `https://www.arcfortweld.com/`

Browser and test conditions:

- Microsoft Edge through Playwright
- 390 x 844 CSS pixel viewport
- Device scale factor 1
- Browser cache disabled
- 4x CPU throttling
- 150 ms network latency
- 1.6 Mbps download throughput
- 750 Kbps upload throughput

Observed result from the recorded run:

| Metric                             |   Result |
| ---------------------------------- | -------: |
| Time to first byte                 | 1,061 ms |
| First contentful paint             | 1,744 ms |
| Largest contentful paint           | 1,756 ms |
| Cumulative layout shift            |        0 |
| HTML transfer size                 | 20.8 KiB |
| Optimized hero image transfer size | 14.8 KiB |

The LCP element was the homepage workshop hero image. Next Image selected a 640-pixel candidate at
quality 75 and delivered a 390 x 249 rendered image. The original PNG is intentionally not used as
the browser transfer-size estimate because Next Image serves an optimized derivative.

## Build Budgets

`npm run performance:budget` reads `.next/app-build-manifest.json` after `npm run build` and applies
the following gzip-compressed limits:

| Surface                                   |  Budget |
| ----------------------------------------- | ------: |
| Homepage JavaScript                       | 140 KiB |
| Product Center JavaScript                 | 145 KiB |
| RFQ JavaScript                            | 150 KiB |
| Shared CSS                                |  15 KiB |
| Any individual JavaScript asset           |  65 KiB |
| Any source image in `public/images/site/` |   3 MiB |

Baseline build values when the budget was introduced:

| Surface                   |       Baseline |
| ------------------------- | -------------: |
| Homepage JavaScript       | 122.2 KiB gzip |
| Product Center JavaScript | 122.6 KiB gzip |
| RFQ JavaScript            | 123.8 KiB gzip |
| Shared CSS                |   7.8 KiB gzip |
| Largest site image source |    2,132.7 KiB |

The limits allow maintenance headroom while still detecting a meaningful regression. Do not raise a
limit only to make CI pass. First identify the new asset or feature, measure its buyer value and
document why the additional transfer cost is necessary.

## Verification

Run after frontend, shared-script or site-image changes:

```bash
npm run build
npm run performance:budget
```

For significant homepage or RFQ changes, repeat a deployed mobile measurement and append a dated
result here. Compare like-for-like throttling conditions and keep synthetic and field data clearly
separated.
