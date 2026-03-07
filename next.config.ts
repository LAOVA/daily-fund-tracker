import type { NextConfig } from "next";
import { codeInspectorPlugin } from "code-inspector-plugin";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: "/daily-fund-tracker",
  webpack: (config) => {
    config.plugins.push(
      codeInspectorPlugin({
        bundler: "webpack",
      })
    );
    return config;
  },
};

export default nextConfig;

