/// <reference types="cypress" />

/**
 * ============================================================
 * Test Suite  : OrangeHRM - Login Feature
 * URL         : https://opensource-demo.orangehrmlive.com
 * Framework   : Cypress
 * Versi       : Standalone (tanpa custom command)
 * ============================================================
 */

describe("OrangeHRM - Login Feature", () => {

  const BASE_URL = "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";
  const VALID_USER = { username: "Admin", password: "admin123" };
  const INVALID_USER = { username: "wronguser", password: "wrongpass" };
  const WRONG_PASS = { username: "Admin", password: "wrongpass" };

  beforeEach(() => {
    cy.visit(BASE_URL);
    cy.get("input[name='username']", { timeout: 10000 }).should("be.visible");
  });

  // ─────────────────────────────────────────────────────────
  // TC-01: Elemen UI halaman login tampil dengan benar
  // ─────────────────────────────────────────────────────────
  it("TC-01 | Harus menampilkan semua elemen UI halaman login", () => {
    cy.get(".orangehrm-login-branding img").should("be.visible");

    cy.get("input[name='username']")
      .should("be.visible")
      .and("have.attr", "placeholder", "Username");

    cy.get("input[name='password']")
      .should("be.visible")
      .and("have.attr", "placeholder", "Password");

    cy.get("button[type='submit']")
      .should("be.visible")
      .and("contain.text", "Login");

    cy.get(".orangehrm-login-forgot").should("be.visible");
  });

  // ─────────────────────────────────────────────────────────
  // TC-02: Login berhasil dengan kredensial valid
  // ─────────────────────────────────────────────────────────
  it("TC-02 | Harus berhasil login dengan kredensial yang valid", () => {
    cy.get("input[name='username']").clear().type(VALID_USER.username);
    cy.get("input[name='password']").clear().type(VALID_USER.password);
    cy.get("button[type='submit']").click();

    cy.url({ timeout: 15000 }).should("include", "/dashboard");
    cy.get(".oxd-topbar-header-breadcrumb", { timeout: 10000 })
      .should("be.visible")
      .and("contain.text", "Dashboard");
  });

  // ─────────────────────────────────────────────────────────
  // TC-03: Login gagal dengan kredensial tidak valid
  // ─────────────────────────────────────────────────────────
  it("TC-03 | Harus tampil pesan error saat kredensial salah", () => {
    cy.get("input[name='username']").clear().type(INVALID_USER.username);
    cy.get("input[name='password']").clear().type(INVALID_USER.password);
    cy.get("button[type='submit']").click();

    cy.get(".oxd-alert-content-text", { timeout: 8000 })
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", "/auth/login");
  });

  // ─────────────────────────────────────────────────────────
  // TC-04: Validasi field kosong
  // ─────────────────────────────────────────────────────────
  it("TC-04 | Harus tampil pesan validasi saat field dikosongkan", () => {
    cy.get("button[type='submit']").click();

    cy.get(".oxd-input-field-error-message")
      .should("have.length.at.least", 2)
      .each(($el) => {
        cy.wrap($el).should("contain.text", "Required");
      });

    cy.url().should("include", "/auth/login");
  });

  // ─────────────────────────────────────────────────────────
  // TC-05: Login gagal dengan password salah
  // ─────────────────────────────────────────────────────────
  it("TC-05 | Harus tampil error saat username benar tapi password salah", () => {
    cy.get("input[name='username']").clear().type(WRONG_PASS.username);
    cy.get("input[name='password']").clear().type(WRONG_PASS.password);
    cy.get("button[type='submit']").click();

    cy.get(".oxd-alert-content-text", { timeout: 8000 })
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", "/auth/login");
  });

  // ─────────────────────────────────────────────────────────
  // TC-06: Password harus tersembunyi
  // ─────────────────────────────────────────────────────────
  it("TC-06 | Field password harus bertipe password (karakter tersembunyi)", () => {
    cy.get("input[name='password']")
      .type(VALID_USER.password)
      .should("have.attr", "type", "password");
  });

  // ─────────────────────────────────────────────────────────
  // TC-07: Navigasi ke halaman Forgot Password
  // ─────────────────────────────────────────────────────────
  it("TC-07 | Harus bisa mengakses halaman Forgot Password", () => {
    cy.get(".orangehrm-login-forgot p").click();

    cy.url({ timeout: 10000 }).should("include", "/requestPasswordResetCode");

    cy.get("h6")
      .should("be.visible")
      .and("contain.text", "Reset Password");
  });

});
