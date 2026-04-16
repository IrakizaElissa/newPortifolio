const repoName = "my_portifolio_-website"
const isStaticSubpathDeploy =
  process.env.NEXT_PUBLIC_DEPLOY_TARGET === "github-pages" ||
  process.env.GITHUB_ACTIONS === "true"
const basePath = isStaticSubpathDeploy ? `/${repoName}` : ""

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isStaticSubpathDeploy ? "export" : undefined,
  trailingSlash: isStaticSubpathDeploy,
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: true,
  poweredByHeader: false,
}

export default nextConfig
