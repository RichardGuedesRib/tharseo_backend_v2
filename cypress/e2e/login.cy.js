describe("Login test", () => {
  it("O processo de login ao fim deve ser feito com sucesso, testaremos a entrada de dados com um e-mail errado, porém a senha correta e vice versa, o processo de login só poderá ser feito com sucesso com login e senha validos simultâneos", () => {
    cy.visit("https://tharseocripto.web.app/signin");
    cy.get("#email").type("alberto.ribeiro.oliveirahotmail.com");
    cy.get(".gap-6 > .inline-flex").click();
    cy.get("#email").clear().type("alberto.ribeiro.oliveira@hotmail.com");
    cy.get(".gap-6 > .inline-flex").click();
    cy.get("#password").type("fatec12345");
    cy.get(".gap-6 > .inline-flex").click();
    cy.get("#password").clear().type("Fatec12345");
    cy.get(".gap-6 > .inline-flex").click();
  });
});