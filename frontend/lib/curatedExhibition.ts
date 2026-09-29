export interface ExhibitionItem {
  id: string;
  index: string;
  titleTop: string;
  titleBottom: string;
  fullTitle: string;
  imageUrl: string;
  year: string;
  type: string;
  roleOrGear: string;
  clientOrArtist: string;
  description: string;
  source: "google_drive" | "curated";
}

export const CURATED_EXHIBITION: ExhibitionItem[] = [
  {
    id: "gucci-01",
    index: "01",
    titleTop: "HOUSE   OF",
    titleBottom: "G U C C I",
    fullTitle: "HOUSE OF GUCCI",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85",
    year: "FEBRUARY 2022",
    type: "PROMOTIONAL",
    roleOrGear: "LEICA M11 · 35MM F/1.4",
    clientOrArtist: "MGM STUDIOS - WATSON DG",
    description: "EXPLORE BEHIND-THE-SCENES THE MAKING OF RIDLEY SCOTT'S HOUSE OF GUCCI.",
    source: "curated",
  },
  {
    id: "silk-02",
    index: "02",
    titleTop: "SILK   &",
    titleBottom: "S H A D O W",
    fullTitle: "SILK & SHADOW",
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85",
    year: "OCTOBER 2023",
    type: "HAUTE COUTURE",
    roleOrGear: "HASSELBLAD X2D · 55MM",
    clientOrArtist: "ATELIER LUMIÈRE",
    description: "STUDY OF SCULPTURAL FABRIC AND FLUID TEXTILES IN CONTROLLED MONOCHROMATIC LIGHT.",
    source: "curated",
  },
  {
    id: "brioni-03",
    index: "03",
    titleTop: "B R I O N I",
    titleBottom: "N O C T U R N E",
    fullTitle: "BRIONI NOCTURNE",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=85",
    year: "JANUARY 2024",
    type: "PORTRAITURE",
    roleOrGear: "SONY A7R V · 85MM F/1.2",
    clientOrArtist: "BRIONI S.P.A.",
    description: "RAW CINEMATIC TONALITY OF ITALIAN SARTORIAL HERITAGE IN HIGH CONTRAST.",
    source: "curated",
  },
  {
    id: "arch-04",
    index: "04",
    titleTop: "V O I D   &",
    titleBottom: "F O R M",
    fullTitle: "VOID & FORM",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=85",
    year: "NOVEMBER 2023",
    type: "BRUTALISM",
    roleOrGear: "FUJIFILM GFX 100 II · 23MM",
    clientOrArtist: "ARCHIVE MONOLITH",
    description: "GEOMETRIC CONVERGENCE AND SHADOW PLAY CAPTURED ACROSS REINFORCED CONCRETE FACADES.",
    source: "curated",
  },
  {
    id: "venice-05",
    index: "05",
    titleTop: "S O L I T U D E",
    titleBottom: "V E N E T I A",
    fullTitle: "SOLITUDE VENETIA",
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=85",
    year: "APRIL 2023",
    type: "DOCUMENTARY",
    roleOrGear: "LEICA Q3 · 28MM F/1.7",
    clientOrArtist: "EUROPEAN CULTURAL ARCHIVE",
    description: "A MEDITATIVE EXPLORATION OF THE VENETIAN LAGOON AT DAWN IN MUTE SILENCE.",
    source: "curated",
  },
  {
    id: "meurice-06",
    index: "06",
    titleTop: "L E",
    titleBottom: "M E U R I C E",
    fullTitle: "LE MEURICE",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1400&q=85",
    year: "SEPTEMBER 2023",
    type: "EDITORIAL",
    roleOrGear: "CANON R5 C · 50MM F/1.2",
    clientOrArtist: "DORCHESTER COLLECTION",
    description: "CONTEMPORARY INTERPRETATION OF 19TH CENTURY FRENCH HOSPITALITY AND OPULENCE.",
    source: "curated",
  },
  {
    id: "grain-07",
    index: "07",
    titleTop: "A N A L O G",
    titleBottom: "R E S I D U E",
    fullTitle: "ANALOG RESIDUE",
    imageUrl: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=1400&q=85",
    year: "DECEMBER 2023",
    type: "FINE ART",
    roleOrGear: "PENTAX 67 · 105MM F/2.4",
    clientOrArtist: "KODAK TRI-X 400 STUDY",
    description: "SILVER HALIDE GRAIN AND HIGH-DYNAMIC-RANGE CHIAROSCURO ON MEDIUM FORMAT FILM.",
    source: "curated",
  },
  {
    id: "spinnaker-08",
    index: "08",
    titleTop: "S P I N N A K E R",
    titleBottom: "H O R I Z O N",
    fullTitle: "SPINNAKER HORIZON",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    year: "AUGUST 2024",
    type: "EXPEDITION",
    roleOrGear: "NIKON Z8 · 70-200MM F/2.8",
    clientOrArtist: "OFFSHORE COLLECTIVE",
    description: "TRANSIENT SEA CRESTS AND LOW OVERCAST SKIES RECORDED IN THE NORTH SEA.",
    source: "curated",
  },
];
