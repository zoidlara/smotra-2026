window.VERZIJA = "2026-11-10g";   // promijeni kad zamijeniš slike, da preglednik učita nove
// =====================================================================
//  SMOTRA 2026 · 1. kat · POPIS ŠTANDOVA
//  Ovdje mijenjaš naziv i boju štanda. Slike panela idu u mapu
//  stands/NN/ (NN = broj štanda s dvije znamenke, npr. 00, 07, 12).
//
//  Imena slika (jpg ili png), po skici štanda 3 × 2 m:
//    01–06  velike ploče 950 mm   (lijevo straga 01, stražnji zid 02 03 04, desno 05 06)
//    07–08  uske ploče 455 mm     (lijevi zid, 07 uz ulaz iza pulta, 08 do nje)
//    09     pult, prednja strana
//    10     pult, bočna strana
//    11     natpis s nazivom (gore lijevo)
//    12     natpis s logom (gore desno)
//  Ako slike nema, ploča se oboji bojom iz "boja".
//
//  tip: "U8"   = 8 ploča po 950 mm u obliku slova U, bez pulta (Radio Kampus):
//                 01–02 lijevo (od ulaza prema natrag), 03–06 straga, 07–08 desno.
//  tip: "zid8" = ravni zid od 8 ploča po 950 mm (7,6 m), ploče 01–08 s lijeva na desno.
//  tip: "pult" = samostalni pult s frizom: 09 prednja, 10 lijeva bočna, 10d desna bočna, 12 friz.
//  tip: "2x2"  = partnerski štand 2 × 2 m: 01 lijevo, 02–03 straga, 04 desno, 11 natpis, 09 pult.
//  tip: "foto" = kutak za slikavanje: 01 pozadina 3 m, ispred nje kauč.
//  Štandovi 0–19 su na 1. katu, 20–27 u prizemlju (raspored je u layout.js).
// =====================================================================
window.STANDOVI = [
  { broj: 0,  naziv: "Radio Kampus",                                         boja: "#FF541E", bezPulta: true },
  { broj: 1,  naziv: "Kineziološki fakultet",                                boja: "#F03D1F" },
  { broj: 2,  naziv: "Pravni fakultet",                                      boja: "#F03D1F" },
  { broj: 3,  naziv: "Ekonomski fakultet",                                   boja: "#F03D1F" },
  { broj: 4,  naziv: "Filozofski fakultet",                                  boja: "#F03D1F" },
  { broj: 5,  naziv: "Katolički bogoslovni fakultet",                        boja: "#F03D1F" },
  { broj: 6,  naziv: "Komunikacija i mediji",                                boja: "#F03D1F" },
  { broj: 7,  naziv: "Hotelijerstvo i gastronomija",                         boja: "#F03D1F" },
  { broj: 8,  naziv: "Fakultet elektrotehnike, strojarstva i brodogradnje",  boja: "#295DB3" },
  { broj: 9,  naziv: "Pomorski fakultet",                                    boja: "#295DB3" },
  { broj: 10, naziv: "Fakultet građevinarstva, arhitekture i geodezije",     boja: "#295DB3" },
  { broj: 11, naziv: "Agromediteranski fakultet",                            boja: "#5590C8" },
  { broj: 12, naziv: "Fakultet znanosti o moru",                             boja: "#5590C8" },
  { broj: 13, naziv: "Prirodoslovno-matematički fakultet",                   boja: "#5590C8" },
  { broj: 14, naziv: "Kemijsko-tehnološki fakultet",                         boja: "#5590C8" },
  { broj: 15, naziv: "Medicinski fakultet",                                  boja: "#ABD4EA" },
  { broj: 16, naziv: "Fakultet zdravstvenih znanosti",                       boja: "#ABD4EA" },
  { broj: 17, naziv: "Sveučilišni odjel za stručne studije",                 boja: "#BFB290" },
  { broj: 18, naziv: "Fakultet za forenzične znanosti",                      boja: "#BFB290" },
  { broj: 19, naziv: "Umjetnička akademija (UMAS)",                          boja: "#F03BA6" },
  { broj: 20, naziv: "Sveučilište u Splitu · Službe Rektorata",              boja: "#0061AF", tip: "zid8" },
  // ----- PRIZEMLJE -----
  { broj: 21, naziv: "Sveučilišna knjižnica",                                boja: "#0061AF", tip: "pult" },
  { broj: 22, naziv: "Logopedija",                                           boja: "#7A8CA5", tip: "pult" },
  { broj: 23, naziv: "Gradivo",                                              boja: "#3D4A5C", tip: "pult" },
  { broj: 24, naziv: "Studentski centar (SC)",                               boja: "#E2001A" },
  { broj: 25, naziv: "OTP banka",                                            boja: "#52AE30", tip: "2x2" },
  { broj: 26, naziv: "Studentski zbor",                                      boja: "#0061AF" },
  { broj: 27, naziv: "Prostor za slikavanje",                                boja: "#FF541E", tip: "foto" },
];
