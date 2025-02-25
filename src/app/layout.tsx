import { Inter } from 'next/font/google';
import "./globals.css";
import { ToastProvider } from '@/components/ui/toast';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lucky Wheel Game',
  description: 'LayerG lucky wheel game with Universal Account',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
