# Assets

All photographs are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (no Unsplash+ images). Each was downloaded at 2000px on its long edge (JPEG, quality 70), is served with `next/image` from `public/images/`, and is shown in black and white with a CSS `grayscale` filter so the set reads as one. Photographers are credited on `/credits` (linked from the footer).

| File | Unsplash page | Photographer | Used on |
|-|-|-|-|
| `public/images/songwriter-notes.jpg` | https://unsplash.com/photos/woman-in-black-and-white-striped-long-sleeve-shirt-writing-on-white-paper-5Wj_tk8_Ens | Soundtrap (https://unsplash.com/@soundtrap) | Home, "Who it's for" (large photo); `/credits` |
| `public/images/band-room.jpg` | https://unsplash.com/photos/a-group-of-people-playing-music-in-a-room-maf-hR6Q8Bw | Cyril Perronace (https://unsplash.com/@cyril_perronace) | Home, "Who it's for" (small photo); `/credits` |
| `public/images/producer-console.jpg` | https://unsplash.com/photos/man-in-front-of-mixing-console-KGyzk-EvTwQ | Bee Balogun (https://unsplash.com/@bee_balogun) | `/how-it-works` intro; `/credits` |

## Built in code (no image files)

| Asset | Where |
|-|-|
| Logo mark and wordmark (`src/components/site/brand.tsx`) | Header, footer, 404 |
| Favicon (`src/app/icon.svg`) | Browser tab |
| Open Graph image (`src/app/[locale]/opengraph-image.tsx`, per locale) | Social previews |
| Meter bridge (`src/components/home/meter-bridge.tsx`) | Home hero |
| Channel strips, faders, master meter (`src/components/demo/`) | Work pages, split sheet builder, amendments |
| Statement timeline, contract anatomy, continuous vs interval, bonus before/after | Home, `/how-it-works` |
| 30-day earnings chart (SVG) | Studio overview |

Icons: [lucide-react](https://lucide.dev) (ISC license).
