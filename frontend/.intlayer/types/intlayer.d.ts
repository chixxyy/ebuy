import "intlayer";

declare module "intlayer" {
  interface __DictionaryRegistry {}

  interface __DeclaredLocalesRegistry {
    en: 1;
    "zh-Hant": 1;
  }

  interface __RequiredLocalesRegistry {
    en: 1;
    "zh-Hant": 1;
  }

  interface __SchemaRegistry {}

  interface __StrictModeRegistry {
    mode: "inclusive";
  }
}
