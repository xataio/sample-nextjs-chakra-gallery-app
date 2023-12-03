/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'us-east-1.storage.xata.sh',
      'us-west-2.storage.xata.sh',
      'eu-west-1.storage.xata.sh',
      'eu-central-1.storage.xata.sh',
      'ap-southeast-2.storage.xata.sh'
    ]
  }
};

module.exports = nextConfig;
