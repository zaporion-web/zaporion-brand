# Product logo crops

Each product folder contains individual PNG crops from the source logo sheet:

- `zaphrms/` — 16 logo, icon, favicon, and responsive-size crops.
- `zappayroll/` — 16 logo, icon, favicon, and responsive-size crops.
- `zaptemplate/` — 15 horizontal, stacked, monochrome, app-icon, and favicon crops.
- `zapdocuments/` — 21 light and dark logo, icon, app-icon, favicon, usage, and minimum-size crops.

The crops keep their source pixel dimensions and original background colors. Filenames describe the variation. The small favicon and responsive-size crops have the dimensions of their bounding boxes on the sheets; they have not been enlarged or labeled as ready-to-use standard-size exports.

The original sheets remain in this folder. `manifest.json` records each crop's source coordinates, dimensions, and source-file checksum. To recreate the crops on macOS, run `node extract-crops.cjs` from this folder.
