// Darwin Core Terms - kompletna baza terminów GBIF
export interface DwCTerm {
  type: string;
  required?: boolean;
  unique?: boolean;
  description: string;
  descriptionEN?: string;
  descriptionDE?: string;
  descriptionFR?: string;
  example: string;
  category: string;
  range?: [number, number];
  format?: string;
  allowedValues?: string[];
  defaultValue?: string;
  habitatTranslations?: Record<string, string>;
}

export const dwcTerms: Record<string, DwCTerm> = {
  // Core ID Terms
  eventID: {
    type: "coreID",
    required: true,
    unique: true,
    description: "Unikalny identyfikator zdarzenia zbierania danych",
    descriptionEN: "Unique identifier for the sampling event",
    descriptionDE: "Eindeutiger Bezeichner für das Erfassungsereignis",
    descriptionFR: "Identifiant unique de l'événement d'échantillonnage",
    example: "NHC-00001",
    category: "core",
  },
  occurrenceID: {
    type: "coreID",
    required: true,
    unique: true,
    description: "Unikalny identyfikator obserwacji/okazu",
    descriptionEN: "Unique identifier for the occurrence record",
    descriptionDE: "Eindeutiger Bezeichner für den Vorkommensdatensatz",
    descriptionFR: "Identifiant unique de l'enregistrement d'occurrence",
    example: "urn:catalog:AMUNATCOLL:Mammals:12345",
    category: "core",
  },
  taxonID: {
    type: "foreignKey",
    required: false,
    description: "Identyfikator taksonu (linkuje do taxon.txt)",
    descriptionEN: "Identifier linking to taxon extension",
    descriptionDE: "Bezeichner zur Verknüpfung mit der Taxon-Erweiterung",
    descriptionFR: "Identifiant liant à l'extension taxon",
    example: "urn:lsid:catalogueoflife.org:taxon:d79c11aa",
    category: "extension",
  },

  // Location Terms
  decimalLatitude: {
    type: "coordinate",
    required: true,
    range: [-90, 90],
    format: "decimal",
    description: "Szerokość geograficzna w stopniach dziesiętnych",
    descriptionEN: "Geographic latitude in decimal degrees",
    descriptionDE: "Geographische Breite in Dezimalgrad",
    descriptionFR: "Latitude géographique en degrés décimaux",
    example: "52.31611111",
    category: "location",
  },
  decimalLongitude: {
    type: "coordinate",
    required: true,
    range: [-180, 180],
    format: "decimal",
    description: "Długość geograficzna w stopniach dziesiętnych",
    descriptionEN: "Geographic longitude in decimal degrees",
    descriptionDE: "Geographische Länge in Dezimalgrad",
    descriptionFR: "Longitude géographique en degrés décimaux",
    example: "23.05388888",
    category: "location",
  },
  geodeticDatum: {
    type: "controlled",
    required: true,
    allowedValues: ["WGS84", "EPSG:4326", "NAD83", "NAD27"],
    defaultValue: "WGS84",
    description: "Układ odniesienia współrzędnych (zawsze WGS84 dla GBIF)",
    descriptionEN: "Geodetic datum for coordinates (always WGS84 for GBIF)",
    descriptionDE: "Geodätisches Datum für Koordinaten (immer WGS84 für GBIF)",
    descriptionFR: "Système géodésique des coordonnées (toujours WGS84 pour GBIF)",
    example: "WGS84",
    category: "location",
  },
  countryCode: {
    type: "controlled",
    required: true,
    format: "iso2-country",
    description: "Kod kraju ISO 3166-1 alpha-2",
    descriptionEN: "ISO 3166-1 alpha-2 country code",
    descriptionDE: "ISO 3166-1 Alpha-2-Ländercode",
    descriptionFR: "Code pays ISO 3166-1 alpha-2",
    example: "PL",
    category: "location",
  },
  coordinateUncertaintyInMeters: {
    type: "decimal",
    required: false,
    range: [0, 10000000],
    description: "Niepewność współrzędnych w metrach (dla UTM/ATPOL typowo 500-1000m)",
    descriptionEN: "Uncertainty of coordinates in meters",
    descriptionDE: "Unsicherheit der Koordinaten in Metern",
    descriptionFR: "Incertitude des coordonnées en mètres",
    example: "500",
    category: "location",
  },
  georeferenceRemarks: {
    type: "text",
    required: false,
    description: "Uwagi do georeferencji - tutaj wpisz ATPOL/UTM",
    descriptionEN: "Notes about georeferencing, including ATPOL/UTM grid references",
    descriptionDE: "Anmerkungen zur Georeferenzierung, einschließlich ATPOL/UTM-Gitterreferenzen",
    descriptionFR: "Notes sur le géoréférencement, y compris les références de grille ATPOL/UTM",
    example: "System AtPol: FC39 | PL-UTM: GD00",
    category: "location",
  },
  locality: {
    type: "text",
    required: false,
    description: "Nazwa miejscowości lub lokalizacji",
    descriptionEN: "Specific locality name",
    descriptionDE: "Spezifischer Ortsname",
    descriptionFR: "Nom de localité spécifique",
    example: "Białowieża Forest, near Hajnówka",
    category: "location",
  },
  verbatimLocality: {
    type: "text",
    required: false,
    description: "Oryginalna lokalizacja w formacie tekstowym",
    descriptionEN: "Original locality description",
    descriptionDE: "Ursprüngliche Ortsbeschreibung",
    descriptionFR: "Description originale de la localité",
    example: "Dębina municipal forest in Poznań, Poland",
    category: "location",
  },

  // Event Terms
  eventDate: {
    type: "date",
    required: true,
    format: "iso-date",
    description: "Data zdarzenia w formacie ISO 8601",
    descriptionEN: "Date of the event in ISO 8601 format",
    descriptionDE: "Datum des Ereignisses im ISO 8601-Format",
    descriptionFR: "Date de l'événement au format ISO 8601",
    example: "2025-01-15",
    category: "event",
  },
  parentEventID: {
    type: "foreignKey",
    required: false,
    description: "ID zdarzenia nadrzędnego (np. ekspedycji)",
    descriptionEN: "Identifier for parent event (e.g., expedition)",
    descriptionDE: "Bezeichner für das übergeordnete Ereignis (z. B. Expedition)",
    descriptionFR: "Identifiant de l'événement parent (ex. expédition)",
    example: "CB-1974/130",
    category: "event",
  },
  habitat: {
    type: "text",
    required: false,
    description: "Typ siedliska (łąki, lasy, bagna)",
    descriptionEN: "Habitat type description",
    descriptionDE: "Beschreibung des Habitattyps",
    descriptionFR: "Description du type d'habitat",
    example: "Łąki | Olszyny",
    habitatTranslations: {
      Łąki: "Meadows",
      Olszyny: "Alder forests",
      Bagna: "Wetlands",
      "Lasy iglaste": "Coniferous forests",
      "Lasy liściaste": "Deciduous forests",
      Torfowiska: "Peatlands",
      Wydmy: "Sand dunes",
      "Brzegi rzek": "River banks",
    },
    category: "event",
  },
  samplingProtocol: {
    type: "text",
    required: false,
    description: "Metoda zbierania danych",
    descriptionEN: "Sampling methodology used",
    descriptionDE: "Verwendete Erfassungsmethode",
    descriptionFR: "Méthode d'échantillonnage utilisée",
    example: "UV light trap",
    category: "event",
  },
  recordedBy: {
    type: "text",
    required: false,
    description: "Osoby zbierające dane",
    descriptionEN: "Person(s) who recorded the occurrence",
    descriptionDE: "Person(en), die das Vorkommen erfasst haben",
    descriptionFR: "Personne(s) ayant enregistré l'occurrence",
    example: "K. Słupecka",
    category: "event",
  },
  organismQuantity: {
    type: "integer",
    required: false,
    range: [0, 1000000],
    description: "Liczba organizmów",
    descriptionEN: "Quantity of organisms",
    descriptionDE: "Anzahl der Organismen",
    descriptionFR: "Quantité d'organismes",
    example: "1",
    category: "occurrence",
  },
  organismQuantityType: {
    type: "text",
    required: false,
    description: "Typ jednostki (np. individual)",
    descriptionEN: "Type of quantity unit",
    descriptionDE: "Art der Mengeneinheit",
    descriptionFR: "Type d'unité de quantité",
    example: "individual",
    category: "occurrence",
  },

  // Taxon Terms
  scientificName: {
    type: "text",
    required: true,
    description: "Pełna nazwa naukowa z autorem",
    descriptionEN: "Full scientific name with authorship",
    descriptionDE: "Vollständiger wissenschaftlicher Name mit Autorenschaft",
    descriptionFR: "Nom scientifique complet avec l'auteur",
    example: "Quercus robur L.",
    category: "taxon",
  },
  kingdom: {
    type: "controlled",
    required: false,
    allowedValues: ["Animalia", "Plantae", "Fungi", "Bacteria", "Archaea", "Protozoa", "Chromista"],
    description: "Królestwo taksonomiczne",
    descriptionEN: "Taxonomic kingdom",
    descriptionDE: "Taxonomisches Reich",
    descriptionFR: "Règne taxonomique",
    example: "Plantae",
    category: "taxon",
  },

  // Occurrence Terms
  basisOfRecord: {
    type: "controlled",
    required: true,
    allowedValues: [
      "PreservedSpecimen",
      "HumanObservation",
      "MachineObservation",
      "LivingSpecimen",
      "FossilSpecimen",
      "MaterialSample",
    ],
    description: "Podstawa rekordu - typ dowodu",
    descriptionEN: "Basis of the occurrence record",
    descriptionDE: "Grundlage des Vorkommensdatensatzes",
    descriptionFR: "Base de l'enregistrement d'occurrence",
    example: "PreservedSpecimen",
    category: "occurrence",
  },
  individualCount: {
    type: "integer",
    required: false,
    range: [0, 1000000],
    description: "Liczba osobników",
    descriptionEN: "Number of individuals",
    descriptionDE: "Anzahl der Individuen",
    descriptionFR: "Nombre d'individus",
    example: "5",
    category: "occurrence",
  },

  // Multimedia Terms
  associatedMedia: {
    type: "uri",
    required: false,
    description: "URL do zdjęć/filmów",
    descriptionEN: "URL to associated media files",
    descriptionDE: "URL zu verknüpften Mediendateien",
    descriptionFR: "URL vers les fichiers médias associés",
    example: "https://example.org/image.jpg",
    category: "multimedia",
  },
};

