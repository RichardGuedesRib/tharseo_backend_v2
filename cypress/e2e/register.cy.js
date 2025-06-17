describe("Cadastro test", () => {
  it("O cadastro ao fim deve ser feito com sucesso, testaremos a entrada de dados de e-mail, senha e telefone fora do padrão e no padrão", () => {
    cy.visit("http://tharseocripto.web.app/");
    cy.get(".justify-around.mt-4 > .flex > .bg-blue-600").click();
    cy.get(".inline-flex").should("exist"); // Confirma se o elemento está presente
    cy.get("#\\:r0\\:-form-item").type("alberto.ribeiro.oliveirahotmail.com");
    cy.get("#\\:r1\\:-form-item").type("12345");
    cy.get("#\\:r2\\:-form-item").type("12345");
    cy.get(".inline-flex").click();
    cy.get("#\\:r0\\:-form-item").clear().type("alberto.oliveira@hotmail.com");
    cy.get("#\\:r1\\:-form-item").clear().type("Fatec12345");
    cy.get("#\\:r2\\:-form-item").clear().type("Fatec12345");
    cy.get(".inline-flex").click();
    cy.get("#\\:r3\\:-form-item").type("Alberto");
    cy.get("#\\:r4\\:-form-item").type("Ribeiro de Oliveira");
    cy.get("#\\:r5\\:-form-item").type("12345");
    cy.get(".inline-flex").click();
    cy.get("#\\:r5\\:-form-item").clear().type("Fatec12345");
    cy.get(".inline-flex").click();
    cy.get("#\\:r5\\:-form-item").clear().type("11979666666");
    cy.get(".inline-flex").click();
  });
});