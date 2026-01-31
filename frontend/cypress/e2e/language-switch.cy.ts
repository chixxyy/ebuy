describe("Language Switch Feature", () => {
  beforeEach(() => {
    // 確保造訪首頁
    cy.visit("/");
  });

  it("should switch between English and Traditional Chinese", () => {
    // 1. 驗證預設為英文 (defaultLocale: ENGLISH)
    // 根據 manual-dictionary.json (en): "hero_title": "Elevate Your"
    cy.get("h1").should("contain", "Elevate Your");

    // 取出切換按鈕並點擊 (切換到中文)
    cy.get('[data-testid="language-switch"]').should("be.visible").click();

    // 2. 驗證切換為中文
    // 根據 manual-dictionary.json (zh-TW): "hero_title": "提升您的"
    // 給予一些緩衝時間讓畫面更新
    cy.contains("提升您的", { timeout: 2000 }).should("be.visible");
    cy.get("h1").should("contain", "提升您的");

    // 取出切換按鈕並再次點擊 (切換回英文)
    cy.get('[data-testid="language-switch"]').click();

    // 3. 驗證切換回英文
    cy.contains("Elevate Your", { timeout: 2000 }).should("be.visible");
    cy.get("h1").should("contain", "Elevate Your");
  });
});
