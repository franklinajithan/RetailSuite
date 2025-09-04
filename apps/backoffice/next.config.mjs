/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Avoid reading package.json name for uniqueName; set explicitly
    if (!config.output) config.output = {};
    config.output.uniqueName = "retail-backoffice";
    return config;
  },
};
export default nextConfig;
