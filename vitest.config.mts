import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Vitest: otomatik testleri çalıştırır. "npm test" → değişiklikleri izler, her kayıtta testleri yeniden çalıştırır.
// tsconfigPaths: kodda kullandığımız "@/..." kısayolunu testlerde de tanısın.
// environment "node": şimdilik sadece saf fonksiyonları (tarayıcısız) test ediyoruz.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
  },
});
