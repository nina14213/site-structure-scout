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
    descriptionFR: "Un identifiant pour l'événement d'échantillonnage",
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
    descriptionFR: "Un identifiant pour l'enregistrement d'occurrence",
    example: "urn:catalog:AMUNATCOLL:Mammals:12345",
    category: "core",
  },
  taxonID: {
    type: "foreignKey",
    required: false,
    description: "Identyfikator taksonu (linkuje do taxon.txt)",
    descriptionEN: "Identifier linking to taxon extension",
    descriptionDE: "Bezeichner zur Verknüpfung mit der Taxon-Erweiterung",
    descriptionFR: "Un identifiant pour l'ensemble d'informations taxonomiques",
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
    descriptionFR: "La latitude géographique en degrés décimaux du centre géographique d'un lieu",
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
    descriptionFR: "La longitude géographique en degrés décimaux du centre géographique d'un lieu",
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
    descriptionFR: "Le référentiel géodésique sur lequel sont basées les coordonnées géographiques",
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
    descriptionFR: "Le code standard du pays dans lequel le lieu se trouve (ISO 3166-1 alpha-2)",
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
    descriptionFR: "La distance horizontale par rapport aux coordonnées décimales données, décrivant le plus petit cercle contenant l'ensemble du lieu",
    example: "500",
    category: "location",
  },
  georeferenceRemarks: {
    type: "text",
    required: false,
    description: "Uwagi do georeferencji - tutaj wpisz ATPOL/UTM",
    descriptionEN: "Notes about georeferencing, including ATPOL/UTM grid references",
    descriptionDE: "Anmerkungen zur Georeferenzierung, einschließlich ATPOL/UTM-Gitterreferenzen",
    descriptionFR: "Notes ou commentaires sur la détermination des coordonnées géographiques",
    example: "System AtPol: FC39 | PL-UTM: GD00",
    category: "location",
  },
  locality: {
    type: "text",
    required: false,
    description: "Nazwa miejscowości lub lokalizacji",
    descriptionEN: "Specific locality name",
    descriptionDE: "Spezifischer Ortsname",
    descriptionFR: "La description spécifique du lieu",
    example: "Białowieża Forest, near Hajnówka",
    category: "location",
  },
  verbatimLocality: {
    type: "text",
    required: false,
    description: "Oryginalna lokalizacja w formacie tekstowym",
    descriptionEN: "Original locality description",
    descriptionDE: "Ursprüngliche Ortsbeschreibung",
    descriptionFR: "La description originale du lieu",
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
    descriptionFR: "La date ou l'intervalle de dates pendant lequel un événement s'est produit (ISO 8601)",
    example: "2025-01-15",
    category: "event",
  },
  parentEventID: {
    type: "foreignKey",
    required: false,
    description: "ID zdarzenia nadrzędnego (np. ekspedycji)",
    descriptionEN: "Identifier for parent event (e.g., expedition)",
    descriptionDE: "Bezeichner für das übergeordnete Ereignis (z. B. Expedition)",
    descriptionFR: "Un identifiant pour l'événement parent (p. ex. expédition)",
    example: "CB-1974/130",
    category: "event",
  },
  habitat: {
    type: "text",
    required: false,
    description: "Typ siedliska (łąki, lasy, bagna)",
    descriptionEN: "Habitat type description",
    descriptionDE: "Beschreibung des Habitattyps",
    descriptionFR: "Une catégorie ou une description de l'habitat dans lequel l'événement s'est produit",
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
    descriptionFR: "Les noms, références ou descriptions des méthodes d'échantillonnage utilisées",
    example: "UV light trap",
    category: "event",
  },
  recordedBy: {
    type: "text",
    required: false,
    description: "Osoby zbierające dane",
    descriptionEN: "Person(s) who recorded the occurrence",
    descriptionDE: "Person(en), die das Vorkommen erfasst haben",
    descriptionFR: "Une liste de noms de personnes ou de groupes responsables de l'enregistrement de l'occurrence",
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
    descriptionFR: "Un nombre ou une valeur d'énumération pour la quantité d'organismes",
    example: "1",
    category: "occurrence",
  },
  organismQuantityType: {
    type: "text",
    required: false,
    description: "Typ jednostki (np. individual)",
    descriptionEN: "Type of quantity unit",
    descriptionDE: "Art der Mengeneinheit",
    descriptionFR: "Le type de système de quantification utilisé pour la quantité d'organismes",
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
    descriptionFR: "Le nom scientifique complet, avec les informations d'auteur et de date si connues",
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
    descriptionFR: "Le nom scientifique complet du règne auquel le taxon appartient",
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
    descriptionFR: "La nature précise de l'enregistrement",
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
    descriptionFR: "Le nombre d'individus présents au moment de l'occurrence",
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
    descriptionFR: "Une liste d'identifiants de médias associés à l'occurrence",
    example: "https://example.org/image.jpg",
    category: "multimedia",
  },
  // Agent Terms
  agentID: {
    type: "coreID",
    required: true,
    unique: true,
    description: "Unikalny identyfikator agenta (osoby lub organizacji)",
    descriptionEN: "Unique identifier for the agent (person or organization)",
    descriptionDE: "Eindeutiger Bezeichner für den Agenten (Person oder Organisation)",
    descriptionFR: "Un identifiant unique pour l'agent (personne ou organisation)",
    example: "https://orcid.org/0000-0001-2345-6789",
    category: "agent",
  },
  agentType: {
    type: "controlled",
    required: false,
    allowedValues: ["Person", "Organization", "SoftwareAgent"],
    description: "Typ agenta",
    descriptionEN: "Type of the agent",
    descriptionDE: "Typ des Agenten",
    descriptionFR: "Le type d'agent",
    example: "Person",
    category: "agent",
  },
  preferredAgentName: {
    type: "text",
    required: false,
    description: "Preferowana nazwa agenta",
    descriptionEN: "Preferred name of the agent",
    descriptionDE: "Bevorzugter Name des Agenten",
    descriptionFR: "Le nom préféré de l'agent",
    example: "Jan Kowalski",
    category: "agent",
  },
};
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
