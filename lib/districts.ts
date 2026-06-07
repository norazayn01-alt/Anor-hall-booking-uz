export const DISTRICTS = [
  "Bektemir",
  "Mirobod",
  "Mirzo Ulug'bek",
  "Olmazor",
  "Sergeli",
  "Uchtepa",
  "Yakkasaroy",
  "Yangihayot",
  "Yashnobod",
  "Yunusobod",
  "Shayxontohur",
  "Chilonzor"
];

export function getDistrictSlug(tuman: string) {
  return tuman.toLowerCase().replace(/['`’]/g, "").replace(/\s+/g, "_");
}
