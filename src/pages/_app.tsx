import { Auth } from "@/components/auth";
import "@/styles/globals.css";
import { api } from "@/utils/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <Auth>
          <Component {...pageProps} />
        </Auth>
      </QueryClientProvider>
    </div>
  );
}

export default api.withTRPC(App);
