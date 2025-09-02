 BackofficeTopBar from "@/components/BackofficeTopBar"
import ClientChrome from '@/components/layout/ClientChrome'

export const metadata = {
  title: 'Retail Backoffice',
  description: 'Professional CRM Backoffice'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
    <BackofficeTopBar />

        <ClientChrome>{children}</ClientChrome>
      </body>
    </html>
  )
}