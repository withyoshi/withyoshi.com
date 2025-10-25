const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const toIco = require("to-ico");

// Get source image from command line argument or use default
const sourceImage =
  process.argv[2] ||
  path.join(__dirname, "../public/meta/cv/android-chrome-512x512.png");

// Output to the same directory as the source image
const outputDir = path.dirname(sourceImage);

// Icon configurations
const iconConfigs = [
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "favicon.ico", size: 32, format: "ico" },
  { name: "safari-pinned-tab.svg", size: 32, format: "svg" },
];

async function generateIcons() {
  try {
    // Check if source image exists
    if (!fs.existsSync(sourceImage)) {
      console.error("Source image not found:", sourceImage);
      console.error("\nUsage: node generate-icons.js [source-image-path]");
      console.error("Example: node generate-icons.js /path/to/your/icon.png");
      process.exit(1);
    }

    console.log("Generating icons from:", sourceImage);
    console.log("Output directory:", outputDir);

    for (const config of iconConfigs) {
      const outputPath = path.join(outputDir, config.name);

      console.log(
        `Generating ${config.name} (${config.size}x${config.size})...`,
      );

      let sharpInstance = sharp(sourceImage).resize(config.size, config.size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });

      if (config.format === "ico") {
        // For ICO files, create multiple PNG sizes and convert to ICO
        const sizes = [16, 32];
        const pngBuffers = [];

        for (const size of sizes) {
          const buffer = await sharp(sourceImage)
            .resize(size, size, {
              fit: "contain",
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer();
          pngBuffers.push(buffer);
        }

        // Convert PNG buffers to ICO
        const icoBuffer = await toIco(pngBuffers);
        fs.writeFileSync(outputPath, icoBuffer);
      } else if (config.format === "svg") {
        // For SVG, create a simple SVG with the image embedded
        const pngBuffer = await sharpInstance.png().toBuffer();
        const base64 = pngBuffer.toString("base64");

        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${config.size}" height="${config.size}" viewBox="0 0 ${config.size} ${config.size}" xmlns="http://www.w3.org/2000/svg">
  <image width="${config.size}" height="${config.size}" href="data:image/png;base64,${base64}"/>
</svg>`;

        fs.writeFileSync(outputPath, svgContent);
      } else {
        // For PNG files
        await sharpInstance.png().toFile(outputPath);
      }

      console.log(`✓ Generated ${config.name}`);
    }

    console.log("\nAll icons generated successfully!");

    // Verify generated files
    console.log("\nVerifying generated files:");
    for (const config of iconConfigs) {
      const outputPath = path.join(outputDir, config.name);
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`✓ ${config.name} (${stats.size} bytes)`);
      } else {
        console.log(`✗ ${config.name} - NOT FOUND`);
      }
    }
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
