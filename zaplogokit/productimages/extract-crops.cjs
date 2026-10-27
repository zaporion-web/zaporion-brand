const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = __dirname;

// Each box uses source-image pixels: x, y, width, height.
const products = [
  {
    slug: 'zaphrms', source: 'zaphrms.png', width: 1672, height: 941,
    variants: [
      ['light-horizontal.png', 888, 86, 742, 188],
      ['light-stacked.png', 202, 37, 438, 281],
      ['icon-light.png', 132, 390, 163, 119],
      ['app-icon-blue.png', 546, 390, 128, 115],
      ['monochrome-black-horizontal.png', 838, 401, 350, 100],
      ['monochrome-white-horizontal.png', 1259, 397, 387, 106],
      ['brand-horizontal.png', 22, 597, 540, 135],
      ['full-color-dark-horizontal.png', 591, 597, 514, 135],
      ['favicon-light.png', 61, 824, 70, 72],
      ['favicon-brand.png', 184, 823, 78, 75],
      ['favicon-dark.png', 313, 822, 81, 76],
      ['favicon-black.png', 457, 822, 82, 76],
      ['responsive-large-stacked.png', 731, 817, 140, 75],
      ['responsive-medium-stacked.png', 1024, 817, 134, 76],
      ['responsive-small-stacked.png', 1256, 827, 99, 59],
      ['responsive-extra-small-icon.png', 1480, 837, 53, 46],
    ],
  },
  {
    slug: 'zappayroll', source: 'zappayroll.png', width: 1672, height: 941,
    variants: [
      ['light-horizontal.png', 880, 91, 753, 190],
      ['light-stacked.png', 164, 55, 517, 293],
      ['icon-light.png', 126, 413, 161, 131],
      ['app-icon-blue.png', 537, 417, 127, 120],
      ['monochrome-black-horizontal.png', 834, 433, 358, 97],
      ['monochrome-white-horizontal.png', 1249, 427, 398, 110],
      ['brand-horizontal.png', 17, 624, 554, 134],
      ['full-color-dark-horizontal.png', 596, 624, 511, 134],
      ['favicon-light.png', 69, 836, 68, 66],
      ['favicon-brand.png', 187, 835, 70, 67],
      ['favicon-dark.png', 320, 834, 74, 69],
      ['favicon-black.png', 456, 832, 80, 72],
      ['responsive-large-horizontal.png', 709, 837, 234, 55],
      ['responsive-medium-horizontal.png', 1029, 839, 172, 51],
      ['responsive-small-horizontal.png', 1284, 842, 143, 47],
      ['responsive-extra-small-horizontal.png', 1505, 849, 107, 41],
    ],
  },
  {
    slug: 'zaptemplate', source: 'zaptemplate.png', width: 1774, height: 887,
    variants: [
      ['light-horizontal.png', 80, 87, 680, 174],
      ['light-stacked.png', 870, 66, 341, 198],
      ['icon-light.png', 1448, 75, 194, 192],
      ['dark-horizontal.png', 30, 332, 731, 179],
      ['dark-stacked.png', 779, 332, 484, 198],
      ['monochrome-black-horizontal.png', 1335, 375, 399, 122],
      ['monochrome-white-horizontal.png', 29, 551, 724, 116],
      ['app-icon-light.png', 31, 706, 153, 156],
      ['app-icon-blue.png', 192, 706, 155, 156],
      ['app-icon-dark.png', 354, 706, 155, 156],
      ['app-icon-black.png', 517, 706, 156, 156],
      ['favicon-light.png', 756, 742, 81, 85],
      ['favicon-blue.png', 858, 742, 84, 85],
      ['favicon-dark.png', 963, 742, 84, 85],
      ['favicon-black.png', 1069, 742, 83, 85],
    ],
  },
  {
    slug: 'zapdocuments', source: 'zapdocuments.png', width: 1536, height: 1024,
    variants: [
      ['light-horizontal.png', 62, 71, 582, 151],
      ['light-stacked.png', 728, 52, 325, 171],
      ['icon-light.png', 1248, 59, 165, 169],
      ['dark-horizontal.png', 29, 274, 628, 153],
      ['dark-stacked.png', 670, 274, 444, 153],
      ['icon-dark.png', 1231, 280, 177, 150],
      ['monochrome-black-horizontal.png', 113, 480, 468, 123],
      ['monochrome-black-stacked.png', 750, 469, 277, 127],
      ['monochrome-white-horizontal.png', 1128, 466, 382, 144],
      ['app-icon-light.png', 24, 659, 143, 149],
      ['app-icon-blue.png', 174, 659, 143, 149],
      ['app-icon-dark.png', 321, 659, 143, 149],
      ['app-icon-black.png', 468, 659, 145, 149],
      ['favicon-light.png', 647, 691, 73, 74],
      ['favicon-blue.png', 740, 691, 73, 74],
      ['favicon-dark.png', 836, 691, 73, 74],
      ['favicon-black.png', 927, 691, 74, 74],
      ['usage-brand-background.png', 866, 859, 313, 135],
      ['usage-dark-background.png', 1189, 859, 323, 135],
      ['minimum-size-horizontal.png', 56, 866, 198, 66],
      ['minimum-size-icon.png', 301, 858, 78, 69],
    ],
  },
];

function dimensions(file) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  const width = Number(output.match(/pixelWidth: (\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight: (\d+)/)?.[1]);
  return { width, height };
}

const manifest = {
  method: 'Pixel-preserving rectangular PNG crops; no resampling or recoloring.',
  background: 'Original backgrounds are retained, including white, dark, and colored icon backgrounds.',
  products: [],
};

for (const product of products) {
  const sourcePath = path.join(root, product.source);
  const actual = dimensions(sourcePath);
  if (actual.width !== product.width || actual.height !== product.height) {
    throw new Error(`${product.source}: expected ${product.width}x${product.height}, found ${actual.width}x${actual.height}`);
  }

  const folder = path.join(root, product.slug);
  fs.mkdirSync(folder, { recursive: true });
  const outputVariants = [];

  for (const [filename, x, y, width, height] of product.variants) {
    if (x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > actual.width || y + height > actual.height) {
      throw new Error(`${product.source}: crop ${filename} is outside the source image`);
    }
    const outputPath = path.join(folder, filename);
    execFileSync('sips', [
      '--cropToHeightWidth', String(height), String(width),
      '--cropOffset', String(y), String(x),
      sourcePath, '--out', outputPath,
    ], { stdio: 'ignore' });
    const outputSize = dimensions(outputPath);
    if (outputSize.width !== width || outputSize.height !== height) {
      throw new Error(`${filename}: expected ${width}x${height}, found ${outputSize.width}x${outputSize.height}`);
    }
    outputVariants.push({
      filename,
      path: `${product.slug}/${filename}`,
      crop: { x, y, width, height },
      output: outputSize,
    });
  }

  manifest.products.push({
    name: product.slug,
    source: product.source,
    sourceDimensions: actual,
    sourceSha256: crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex'),
    variants: outputVariants,
  });
  console.log(`${product.slug}: wrote ${outputVariants.length} crops`);
}

fs.writeFileSync(path.join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${manifest.products.reduce((n, product) => n + product.variants.length, 0)} crops and manifest.json`);
