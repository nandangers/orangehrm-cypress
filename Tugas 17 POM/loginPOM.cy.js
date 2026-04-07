/// <reference types="cypress" />

import loginPage from "../pageObjects/LoginPage";

describe("OrangeHRM - Login Feature (POM Format)", () => {
  // ─── DATA TEST ───
  const VALID_USER = { username: "Admin", password: "admin123" };
  const INVALID_USER = { username: "wronguser", password: "wrongpass" };
  const WRONG_PASS = { username: "Admin", password: "wrongpass" };

  beforeEach(() => {
    loginPage.visit();
    loginPage.elements.usernameInput().should("be.visible");
  });

  it("TC-01 | Harus menampilkan semua elemen UI halaman login", () => {
    loginPage.elements.logo().should("be.visible");
    loginPage.elements
      .usernameInput()
      .should("be.visible")
      .and("have.attr", "placeholder", "Username");
    loginPage.elements
      .passwordInput()
      .should("be.visible")
      .and("have.attr", "placeholder", "Password");
    loginPage.elements
      .loginBtn()
      .should("be.visible")
      .and("contain.text", "Login");
    loginPage.elements.forgotPasswordLink().should("be.visible");
  });

  it("TC-02 | Harus berhasil login dengan kredensial yang valid", () => {
    loginPage.login(VALID_USER.username, VALID_USER.password);

    cy.url({ timeout: 15000 }).should("include", "/dashboard");

    cy.get(".oxd-topbar-header-breadcrumb", { timeout: 15000 })
      .should("be.visible")
      .and("contain.text", "Dashboard");
  });

  it("TC-03 | Harus tampil pesan error saat kredensial salah", () => {
    loginPage.login(INVALID_USER.username, INVALID_USER.password);

    loginPage.elements
      .errorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
    cy.url().should("include", "/auth/login");
  });

  it("TC-04 | Harus tampil pesan validasi saat field dikosongkan", () => {
    loginPage.clickLogin();

    loginPage.elements
      .requiredMessage()
      .should("have.length.at.least", 2)
      .each(($el) => {
        cy.wrap($el).should("contain.text", "Required");
      });
  });

  it("TC-05 | Harus tampil error saat username benar tapi password salah", () => {
    loginPage.login(WRONG_PASS.username, WRONG_PASS.password);

    loginPage.elements
      .errorMessage()
      .should("be.visible")
      .and("contain.text", "Invalid credentials");
  });

  it("TC-06 | Harus bisa mengakses halaman Forgot Password", () => {
    loginPage.clickForgotPassword();

    cy.url({ timeout: 15000 }).should("include", "/requestPasswordResetCode");
    cy.get(".orangehrm-forgot-password-container", { timeout: 15000 }).should(
      "be.visible",
    );
  });
});
