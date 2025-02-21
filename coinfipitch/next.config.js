/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      try {
        // Alias imports from '@floating-ui/react-dom' to '@floating-ui/dom'
        config.resolve.alias["@floating-ui/react-dom"] =
          require.resolve("@floating-ui/dom")
      } catch (error) {
        console.error(
          "Error resolving alias for @floating-ui/react-dom:",
          error
        )
      }
    }
    return config
  },
}

module.exports = nextConfig
