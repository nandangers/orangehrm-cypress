/// <reference types="cypress" />

describe("API Automation - Platzi Fake Store (Categories)", () => {
  const BASE_URL = "https://api.escuelajs.co/api/v1/categories";
  let newCategoryId; // Variabel penampung ID untuk di-update dan dihapus nanti

  // ═══════════════════════════════════════════════════════════
  // TC-01 | GET All Categories
  // ═══════════════════════════════════════════════════════════
  it("TC-01 | Berhasil mengambil semua data kategori", () => {
    cy.request("GET", BASE_URL).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
      expect(response.body.length).to.be.greaterThan(0);
      // Validasi struktur data objek pertama
      expect(response.body[0]).to.have.property("id");
      expect(response.body[0]).to.have.property("name");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TC-02 | GET Single Category by ID
  // ═══════════════════════════════════════════════════════════
  it("TC-02 | Berhasil mengambil data satu kategori spesifik", () => {
    // Kita ambil ID 1 sebagai sampel
    cy.request("GET", `${BASE_URL}/1`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("id", 1);
      expect(response.body).to.have.property("name");
      expect(response.body).to.have.property("image");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TC-03 | POST - Create New Category
  // ═══════════════════════════════════════════════════════════
  it("TC-03 | Berhasil membuat kategori baru (Create)", () => {
    const payload = {
      name: "Gadget QA Baru",
      image: "https://placeimg.com/640/480/tech",
    };

    cy.request("POST", BASE_URL, payload).then((response) => {
      expect(response.status).to.eq(201); // 201 Created
      expect(response.body.name).to.eq(payload.name);
      expect(response.body.image).to.eq(payload.image);

      // Simpan ID yang baru terbuat ke variabel global untuk TC selanjutnya
      newCategoryId = response.body.id;
      cy.log("ID Kategori Baru: " + newCategoryId);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TC-04 | PUT - Update Category
  // ═══════════════════════════════════════════════════════════
  it("TC-04 | Berhasil mengubah data kategori (Update)", () => {
    const updatePayload = {
      name: "Gadget QA Terupdate",
    };

    cy.request("PUT", `${BASE_URL}/${newCategoryId}`, updatePayload).then(
      (response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq(updatePayload.name); // Nama harus berubah
        expect(response.body.id).to.eq(newCategoryId); // ID harus tetap sama
      },
    );
  });

  // ═══════════════════════════════════════════════════════════
  // TC-05 | DELETE - Remove Category
  // ═══════════════════════════════════════════════════════════
  it("TC-05 | Berhasil menghapus kategori (Delete)", () => {
    cy.request("DELETE", `${BASE_URL}/${newCategoryId}`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.eq("true"); // Platzi API mengembalikan boolean true jika sukses
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TC-06 | NEGATIVE GET - Category Not Found
  // ═══════════════════════════════════════════════════════════
  it("TC-06 | Gagal mencari kategori yang tidak ada/sudah dihapus", () => {
    // Parameter failOnStatusCode: false diperlukan agar Cypress tidak menganggap error 400/404 sebagai script failed
    cy.request({
      method: "GET",
      url: `${BASE_URL}/${newCategoryId}`, // ID ini sudah dihapus di TC-05
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400); // Platzi API mengembalikan 400 (Bad Request) untuk ID tak ditemukan
      expect(response.body.name).to.eq("EntityNotFoundError");
    });
  });

  // ═══════════════════════════════════════════════════════════
  // TC-07 | NEGATIVE POST - Missing Required Field
  // ═══════════════════════════════════════════════════════════
  it("TC-07 | Gagal membuat kategori tanpa atribut image", () => {
    const badPayload = {
      name: "Kategori Tanpa Gambar", // Sengaja tidak kasih 'image'
    };

    cy.request({
      method: "POST",
      url: BASE_URL,
      body: badPayload,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message)
        .to.be.an("array")
        .that.includes("image must be a URL address");
    });
  });
});
