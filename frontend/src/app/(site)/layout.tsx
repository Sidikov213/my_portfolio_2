import { SiteHeader } from "@/components/site-header";
import { LocaleProvider } from "@/i18n/locale-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <div className="paper-page">
          <SiteHeader />
          <main className="relative z-[1] flex-1">{children}</main>
        </div>
      </LocaleProvider>
    </ThemeProvider>
  );
}