// Kategorie terminów
export const termCategories: Record<string, { name: Record<string, string>; icon: string; color: string }> = {
  core: { name: { pl: "Core IDs", en: "Core IDs", fr: "IDs principaux", de: "Core-IDs" }, icon: "Key", color: "#22d3ee" },
  location: { name: { pl: "Lokalizacja", en: "Location", fr: "Localisation", de: "Standort" }, icon: "MapPin", color: "#22c55e" },
  event: { name: { pl: "Zdarzenie", en: "Event", fr: "Événement", de: "Ereignis" }, icon: "Calendar", color: "#a855f7" },
  taxon: { name: { pl: "Takson", en: "Taxon", fr: "Taxon", de: "Taxon" }, icon: "Leaf", color: "#f59e0b" },
  occurrence: { name: { pl: "Obserwacja", en: "Occurrence", fr: "Occurrence", de: "Vorkommen" }, icon: "Eye", color: "#3b82f6" },
  multimedia: { name: { pl: "Multimedia", en: "Multimedia", fr: "Multimédia", de: "Multimedia" }, icon: "Image", color: "#ec4899" },
  extension: { name: { pl: "Rozszerzenia", en: "Extensions", fr: "Extensions", de: "Erweiterungen" }, icon: "Link", color: "#6366f1" },
};

