/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'us-east-1.storage.xata.sh',
      'us-west-2.storage.xata.sh',
      'eu-west-1.storage.xata.sh',
      'eu-central-1.storage.xata.sh',
      'ap-southeast-2.storage.xata.sh',
      'us-east-1.storage.staging-xata.dev',
      'us-west-2.storage.staging-xata.dev',
      'eu-west-1.storage.staging-xata.dev',
      'eu-central-1.storage.staging-xata.dev',
      'ap-southeast-2.storage.staging-xata.dev'
    ]
  }
};

module.exports = nextConfig;
