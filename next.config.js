/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