// Reguły walidacji GBIF
export const validationRules = [
  { field: "eventID", required: true, unique: true, format: null },
  { field: "occurrenceID", required: true, unique: true, format: null },
  { field: "decimalLatitude", required: true, unique: false, format: "decimal", range: [-90, 90] },
  { field: "decimalLongitude", required: true, unique: false, format: "decimal", range: [-180, 180] },
  { field: "geodeticDatum", required: true, unique: false, value: "WGS84" },
  { field: "countryCode", required: true, unique: false, format: "iso2-country" },
  { field: "eventDate", required: true, unique: false, format: "iso-date" },
  { field: "basisOfRecord", required: true, unique: false, format: "controlled" },
  { field: "scientificName", required: true, unique: false, format: null },
];

// Sample data CSV
export const sampleEventsCSV = `Project_Name,Id,Specimen,Author,Collection_date,Quantity,Quantity_unit,Location,Latitude,Longitude,Coordinate_system,Settlement
Invasive species,3431,Acer negundo,K. Słupecka,15-05-2025,1,individual,"Dębina municipal forest in Poznań, Poland",52.369327,16.925402,WGS84,Forest near railroad
Invasive species,6405,Solidago canadensis,M. Kowalski,17-06-2025,5,individual,"Marii Skłodowskiej-Curie Park, Poznań, Poland",52.3935228,16.918701,WGS84,Park`;

// ISO Country Codes (wybrane)
export const isoCodes = [
  "PL",
  "DE",
  "CZ",
  "SK",
  "UA",
  "BY",
  "LT",
  "RU",
  "SE",
  "NO",
  "FI",
  "DK",
  "GB",
  "FR",
  "ES",
  "IT",
  "AT",
  "CH",
  "NL",
  "BE",
  "US",
  "CA",
  "AU",
  "BR",
];

export default dwcTerms;
