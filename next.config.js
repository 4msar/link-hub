/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        // Enables the "use cache" directive without opting the whole app
        // into cacheComponents (which conflicts with route segment configs)
        useCache: true,
    },
    redirects: () => {
        return [
            {
                source: "/rss.xml",
                destination: "/feed",
                permanent: true,
            },
        ];
    },
};

module.exports = nextConfig;
