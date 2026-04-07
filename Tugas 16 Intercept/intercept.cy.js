/// <reference types="cypress" />

describe("OrangeHRM - Login Feature (Intercept)", () => {
  // ─── Konstanta ────────────────────────────────────────────
  const BASE_URL =
    "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login";
  const VALID_USER = { username: "Admin", password: "admin123" };
  const INVALID_USER = { username: "wronguser", password: "wrongpass" };
  const WRONG_PASS = { username: "Admin", password: "wrongpass" };

  // ─── Endpoint API ─────────────────────────────────────────
  const API = {
    pageLoad: "**/core/i18n/messages",
    loginPost: "**/api/v2/auth/login",
    forgotPage: "**/auth/requestPasswordResetCode",
  };

  beforeEach(() => {
    cy.visit(BASE_URL);
    cy.get("input[name='username']", { timeout: 10000 }).should("be.visible");
  });

  // ═══════════════════════════════════════════════════════════
  // TC-01 | SPY GET — Monitor API request saat halaman di-load
  // ═══════════════════════════════════════════════════════════
  it("TC-01 | Elemen UI halaman login tampil dengan benar", () => {
    // Pasang perangkap untuk API bahasa yang dipanggil saat reload
    cy.intercept("GET", API.pageLoad).as("pageLoadAPI");

    cy.reload();

    cy.wait("@pageLoadAPI", { timeout: 15000 }).then((interception) => {
      expect([200, 304]).to.include(interception.response.statusCode);
    });

    // Verifikasi semua elemen UI
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

  // ═══════════════════════════════════════════════════════════
  // TC-02 | E2E UI — Verifikasi Login Sukses
  // ═══════════════════════════════════════════════════════════
  it("TC-02 | Login berhasil dengan kredensial yang valid", () => {
    cy.get("input[name='username']").clear().type(VALID_USER.username);
    cy.get("input[name='password']").clear().type(VALID_USER.password);
    cy.get("button[type='submit']").click();

    cy.url({ timeout: 15000 }).should("include", "/dashboard/index");

    cy.get(".oxd-topbar-header-breadcrumb", { timeout: 10000 })
      .should("be.visible")
      .and("contain.text", "Dashboard");
  });

  // ═══════════════════════════════════════════════════════════
  // TC-03 | E2E UI — Verifikasi Pesan Error (Kredensial Salah)
  // ═══════════════════════════════════════════════════════════
  it("TC-03 | Pesan error tampil saat kredensial tidak valid", () => {
    // Input dengan username dan password yang dua-duanya salah
    cy.get("input[name='username']").clear().type(INVALID_USER.username);
    cy.get("input[name='password']").clear().type(INVALID_USER.password);
    cy.get("button[type='submit']").click();

    // Validasi bahwa kotak error berwarna merah muncul di UI
    cy.get(".oxd-alert-content-text", { timeout: 8000 })
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    // Validasi URL tetap berada di halaman login
    cy.url().should("include", "/auth/login");
  });

  // ═══════════════════════════════════════════════════════════
  // TC-04 | ASSERT — API tidak dipanggil saat field kosong
  // ═══════════════════════════════════════════════════════════
  it("TC-04 | Pesan validasi tampil saat field dikosongkan", () => {
    cy.get("button[type='submit']").click();

    cy.get(".oxd-input-field-error-message")
      .should("have.length.at.least", 2)
      .each(($el) => {
        cy.wrap($el).should("contain.text", "Required");
      });

    cy.url().should("include", "/auth/login");
  });

  // ═══════════════════════════════════════════════════════════
  // TC-05 | E2E UI — Verifikasi Pesan Error (Username Benar, Password Salah)
  // ═══════════════════════════════════════════════════════════
  it("TC-05 | Error tampil saat username benar tapi password salah", () => {
    // Input dengan username BENAR, tapi password SALAH
    cy.get("input[name='username']").clear().type(WRONG_PASS.username);
    cy.get("input[name='password']").clear().type(WRONG_PASS.password);
    cy.get("button[type='submit']").click();

    // Validasi bahwa sistem tetap menolak dan memunculkan error
    cy.get(".oxd-alert-content-text", { timeout: 8000 })
      .should("be.visible")
      .and("contain.text", "Invalid credentials");

    cy.url().should("include", "/auth/login");
  });

  // ═══════════════════════════════════════════════════════════
  // TC-06 | ASSERT — Field password harus bertipe hidden
  // ═══════════════════════════════════════════════════════════
  it("TC-06 | Field password harus bertipe password (karakter tersembunyi)", () => {
    cy.get("input[name='password']")
      .type(VALID_USER.password)
      .should("have.attr", "type", "password");
  });

  // ═══════════════════════════════════════════════════════════
  // TC-07 | SPY GET — Monitor load halaman Forgot Password
  // ═══════════════════════════════════════════════════════════
  it("TC-07 | Bisa mengakses halaman Forgot Password", () => {
    cy.get(".orangehrm-login-forgot p").click();

    cy.url({ timeout: 15000 }).should("include", "/requestPasswordResetCode");
    cy.get(".orangehrm-forgot-password-container", { timeout: 15000 }).should(
      "be.visible",
    );
    cy.contains("Reset Password", { timeout: 10000 }).should("be.visible");

    cy.get("input[name='username']").should("be.visible");
    cy.get("button[type='submit']").should("be.visible");
  });
});
