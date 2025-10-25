/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["next-image-export-optimizer"],
  images: {
    imageSizes: [2048],
    deviceSizes: [],
  },
  env: {
    nextImageExportOptimizer_quality: "95",
    nextImageExportOptimizer_storePicturesInWEBP: "true",
    nextImageExportOptimizer_exportFolderName: ".opt",
    nextImageExportOptimizer_generateAndUseBlurImages: "true",
    nextImageExportOptimizer_remoteImageCacheTTL: "0",
  },
  // Use the turbopack key for specific Turbopack configurations
  turbopack: {
    rules: {
      // Apply these rules to any file ending in *.svg
      "*.svg": {
        // Use the @svgr/webpack loader
        loaders: ["@svgr/webpack"],
        // Tell Turbopack to treat the output as a JS module (React component)
        as: "*.js",
      },
    },
  },
};

module.exports = nextConfig;
