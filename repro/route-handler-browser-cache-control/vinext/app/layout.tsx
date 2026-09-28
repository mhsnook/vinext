export const metadata = {
  title: "Route handler browser Cache-Control repro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 32 }}>{children}</body>
    </html>
  );
}
