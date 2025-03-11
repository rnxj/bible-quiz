import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import "./src/env.js";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./src/data/**/*"],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
