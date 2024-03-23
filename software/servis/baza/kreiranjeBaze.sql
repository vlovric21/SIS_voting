BEGIN;
CREATE TABLE "Korisnik"(
  "idKorisnik" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "korime" VARCHAR(45),
  "lozinka" TEXT NOT NULL,
  "mail" VARCHAR(50),
  "aktivan" INTEGER DEFAULT 0,
  CONSTRAINT "korime_UNIQUE"
    UNIQUE("korime"),
  CONSTRAINT "mail_UNIQUE"
    UNIQUE("mail")
);
CREATE TABLE "Pitanje"(
  "idPitanje" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "pitanje" TEXT NOT NULL,
  "Korisnik_idKorisnik" INTEGER NOT NULL,
  CONSTRAINT "fk_Pitanje_Korisnik"
    FOREIGN KEY("Korisnik_idKorisnik")
    REFERENCES "Korisnik"("idKorisnik")
);
CREATE INDEX "Pitanje.fk_Pitanje_Korisnik_idx" ON "Pitanje" ("Korisnik_idKorisnik");
CREATE TABLE "Odabir"(
  "idOdabir" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "tekst" TEXT,
  "Pitanje_idPitanje" INTEGER NOT NULL,
  CONSTRAINT "fk_Odabir_Pitanje1"
    FOREIGN KEY("Pitanje_idPitanje")
    REFERENCES "Pitanje"("idPitanje")
);
CREATE INDEX "Odabir.fk_Odabir_Pitanje1_idx" ON "Odabir" ("Pitanje_idPitanje");
CREATE TABLE "Odgovorio"(
  "Korisnik_idKorisnik" INTEGER NOT NULL,
  "Odabir_idOdabir" INTEGER NOT NULL,
  PRIMARY KEY("Korisnik_idKorisnik","Odabir_idOdabir"),
  CONSTRAINT "fk_Korisnik_has_Odabir_Korisnik1"
    FOREIGN KEY("Korisnik_idKorisnik")
    REFERENCES "Korisnik"("idKorisnik"),
  CONSTRAINT "fk_Korisnik_has_Odabir_Odabir1"
    FOREIGN KEY("Odabir_idOdabir")
    REFERENCES "Odabir"("idOdabir")
);
CREATE INDEX "Odgovorio.fk_Korisnik_has_Odabir_Odabir1_idx" ON "Odgovorio" ("Odabir_idOdabir");
CREATE INDEX "Odgovorio.fk_Korisnik_has_Odabir_Korisnik1_idx" ON "Odgovorio" ("Korisnik_idKorisnik");
CREATE TABLE "Dnevnik"(
  "idDnevnik" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "idKorisnik" INTEGER,
  "idOdabir" INTEGER,
  "vrijeme" DATETIME
);
COMMIT;