// constants/carData.js
// Asphalt 8-style stat profiles — metric system — 7 cars across eras
// Each car includes engineSound (maps to useEngineSound key)
// and engineCharacter (flavour text displayed in the UI)

export const cars = [
  // ─────────────────────────────────────────
  // CLASSICS — 70s
  // ─────────────────────────────────────────
  {
    id:           "930-turbo",
    name:         "911 Turbo 3.3",
    model_code:   "930",
    year:         1977,
    era:          "70s",
    class:        "B",
    tagline:      "The Original Widowmaker",
    description:
      "The 930 Turbo terrified a generation. Sudden, savage turbo lag followed by a wall of boost that overwhelmed its rear-engine chassis — it demanded total respect or it took you off the road.",
    price:        "DM 65,880 (1977)",
    image:        "/images/cars/930-turbo.jpg",
    model:        "/models/930-turbo.glb",
    accentColor:  "#C8A96E",
    engineSound:      "flat-six-turbo",
    engineCharacter:  "Laggy turbo spool, then a savage boost surge that overwhelms the rear wheels",
    stats: {
      topSpeed:     { value: 260,   unit: "km/h"   },
      acceleration: { value: 5.4,   unit: "0–100s" },
      horsepower:   { value: 300,   unit: "hp"     },
      torque:       { value: 412,   unit: "Nm"     },
      weight:       { value: 1140,  unit: "kg"     },
      engine:       { value: "3.3L Turbocharged Flat-Six"         },
      drivetrain:   { value: "RWD"                                },
      transmission: { value: "4-spd Manual"                       },
    },
    colorOptions: [
      { name: "Silver Metallic", hex: "#9B9B9B" },
      { name: "Guards Red",      hex: "#D5001C" },
      { name: "Black",           hex: "#0A0A0A" },
      { name: "Minerva Blue",    hex: "#2B4570" },
      { name: "Copper Brown",    hex: "#7B4F35" },
    ],
  },

  // ─────────────────────────────────────────
  // CLASSICS — 80s
  // ─────────────────────────────────────────
  {
    id:           "959",
    name:         "959",
    model_code:   "959",
    year:         1987,
    era:          "80s",
    class:        "S",
    tagline:      "The Future Arrived in 1987",
    description:
      "The 959 was a decade ahead of everything on the road. AWD, twin-sequential turbos, ride-height control, hollow-spoke magnesium wheels — it was a supercomputer disguised as a supercar.",
    price:        "DM 420,000 (1987)",
    image:        "/images/cars/959.jpg",
    model:        "/models/959.glb",
    accentColor:  "#D5001C",
    engineSound:      "flat-six-turbo",
    engineCharacter:  "Twin-sequential turbos with two distinct boost waves — subtle at low RPM, explosive at high",
    stats: {
      topSpeed:     { value: 317,   unit: "km/h"   },
      acceleration: { value: 3.7,   unit: "0–100s" },
      horsepower:   { value: 450,   unit: "hp"     },
      torque:       { value: 500,   unit: "Nm"     },
      weight:       { value: 1450,  unit: "kg"     },
      engine:       { value: "2.85L Twin-Sequential Turbo Flat-Six" },
      drivetrain:   { value: "AWD"                                   },
      transmission: { value: "6-spd Manual"                          },
    },
    colorOptions: [
      { name: "Guards Red",       hex: "#D5001C" },
      { name: "Silver Metallic",  hex: "#9B9B9B" },
      { name: "Black",            hex: "#0A0A0A" },
      { name: "Slate Grey",       hex: "#4A4A4A" },
      { name: "Grand Prix White", hex: "#F5F5F5" },
    ],
  },

  // ─────────────────────────────────────────
  // CLASSICS — 90s
  // ─────────────────────────────────────────
  {
    id:           "993-gt2",
    name:         "911 GT2",
    model_code:   "993",
    year:         1995,
    era:          "90s",
    class:        "S",
    tagline:      "No Safety Net. No Compromises.",
    description:
      "The 993 GT2 stripped out the AWD, cranked the boost, and handed you the most ferocious 911 of its era. No traction control. No mercy. Just 430 horsepower through the rear wheels.",
    price:        "$175,000 (1995)",
    image:        "/images/cars/993-gt2.jpg",
    model:        "/models/993-gt2.glb",
    accentColor:  "#F5D000",
    engineSound:      "flat-six-turbo",
    engineCharacter:  "Raw twin-turbo flat-six with no traction control buffer — every throttle input is a conversation with physics",
    stats: {
      topSpeed:     { value: 295,   unit: "km/h"   },
      acceleration: { value: 3.9,   unit: "0–100s" },
      horsepower:   { value: 430,   unit: "hp"     },
      torque:       { value: 580,   unit: "Nm"     },
      weight:       { value: 1295,  unit: "kg"     },
      engine:       { value: "3.6L Twin-Turbo Flat-Six" },
      drivetrain:   { value: "RWD"                      },
      transmission: { value: "6-spd Manual"              },
    },
    colorOptions: [
      { name: "Racing Yellow",    hex: "#F5D000" },
      { name: "Grand Prix White", hex: "#F5F5F5" },
      { name: "Black",            hex: "#0A0A0A" },
      { name: "Guards Red",       hex: "#D5001C" },
      { name: "Arctic Silver",    hex: "#C0C0C0" },
    ],
  },

  {
    id:           "911-gt1-97",
    name:         "911 GT1",
    model_code:   "996 GT1",
    year:         1997,
    era:          "90s",
    class:        "S",
    tagline:      "Le Mans Came Home",
    description:
      "Built for one purpose: to win Le Mans. Porsche homologated just 25 road-legal GT1s. Mid-engine, twin-turbo, carbon-bodied — it is the rarest and most extreme 911 ever to wear a number plate.",
    price:        "$1,500,000 (1997)",
    image:        "/images/cars/911-gt1-97.jpg",
    model:        "/models/911-gt1-97.glb",
    accentColor:  "#FFFFFF",
    engineSound:      "flat-six-turbo",
    engineCharacter:  "Le Mans-spec twin-turbo six — built to sustain 330 km/h for 24 hours straight",
    stats: {
      topSpeed:     { value: 330,   unit: "km/h"   },
      acceleration: { value: 3.4,   unit: "0–100s" },
      horsepower:   { value: 544,   unit: "hp"     },
      torque:       { value: 650,   unit: "Nm"     },
      weight:       { value: 1050,  unit: "kg"     },
      engine:       { value: "3.2L Twin-Turbo Flat-Six (Mid-Mount)" },
      drivetrain:   { value: "RWD"                                   },
      transmission: { value: "6-spd Sequential"                      },
    },
    colorOptions: [
      { name: "Pearl White", hex: "#F5F5F0" },
      { name: "Silver",      hex: "#9B9B9B" },
      { name: "Black",       hex: "#0A0A0A" },
    ],
  },

  // ─────────────────────────────────────────
  // MODERN — 2000s
  // ─────────────────────────────────────────
  {
    id:           "carrera-gt",
    name:         "Carrera GT",
    model_code:   "980",
    year:         2004,
    era:          "2000s",
    class:        "S",
    tagline:      "The Last of the Pure Ones",
    description:
      "A naturally aspirated V10 from a Le Mans prototype, a carbon ceramic clutch the size of a CD, and zero driver aids. The Carrera GT is the most visceral, unfiltered supercar Porsche has ever built.",
    price:        "$440,000 (2004)",
    image:        "/images/cars/carrera-gt.jpg",
    model:        "/models/carrera-gt.glb",
    accentColor:  "#D5001C",
    engineSound:      "v10-na",
    engineCharacter:  "5.7L V10 screaming to 8,000 RPM — an operatic, spine-tingling note found nowhere else on earth",
    stats: {
      topSpeed:     { value: 330,   unit: "km/h"   },
      acceleration: { value: 3.5,   unit: "0–100s" },
      horsepower:   { value: 612,   unit: "hp"     },
      torque:       { value: 590,   unit: "Nm"     },
      weight:       { value: 1380,  unit: "kg"     },
      engine:       { value: "5.7L Naturally Aspirated V10" },
      drivetrain:   { value: "RWD"                          },
      transmission: { value: "6-spd Manual"                 },
    },
    colorOptions: [
      { name: "Fayence Yellow",   hex: "#C8A028" },
      { name: "Guards Red",       hex: "#D5001C" },
      { name: "Basalt Black",     hex: "#1A1A1A" },
      { name: "Seal Grey",        hex: "#6B6B6B" },
      { name: "Grand Prix White", hex: "#F5F5F5" },
    ],
  },

  // ─────────────────────────────────────────
  // MODERN — 2020s
  // ─────────────────────────────────────────
  {
    id:           "911-gt3-992",
    name:         "911 GT3",
    model_code:   "992",
    year:         2022,
    era:          "2020s",
    class:        "S",
    tagline:      "Born on the Racetrack",
    description:
      "Nine thousand RPM. Naturally aspirated. Swan-neck rear wing. The 992 GT3 is the most connected, most alive 911 road car money can buy — and it will embarrass purpose-built track cars at the Nürburgring.",
    price:        "$161,100 (2022)",
    image:        "/images/cars/911-gt3-992.jpg",
    model:        "/models/911-gt3-992.glb",
    accentColor:  "#D5001C",
    engineSound:      "flat-six-na",
    engineCharacter:  "Naturally aspirated flat-six with a 9,000 RPM ceiling — a pure mechanical howl that builds linearly to a screaming crescendo",
    stats: {
      topSpeed:     { value: 318,   unit: "km/h"   },
      acceleration: { value: 3.4,   unit: "0–100s" },
      horsepower:   { value: 510,   unit: "hp"     },
      torque:       { value: 470,   unit: "Nm"     },
      weight:       { value: 1418,  unit: "kg"     },
      engine:       { value: "4.0L Naturally Aspirated Flat-Six" },
      drivetrain:   { value: "RWD"                               },
      transmission: { value: "7-spd PDK / 6-spd Manual"          },
    },
    colorOptions: [
      { name: "Guards Red",    hex: "#D5001C" },
      { name: "GT Silver",     hex: "#9B9B9B" },
      { name: "Jet Black",     hex: "#0A0A0A" },
      { name: "Racing Yellow", hex: "#F5D000" },
      { name: "Shark Blue",    hex: "#1C3F6E" },
    ],
  },

  {
    id:           "taycan-turbo-s",
    name:         "Taycan Turbo S",
    model_code:   "J1",
    year:         2021,
    era:          "2020s",
    class:        "S",
    tagline:      "Electric. Instant. Relentless.",
    description:
      "560 kilowatts. 1,050 Nm. Available the instant you ask for it. The Taycan Turbo S dismantles everything you thought you knew about what an electric car should feel like.",
    price:        "$185,000 (2021)",
    image:        "/images/cars/taycan-turbo-s.jpg",
    model:        "/models/taycan-turbo-s.glb",
    accentColor:  "#C8A96E",
    engineSound:      "electric-motor",
    engineCharacter:  "Instant 1,050 Nm with a rising electric whine — no lag, no buildup, just immediate and total force",
    stats: {
      topSpeed:     { value: 260,   unit: "km/h"   },
      acceleration: { value: 2.8,   unit: "0–100s" },
      horsepower:   { value: 761,   unit: "hp"     },
      torque:       { value: 1050,  unit: "Nm"     },
      weight:       { value: 2295,  unit: "kg"     },
      engine:       { value: "Dual Electric Motors (800V Architecture)" },
      drivetrain:   { value: "AWD"                                       },
      transmission: { value: "2-spd PDK (rear axle)"                     },
    },
    colorOptions: [
      { name: "Frozen Blue",  hex: "#5B8FA8" },
      { name: "Gentian Blue", hex: "#1C3F6E" },
      { name: "Carrara White",hex: "#F0EDE8" },
      { name: "Volcano Grey", hex: "#4A4A4A" },
      { name: "Night Blue",   hex: "#1A1F3C" },
    ],
  },
];

// ─────────────────────────────────────────
// ERA + CLASS METADATA
// ─────────────────────────────────────────

export const eras = ["70s", "80s", "90s", "2000s", "2020s"];

export const classLabels = {
  S: { label: "Class S", description: "Hypercar tier — the absolute pinnacle"   },
  A: { label: "Class A", description: "High performance — track-ready machines" },
  B: { label: "Class B", description: "Sport — iconic and thrilling"            },
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

export const getCarById  = (id)  => cars.find((car) => car.id === id);
export const getCarsByEra = (era) => cars.filter((car) => car.era === era);

// Featured car shown in Hero
export const featuredCar = cars[5]; // 992 GT3