/**
 * @file officialDwCTerms.ts
 * @description Official Darwin Core terms from https://dwc.tdwg.org/terms/
 * Only terms listed on this page should be suggested to users.
 */

export const OFFICIAL_DWC_TERMS: readonly string[] = [
  // Record-level (dc/dcterms)
  'type', 'modified', 'language', 'license', 'rightsHolder', 'accessRights',
  'bibliographicCitation', 'references', 'feedbackURL',
  'institutionID', 'collectionID', 'datasetID',
  'institutionCode', 'collectionCode', 'datasetName', 'ownerInstitutionCode',
  'basisOfRecord', 'informationWithheld', 'dataGeneralizations', 'dynamicProperties',

  // Occurrence
  'occurrenceID', 'catalogNumber', 'recordNumber', 'recordedBy', 'recordedByID',
  'individualCount', 'organismQuantity', 'organismQuantityType',
  'sex', 'lifeStage', 'reproductiveCondition', 'caste', 'behavior', 'vitality',
  'establishmentMeans', 'degreeOfEstablishment', 'pathway',
  'georeferenceVerificationStatus', 'occurrenceStatus',
  'associatedMedia', 'associatedOccurrences', 'associatedReferences', 'associatedTaxa',
  'otherCatalogNumbers', 'occurrenceRemarks',

  // Organism
  'organismID', 'organismName', 'organismScope', 'associatedOrganisms', 'previousIdentifications',
  'organismRemarks',

  // MaterialEntity
  'materialEntityID', 'materialEntityType', 'materialEntityRemarks',
  'preparations', 'disposition', 'discipline',
  'associatedSequences', 'causeOfDeath', 'digitalSpecimenID',

  // MaterialSample
  'materialSampleID',

  // Event
  'eventID', 'parentEventID', 'eventDate', 'eventTime', 'eventType',
  'startDayOfYear', 'endDayOfYear', 'year', 'month', 'day',
  'verbatimEventDate', 'habitat',
  'samplingProtocol', 'sampleSizeValue', 'sampleSizeUnit', 'samplingEffort',
  'fieldNotes', 'fieldNumber', 'eventRemarks',
  'projectID', 'projectTitle', 'fundingAttributionID',

  // Location
  'locationID', 'higherGeographyID', 'higherGeography',
  'continent', 'waterBody', 'islandGroup', 'island',
  'country', 'countryCode', 'stateProvince', 'county', 'municipality',
  'locality', 'verbatimLocality',
  'minimumElevationInMeters', 'maximumElevationInMeters', 'verbatimElevation',
  'verticalDatum',
  'minimumDepthInMeters', 'maximumDepthInMeters', 'verbatimDepth',
  'minimumDistanceAboveSurfaceInMeters', 'maximumDistanceAboveSurfaceInMeters',
  'locationAccordingTo', 'locationRemarks',
  'decimalLatitude', 'decimalLongitude', 'geodeticDatum',
  'coordinateUncertaintyInMeters', 'coordinatePrecision',
  'pointRadiusSpatialFit',
  'verbatimCoordinates', 'verbatimLatitude', 'verbatimLongitude',
  'verbatimCoordinateSystem', 'verbatimSRS',
  'footprintWKT', 'footprintSRS', 'footprintSpatialFit',
  'georeferencedBy', 'georeferencedDate',
  'georeferenceProtocol', 'georeferenceSources', 'georeferenceRemarks',

  // GeologicalContext
  'geologicalContextID',
  'earliestEonOrLowestEonothem', 'latestEonOrHighestEonothem',
  'earliestEraOrLowestErathem', 'latestEraOrHighestErathem',
  'earliestPeriodOrLowestSystem', 'latestPeriodOrHighestSystem',
  'earliestEpochOrLowestSeries', 'latestEpochOrHighestSeries',
  'earliestAgeOrLowestStage', 'latestAgeOrHighestStage',
  'lowestBiostratigraphicZone', 'highestBiostratigraphicZone',
  'lithostratigraphicTerms', 'group', 'formation', 'member', 'bed',

  // Identification
  'identificationID', 'verbatimIdentification', 'identificationQualifier',
  'typeStatus', 'identifiedBy', 'identifiedByID', 'dateIdentified',
  'identificationReferences', 'identificationVerificationStatus', 'identificationRemarks',

  // Taxon
  'taxonID', 'scientificNameID', 'acceptedNameUsageID', 'parentNameUsageID',
  'originalNameUsageID', 'nameAccordingToID', 'namePublishedInID', 'taxonConceptID',
  'scientificName', 'acceptedNameUsage', 'parentNameUsage', 'originalNameUsage',
  'nameAccordingTo', 'namePublishedIn', 'namePublishedInYear',
  'higherClassification', 'kingdom', 'phylum', 'class', 'order', 'superfamily', 'family',
  'subfamily', 'tribe', 'subtribe', 'genus', 'genericName',
  'subgenus', 'infragenericEpithet',
  'specificEpithet', 'infraspecificEpithet', 'cultivarEpithet',
  'taxonRank', 'verbatimTaxonRank', 'scientificNameAuthorship',
  'vernacularName', 'nomenclaturalCode', 'taxonomicStatus', 'nomenclaturalStatus',
  'taxonRemarks',

  // MeasurementOrFact
  'measurementID', 'measurementType', 'measurementValue', 'measurementAccuracy',
  'measurementUnit', 'measurementDeterminedBy', 'measurementDeterminedDate',
  'measurementMethod', 'measurementRemarks',

  // ResourceRelationship
  'resourceRelationshipID', 'resourceID', 'relatedResourceID',
  'relationshipOfResource', 'relationshipOfResourceID',
  'relationshipAccordingTo', 'relationshipEstablishedDate', 'relationshipRemarks',
] as const;

/** Set for O(1) lookup */
export const OFFICIAL_DWC_TERMS_SET = new Set<string>(OFFICIAL_DWC_TERMS);
