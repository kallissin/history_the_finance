import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Obra em Dia | Controle financeiro",
  description: "Acompanhe os custos, pagamentos e parcelas da sua reforma.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
