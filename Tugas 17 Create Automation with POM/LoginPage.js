class LoginPage {
  constructor() {
    this.elements = {
      logo: () => cy.get(".orangehrm-login-branding img"),

      usernameInput: () => cy.get("input[name='username']", { timeout: 15000 }),

      passwordInput: () => cy.get("input[name='password']"),
      loginBtn: () => cy.get("button[type='submit']"),
      forgotPasswordLink: () => cy.get(".orangehrm-login-forgot p"),
      errorMessage: () => cy.get(".oxd-alert-content-text"),
      requiredMessage: () => cy.get(".oxd-input-field-error-message"),
    };
  }

  // ─── AKSI (ACTIONS) ───
  visit() {
    cy.visit(
      "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
    );
  }

  typeUsername(username) {
    this.elements.usernameInput().clear().type(username);
  }

  typePassword(password) {
    this.elements.passwordInput().clear().type(password);
  }

  clickLogin() {
    this.elements.loginBtn().click();
  }

  login(username, password) {
    this.typeUsername(username);
    this.typePassword(password);
    this.clickLogin();
  }

  clickForgotPassword() {
    this.elements.forgotPasswordLink().click();
  }
}

export default new LoginPage();
