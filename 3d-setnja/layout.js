// =====================================================================
//  RASPORED: 1. KAT (prema skici "1. KAT") i PRIZEMLJE (dolje). Ne treba dirati.
//  Koordinate su u pikselima skice (1 m ≈ 17,7 px), x udesno, y prema dolje.
//  smjer = kamo je okrenut ulaz u štand: N gore, S dolje, E desno, W lijevo,
//  SE / SW dijagonalno.
// =====================================================================
window.RASPORED = {
  pxPoMetru: 17.7,
  visinaKata: 3.6,
  // obod hodnika (zidovi)
  obod: [[322,210],[322,830],[150,830],[150,885],[1170,885],[1170,830],[825,830],
         [825,434],[1110,434],[1110,380],[715,380],[660,436],[488,436],[432,380],[432,210]],
  atrij: [380,603,768,805],              // otvor prema prizemlju (ograda)
  blokovi: [[322,660,352,805],[795,660,825,805]],
  stupovi: [[489,547],[658,547]],
  standovi: {
    0:  { x: 574,   y: 453.7, smjer: "S"  },   // Radio Kampus, štand 3x2 bez pulta, uz amfiteatar
    1:  { x: 339.7, y: 348,   smjer: "E"  },
    2:  { x: 339.7, y: 401.5,   smjer: "E"  },
    3:  { x: 339.7, y: 500,   smjer: "E"  },
    4:  { x: 339.7, y: 553.5,   smjer: "E"  },
    5:  { x: 339.7, y: 607,   smjer: "E"  },
    6:  { x: 447.5, y: 420.5, smjer: "SW" },
    7:  { x: 456,   y: 573.5, smjer: "W"  },
    8:  { x: 700,   y: 420.5, smjer: "SE" },
    9:  { x: 807.3, y: 473.5, smjer: "W"  },
    10: { x: 807.3, y: 527, smjer: "W"  },
    11: { x: 688,   y: 573.5, smjer: "E"  },
    12: { x: 627.5,   y: 582.3, smjer: "N"  },
    13: { x: 574,   y: 582.3, smjer: "N"  },
    14: { x: 520.5,   y: 582.3, smjer: "N"  },
    15: { x: 419,   y: 867.3, smjer: "N"  },
    16: { x: 472.5,   y: 867.3, smjer: "N"  },
    17: { x: 592,   y: 867.3, smjer: "N"  },
    18: { x: 645.5,   y: 867.3, smjer: "N"  },
    19: { x: 766,   y: 867.3, smjer: "N"  },
  },
  // stubište iz prizemlja: široki krak do odmorišta, pa dva bočna kraka do 1. kata
  stubiste: { krak: [500, 661, 648, 721], odmoriste: [470, 678], vrh: [400, 748], pojas: [380, 603, 768, 661] },

  // ===================================================================
  //  PRIZEMLJE (prema tlocrtu ulaznog halla). Koordinate su u pikselima
  //  tog tlocrta (1 m ≈ 55,9 px); "poravnanje" je ista točka na oba tlocrta
  //  (sredina stubišta), pa se katovi točno poklapaju.
  // ===================================================================
  prizemlje: {
    pxPoMetru: 55.9,
    poravnanje: { gx: 857, gy: 503, x: 574, y: 773 },
    obod: [[55,150],[623,150],[1091,150],[1650,150],[1650,690],[1765,690],[1765,860],[1385,860],[1385,910],
           [1160,910],[1160,860],[1070,785],[640,785],[560,860],[560,910],[335,910],[335,860],[55,860]],
    otvor: 1,                              // rub [623,150]–[1091,150] je ulaz na stubište
    stupovi: [[590,503],[1124,503]],
    standovi: {
      20: { x: 118,  y: 467, smjer: "E" },  // Rektorat: ravni zid uz lijevi zid halla
      21: { x: 416,  y: 280, smjer: "S" },  // Sveučilišna knjižnica (pult)
      22: { x: 533,  y: 506, smjer: "S" },  // Logopedija (pult)
      23: { x: 1198, y: 502, smjer: "S" },  // Gradivo (pult)
      24: { x: 1591, y: 519, smjer: "W" },  // SC
      25: { x: 1591, y: 659, smjer: "W" },  // OTP (2 × 2 m)
      26: { x: 1288, y: 849, smjer: "N" },  // Studentski zbor
      27: { x: 425,  y: 880, smjer: "N" },  // Prostor za slikavanje
    },
    stol: { x: 218, y: 466, sirina: 0.65, dubina: 1.2 },   // stol ispred Rektorata
    polukrug: { x: 62, y: 467, r: 238 },                    // plavi polukrug ispred Rektorata
  },
  start: { kat: 0, x: 857, y: 735, gleda: "N" },           // na ulazu u prizemlje (koordinate prizemlja)
};
