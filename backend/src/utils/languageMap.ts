export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

export function getLanguageId(language: string): number {
  const id = LANGUAGE_IDS[language.toLowerCase()];
  if (!id) {
    throw new Error("UNSUPPORTED_LANGUAGE");
  }
  return id;
}