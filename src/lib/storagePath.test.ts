import { describe, expect, it } from "vitest";
import { storagePathFromUrl } from "./storagePath";

const base = "https://abc.supabase.co/storage/v1/object/public/before-after/";

describe("storagePathFromUrl", () => {
  it("kovadaki fotoğrafın dosya adını verir", () => {
    expect(storagePathFromUrl(`${base}3f2a.jpg`, base)).toBe("3f2a.jpg");
  });

  it("uzun (uuid) dosya adını da verir", () => {
    const name = "8b1e4c2a-5d6f-4a3b-9c8d-7e6f5a4b3c2d.jpg";
    expect(storagePathFromUrl(base + name, base)).toBe(name);
  });

  it("örnek çizim (Storage'da değil) → null", () => {
    expect(storagePathFromUrl("/ornek/akne-oncesi.svg", base)).toBeNull();
  });

  it("başka bir kovanın adresi → null", () => {
    expect(
      storagePathFromUrl("https://abc.supabase.co/storage/v1/object/public/baska-kova/3f2a.jpg", base),
    ).toBeNull();
  });

  it("başka bir sitenin adresi → null", () => {
    expect(storagePathFromUrl("https://kotu-site.com/before-after/3f2a.jpg", base)).toBeNull();
  });

  it("sadece kovanın adresi, dosya adı yok → null", () => {
    expect(storagePathFromUrl(base, base)).toBeNull();
  });
});
