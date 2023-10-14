import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { BaseLayout } from '~/components/layout/base';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';
export const preferredRegion = 'iad1';

export const metadata: Metadata = {
  title: 'Xata Gallery Sample App',
  description: 'Xata gallery sample app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <BaseLayout>{children}</BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
