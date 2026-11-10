# Smotra 2026 · 3D šetnja: prizemlje i 1. kat

Otvori `index.html` preko web poslužitelja (vidi dolje) i hodaj kroz oba kata. Kreće se na ulazu u prizemlje; stubištem u atriju se penje na 1. kat (široki krak do odmorišta, pa lijevi ili desni krak). Gumb „Idi na 1. kat / Idi u prizemlje” te odmah prebaci, a u pogledu odozgo bira koji se kat prikazuje.

- 1. kat: štandovi 0–19 (skica „1. KAT”).
- Prizemlje: 20 Rektorat (zid od 8 ploča), 21 Sveučilišna knjižnica (pult), 22 Logopedija (pult), 23 Gradivo (pult), 24 SC (3 × 2), 25 OTP (2 × 2), 26 Studentski zbor (3 × 2), 27 prostor za slikavanje (pozadina i kauč), prema tlocrtu ulaznog halla.

**Upravljanje**
- Računalo: klikni u prostor, kreći se s W A S D ili strelicama, mišem se okreći. Shift za brže, Esc za izlaz, M za pogled odozgo.
- Mobitel/tablet: lijevi krug za hodanje, povlačenje prsta za okretanje.
- Izbornik „Idi do štanda” i klik na mali tlocrt odmah te prebace.

## Kako ažurirati štand

1. Otvori mapu `stands/NN/` (NN je broj štanda s rasporeda, uvijek dvije znamenke: `00` je Radio Kampus, `12` Fakultet znanosti o moru …).
2. Ubaci ili zamijeni slike. Ime slike je broj ispune, a može biti `.jpg` ili `.png`:

| Ime | Što je | Mjera za tisak |
|---|---|---|
| `01` | lijevi zid, straga | 962 × 2355 |
| `02` `03` `04` | stražnji zid, s lijeva na desno | 962 × 2355 |
| `05` `06` | desni zid, straga pa naprijed | 962 × 2355 |
| `07` `08` | lijevi zid uz ulaz (07 je iza pulta) | 467 × 2355 |
| `09` | pult, prednja strana | 962 × 855 |
| `10` | pult, bočna strana | 467 × 855 |
| `11` | natpis s nazivom (gore lijevo) | 1952 × 335 |
| `12` | natpis s logom (gore desno) | 962 × 335 |

   Dovoljan je pregled oko 1000 px po dužoj strani (PNG ili JPG izvezen iz PDF-a). Ploča bez slike oboji se bojom štanda.
3. Naziv i boju štanda mijenjaš u `stands.js` (jedan redak po štandu).
4. Raspored (položaj i smjer štandova) je u `layout.js`: `standovi` za 1. kat i `prizemlje.standovi` za prizemlje (u pikselima tlocrta prizemlja). To ne treba dirati, osim ako se raspored promijeni.

## Pokretanje na Macu

Preglednik ne učitava slike u 3D kad se `index.html` otvori izravno dvoklikom, pa treba mali lokalni poslužitelj:

- dvoklik na **`pokreni.command`** (prvi put: desni klik → Open). Otvorit će se preglednik na http://localhost:8765.
- ili u Terminalu, u ovoj mapi: `python3 -m http.server 8765`, pa otvori http://localhost:8765.

Ako želiš ažurirati i javni link, javi Claudeu u istoj niti i on ponovno objavi mapu.

## Sadržaj (7. 11. 2026.)
- Gotovi štandovi sa zidnim pločama: 5 KBF (V4), 6 KiM (V1), 7 HiG (F2-val), 12 FZM, 14 KTF (V5), 15 MEF (M4), 17 SOSS (B, zadnja desna ploča 6 prazna), 19 UMAS (njihova priprema).
- HiG E1 i D: za zamjenu ubaci njihove ploče u `stands/07/` (izvor: `smotra-2026-split/stand-3x2/HIG-verzije/E1|D/paneli`).
- Ostale sastavnice: pult (09, 10) i natpis (11, 12) iz verzije C2, zidne ploče u boji područja.
- Štand 0, Radio Kampus: ravni zid od 8 ploča po 950 mm (7,6 m) uz zid amfiteatra, bez pulta i friza. Ploče su zasad u boji jer verzija još nije odabrana. Stare slike 3 × 2 su u `stands/00/_stari-3x2/`.
- Štand 20, Sveučilište u Splitu (Službe Rektorata): ravni zid od 8 ploča po 950 mm (7,6 m) uz lijevi zid prizemlja kod Rektorata, s verzijom Z1 „Razglednica”, stolom i plavim polukrugom kao na tlocrtu.
- Štand 21, Sveučilišna knjižnica: pult i friz iz `stand-knjiznica`, bočne strane verzija A (knjige u bojama). Za B ili C zamijeni `stands/21/10.jpg` (lijeva) i `10d.jpg` (desna).
- Štandovi 22–27 su zasad u boji s nazivom, dok ne stignu dizajni.
- Vrstu štanda biraš u `stands.js` poljem `tip`: bez njega je klasičan 3 × 2 m, `"U8"` je U od 8 ploča, `"zid8"` ravni zid od 8 ploča. Susjedni štandovi 3 × 2 m su razmaknuti 53,5 px (3 m), da se bočni zidovi ne preklapaju.
- Kad zamijeniš slike, promijeni `window.VERZIJA` na vrhu `stands.js`, da preglednik ne prikazuje stare.
- `lib/three.min.js` je biblioteka three.js r128 (MIT licenca), uključena da sve radi i bez interneta.
