// =====================================================================
//  RASPORED 1. KATA (prema skici "1. KAT"). Ne treba dirati.
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
    0:  { x: 574,   y: 453.7, smjer: "S"  },   // Radio Kampus, ravni zid 7,6 m uz amfiteatar
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
    20: { x: 232,   y: 867.3, smjer: "N"  },   // Sveučilište, ravni zid 7,6 m (položaj nije potvrđen)
  },
  start: { x: 575, y: 515, gleda: "N" },
};
