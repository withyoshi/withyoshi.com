# Icon Generation Script

This document describes how to use the `scripts/generate-icons.js` script to generate all required favicon and app icons from a single source image.

## Overview

The script generates all the standard web app icons and favicons needed for modern web applications, including:

- Android Chrome icons (192×192, 512×512)
- Apple Touch Icon (180×180)
- Favicons (16×16, 32×32)
- ICO file (multi-size)
- Safari Pinned Tab SVG

## Prerequisites

The script requires the following dependencies to be installed:

```bash
pnpm add -D sharp to-ico
```

- **sharp**: High-performance image processing library
- **to-ico**: Converts PNG images to ICO format

## Usage

### Basic Usage

```bash
# Use with any source image
node scripts/generate-icons.js /path/to/your/icon.png

# Use default source image
node scripts/generate-icons.js
```

The script will:

1. Use the provided source image path or default to the built-in source image
2. Generate all required icon sizes in the same directory as the source image
3. Display progress and verification information
4. Show helpful usage information if source image is not found

### Source Image Requirements

- **Format**: PNG with transparency support
- **Size**: 512×512 pixels (recommended)
- **Quality**: High resolution for best results when scaled down
- **Content**: Square design that works well at small sizes

## Generated Icons

| File                         | Size         | Format | Purpose                        |
| ---------------------------- | ------------ | ------ | ------------------------------ |
| `android-chrome-192x192.png` | 192×192      | PNG    | Android Chrome icon            |
| `android-chrome-512x512.png` | 512×512      | PNG    | Android Chrome icon (original) |
| `apple-touch-icon.png`       | 180×180      | PNG    | iOS Safari bookmark icon       |
| `favicon-16x16.png`          | 16×16        | PNG    | Standard favicon               |
| `favicon-32x32.png`          | 32×32        | PNG    | High-DPI favicon               |
| `favicon.ico`                | 16×16, 32×32 | ICO    | Multi-size favicon             |
| `safari-pinned-tab.svg`      | 32×32        | SVG    | Safari pinned tab icon         |

## Configuration

The script is configured through the `iconConfigs` array in the script:

```javascript
// Get source image from command line argument or use default
const sourceImage =
  process.argv[2] || path.join(__dirname, "../path/to/default/source.png");

// Output to the same directory as the source image
const outputDir = path.dirname(sourceImage);

const iconConfigs = [
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon.ico", size: 32, format: "ico" },
  { name: "safari-pinned-tab.svg", size: 32, format: "svg" },
];
```

### Customizing Icon Sizes

To add or modify icon sizes, update the `iconConfigs` array:

```javascript
// Add a new icon size
{ name: "custom-icon-256x256.png", size: 256 },

// Modify existing size
{ name: "apple-touch-icon.png", size: 152 }, // Different size for older iOS
```

### Customizing Output Directory

The script automatically outputs icons to the same directory as the source image. To change this behavior, modify the `outputDir` variable:

```javascript
// Default: output to same directory as source image
const outputDir = path.dirname(sourceImage);

// Custom: output to specific directory
const outputDir = path.join(__dirname, "../public/meta/custom");
```

## Image Processing Details

### Resize Algorithm

The script uses Sharp's `contain` fit mode with transparent background:

```javascript
.resize(config.size, config.size, {
  fit: "contain",
  background: { r: 0, g: 0, b: 0, alpha: 0 },
})
```

This ensures:

- Icons maintain aspect ratio
- No distortion occurs
- Transparent backgrounds are preserved
- Content is centered within the square

### ICO Generation

For ICO files, the script generates multiple PNG sizes and combines them:

```javascript
const sizes = [16, 32];
const pngBuffers = [];
// ... generate buffers for each size
const icoBuffer = await toIco(pngBuffers);
```

### SVG Generation

SVG files embed the PNG as base64 data:

```xml
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <image width="32" height="32" href="data:image/png;base64,..."/>
</svg>
```

## Output Verification

The script automatically verifies all generated files and displays:

- File existence status
- File sizes in bytes
- Success/failure indicators

Example output:

```
✓ android-chrome-192x192.png (74801 bytes)
✓ apple-touch-icon.png (66402 bytes)
✓ favicon-16x16.png (1009 bytes)
✓ favicon-32x32.png (3205 bytes)
✓ favicon.ico (5238 bytes)
✓ safari-pinned-tab.svg (1541 bytes)
```

## Error Handling

The script includes comprehensive error handling:

- **Missing source image**: Exits with error message
- **File system errors**: Catches and displays errors
- **Image processing errors**: Handles Sharp library errors
- **ICO conversion errors**: Handles to-ico library errors

## Integration with Web Apps

### HTML Meta Tags

Use the generated icons in your HTML:

```html
<!-- Favicons -->
<link rel="icon" type="image/x-icon" href="/path/to/favicon.ico" />
<link
  rel="icon"
  type="image/png"
  sizes="16x16"
  href="/path/to/favicon-16x16.png"
/>
<link
  rel="icon"
  type="image/png"
  sizes="32x32"
  href="/path/to/favicon-32x32.png"
/>

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/path/to/apple-touch-icon.png" />

<!-- Android Chrome Icons -->
<link
  rel="icon"
  type="image/png"
  sizes="192x192"
  href="/path/to/android-chrome-192x192.png"
/>
<link
  rel="icon"
  type="image/png"
  sizes="512x512"
  href="/path/to/android-chrome-512x512.png"
/>

<!-- Safari Pinned Tab -->
<link rel="mask-icon" href="/path/to/safari-pinned-tab.svg" color="#000000" />
```

### Web App Manifest

Include in your `site.webmanifest`:

```json
{
  "icons": [
    {
      "src": "/path/to/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/path/to/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **"Source image not found"**
   - Ensure the source image file exists
   - Check file permissions

2. **Sharp library errors**
   - Verify the source image is a valid PNG
   - Check if the image is corrupted

3. **ICO generation fails**
   - Ensure `to-ico` package is installed
   - Check Node.js version compatibility

### Performance Tips

- Use high-quality source images (512×512 or larger)
- Ensure source images have good contrast for small sizes
- Test generated icons at actual display sizes
- Consider using vector graphics for the source when possible

## Script Maintenance

### Updating Dependencies

```bash
# Update Sharp
pnpm update sharp

# Update to-ico
pnpm update to-ico
```

### Adding New Icon Formats

To support new icon formats, extend the script:

1. Add new configuration to `iconConfigs`
2. Add format handling in the generation loop
3. Update documentation

## License

This script is licensed under the MIT License. See the LICENSE file for details.
