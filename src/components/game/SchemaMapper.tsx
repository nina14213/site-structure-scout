import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SchemaMapperTutorial from "./SchemaMapperTutorial";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Users,
  Target,
  Calendar,
  Image,
  Search as SearchIcon,
  Grid3X3,
  RotateCcw,
  Check,
  X,
  Download,
  MousePointerClick,
  Eye,
  CalendarClock,
  ChevronDown,
  Layers,
  Minimize2,
} from "lucide-react";
import { dwcTerms } from "./DwCTerms";
import { useLanguage } from "@/i18n/LanguageContext";
import AutoMatchDialog, { findAutoMatches, normalizeHeader, termAliases } from "./AutoMatchDialog";
import JSZip from "jszip";
import IdGeneratorDialog, { generateAllIds, type IdFieldConfig } from "./IdGeneratorDialog";

// Find best matching column for a DwC term — exact normalized match or alias only
function findBestColumnMatch(term: string, columns: string[], usedColumns?: Set<string>): string | undefined {
  const termNorm = normalizeHeader(term);
  const available = usedColumns 
    ? columns.filter(c => !usedColumns.has(c))
    : columns;
  
  // Tier 1: Exact normalized match
  const exact = available.find(c => normalizeHeader(c) === termNorm);
  if (exact) return exact;
  
  // Tier 2: Alias match (exact alias only)
  const aliases = termAliases[term];
  if (aliases) {
    const aliasMatch = available.find(c => aliases.some(a => normalizeHeader(a) === normalizeHeader(c)));
    if (aliasMatch) return aliasMatch;
  }
  
  return undefined;
}

// Darwin Core Data Package schema types based on https://gbif.github.io/dwc-dp/qrg/
const schemaTypes = [
  { id: "event", name: "Event", icon: Grid3X3, color: "bg-purple-600" },
  { id: "occurrence", name: "Occurrence", icon: Target, color: "bg-rose-600" },
  { id: "occurrence-agent-role", name: "Occurrence Agent Role", icon: Users, color: "bg-rose-500" },
  { id: "occurrence-assertion", name: "Occurrence Assertion", icon: FileText, color: "bg-rose-400" },
  { id: "occurrence-identifier", name: "Occurrence Identifier", icon: FileText, color: "bg-rose-300" },
  { id: "occurrence-media", name: "Occurrence Media", icon: Image, color: "bg-rose-200" },
  { id: "occurrence-protocol", name: "Occurrence Protocol", icon: FileText, color: "bg-rose-100" },
  { id: "occurrence-reference", name: "Occurrence Reference", icon: FileText, color: "bg-pink-600" },
  { id: "organism", name: "Organism", icon: Users, color: "bg-emerald-600" },
  { id: "organism-assertion", name: "Organism Assertion", icon: FileText, color: "bg-emerald-500" },
  { id: "organism-identifier", name: "Organism Identifier", icon: FileText, color: "bg-emerald-400" },
  { id: "organism-interaction", name: "Organism Interaction", icon: Users, color: "bg-emerald-300" },
  { id: "organism-interaction-agent-role", name: "Org. Interaction Agent Role", icon: Users, color: "bg-emerald-200" },
  { id: "organism-interaction-assertion", name: "Org. Interaction Assertion", icon: FileText, color: "bg-emerald-100" },
  { id: "material", name: "Material Entity", icon: Calendar, color: "bg-amber-600" },
  { id: "material-agent-role", name: "Material Agent Role", icon: Users, color: "bg-amber-500" },
  { id: "material-assertion", name: "Material Assertion", icon: FileText, color: "bg-amber-400" },
  { id: "material-identifier", name: "Material Identifier", icon: FileText, color: "bg-amber-300" },
  { id: "material-geological-context", name: "Material Geological Context", icon: Grid3X3, color: "bg-amber-200" },
  { id: "material-media", name: "Material Media", icon: Image, color: "bg-amber-100" },
  { id: "material-protocol", name: "Material Protocol", icon: FileText, color: "bg-yellow-600" },
  { id: "material-provenance", name: "Material Provenance", icon: FileText, color: "bg-yellow-500" },
  { id: "material-reference", name: "Material Reference", icon: FileText, color: "bg-yellow-400" },
  { id: "material-usage-policy", name: "Material Usage Policy", icon: FileText, color: "bg-yellow-300" },
  { id: "media", name: "Media", icon: Image, color: "bg-blue-600" },
  { id: "media-agent-role", name: "Media Agent Role", icon: Users, color: "bg-blue-500" },
  { id: "media-assertion", name: "Media Assertion", icon: FileText, color: "bg-blue-400" },
  { id: "media-identifier", name: "Media Identifier", icon: FileText, color: "bg-blue-300" },
  { id: "media-provenance", name: "Media Provenance", icon: FileText, color: "bg-blue-200" },
  { id: "media-usage-policy", name: "Media Usage Policy", icon: FileText, color: "bg-blue-100" },
  { id: "identification", name: "Identification", icon: SearchIcon, color: "bg-cyan-600" },
  { id: "identification-agent-role", name: "Identification Agent Role", icon: Users, color: "bg-cyan-500" },
  { id: "identification-reference", name: "Identification Reference", icon: FileText, color: "bg-cyan-400" },
  { id: "identification-taxon", name: "Identification Taxon", icon: Target, color: "bg-cyan-300" },
  { id: "agent", name: "Agent", icon: Users, color: "bg-teal-600" },
  { id: "agent-agent-role", name: "Agent Agent Role", icon: Users, color: "bg-teal-500" },
  { id: "agent-identifier", name: "Agent Identifier", icon: Users, color: "bg-teal-400" },
  { id: "agent-media", name: "Agent Media", icon: Image, color: "bg-teal-300" },
  { id: "bibliographic-resource", name: "Bibliographic Resource", icon: FileText, color: "bg-orange-600" },
  { id: "chronometric-age", name: "Chronometric Age", icon: Calendar, color: "bg-indigo-600" },
  { id: "chronometric-age-agent-role", name: "Chrono Age Agent Role", icon: Users, color: "bg-indigo-500" },
  { id: "chronometric-age-assertion", name: "Chrono Age Assertion", icon: FileText, color: "bg-indigo-400" },
  { id: "chronometric-age-media", name: "Chrono Age Media", icon: Image, color: "bg-indigo-300" },
  { id: "chronometric-age-protocol", name: "Chrono Age Protocol", icon: FileText, color: "bg-indigo-200" },
  { id: "chronometric-age-reference", name: "Chrono Age Reference", icon: FileText, color: "bg-indigo-100" },
  { id: "geological-context", name: "Geological Context", icon: Grid3X3, color: "bg-stone-600" },
  { id: "geological-context-media", name: "Geological Context Media", icon: Image, color: "bg-stone-500" },
  { id: "event-agent-role", name: "Event Agent Role", icon: Users, color: "bg-purple-500" },
  { id: "event-assertion", name: "Event Assertion", icon: FileText, color: "bg-purple-400" },
  { id: "event-identifier", name: "Event Identifier", icon: FileText, color: "bg-purple-300" },
  { id: "event-media", name: "Event Media", icon: Image, color: "bg-purple-200" },
  { id: "event-protocol", name: "Event Protocol", icon: FileText, color: "bg-purple-100" },
  { id: "event-provenance", name: "Event Provenance", icon: FileText, color: "bg-violet-500" },
  { id: "event-reference", name: "Event Reference", icon: FileText, color: "bg-violet-400" },
  { id: "molecular-protocol", name: "Molecular Protocol", icon: FileSpreadsheet, color: "bg-lime-600" },
  { id: "molecular-protocol-agent-role", name: "Mol. Protocol Agent Role", icon: Users, color: "bg-lime-500" },
  { id: "molecular-protocol-assertion", name: "Mol. Protocol Assertion", icon: FileText, color: "bg-lime-400" },
  { id: "molecular-protocol-reference", name: "Mol. Protocol Reference", icon: FileText, color: "bg-lime-300" },
  { id: "nucleotide-analysis", name: "Nucleotide Analysis", icon: FileSpreadsheet, color: "bg-green-600" },
  { id: "nucleotide-analysis-assertion", name: "Nucleotide Analysis Assertion", icon: FileText, color: "bg-green-500" },
  { id: "organism-interaction-media", name: "Org. Interaction Media", icon: Image, color: "bg-emerald-50" },
  { id: "organism-interaction-reference", name: "Org. Interaction Reference", icon: FileText, color: "bg-teal-100" },
  { id: "organism-reference", name: "Organism Reference", icon: FileText, color: "bg-teal-50" },
  { id: "organism-relationship", name: "Organism Relationship", icon: Users, color: "bg-cyan-100" },
  { id: "protocol", name: "Protocol", icon: FileText, color: "bg-gray-600" },
  { id: "protocol-reference", name: "Protocol Reference", icon: FileText, color: "bg-gray-500" },
  { id: "provenance", name: "Provenance", icon: FileText, color: "bg-slate-600" },
  { id: "resource-relationship", name: "Resource Relationship", icon: Users, color: "bg-slate-500" },
  { id: "survey", name: "Survey", icon: Target, color: "bg-sky-600" },
  { id: "survey-agent-role", name: "Survey Agent Role", icon: Users, color: "bg-sky-500" },
  { id: "survey-assertion", name: "Survey Assertion", icon: FileText, color: "bg-sky-400" },
  { id: "survey-identifier", name: "Survey Identifier", icon: FileText, color: "bg-sky-300" },
  { id: "survey-protocol", name: "Survey Protocol", icon: FileText, color: "bg-sky-200" },
  { id: "survey-reference", name: "Survey Reference", icon: FileText, color: "bg-sky-100" },
  { id: "survey-target", name: "Survey Target", icon: Target, color: "bg-sky-50" },
  { id: "usage-policy", name: "Usage Policy", icon: FileText, color: "bg-fuchsia-600" },
];

// Schema-specific required/optional terms based on DwC-DP Quick Reference Guide
// Source: https://gbif.github.io/dwc-dp/qrg/
const schemaTerms: Record<string, { required: string[]; optional: string[] }> = {
  event: {
    required: ["eventID"],
    optional: [
      "parentEventID",
      "preferredEventName",
      "eventCategory",
      "eventType",
      "datasetName",
      "datasetID",
      "fieldNumber",
      "eventConductedBy",
      "eventConductedByID",
      "eventDate",
      "eventTime",
      "startDayOfYear",
      "endDayOfYear",
      "year",
      "month",
      "day",
      "verbatimEventDate",
      "verbatimLocality",
      "verbatimElevation",
      "verbatimDepth",
      "verbatimCoordinates",
      "verbatimLatitude",
      "verbatimLongitude",
      "verbatimCoordinateSystem",
      "verbatimSRS",
      "georeferenceVerificationStatus",
      "higherGeography",
      "higherGeographyID",
      "continent",
      "waterBody",
      "islandGroup",
      "island",
      "country",
      "countryCode",
      "stateProvince",
      "county",
      "municipality",
      "locality",
      "siteNumber",
      "locationID",
      "minimumElevationInMeters",
      "maximumElevationInMeters",
      "verticalDatum",
      "minimumDepthInMeters",
      "maximumDepthInMeters",
      "minimumDistanceAboveSurfaceInMeters",
      "maximumDistanceAboveSurfaceInMeters",
      "locationRemarks",
      "decimalLatitude",
      "decimalLongitude",
      "geodeticDatum",
      "coordinateUncertaintyInMeters",
      "coordinatePrecision",
      "pointRadiusSpatialFit",
      "footprintWKT",
      "footprintSRS",
      "footprintSpatialFit",
      "georeferencedBy",
      "georeferencedByID",
      "georeferencedDate",
      "georeferenceProtocol",
      "georeferenceProtocolID",
      "georeferenceSources",
      "georeferenceRemarks",
      "preferredSpatialRepresentation",
      "geologicalContextID",
      "habitat",
      "eventEffort",
      "fieldNotes",
      "eventReferences",
      "eventRemarks",
      "samplingProtocol",
      "samplingEffort",
      "sampleSizeValue",
      "sampleSizeUnit",
      "feedbackURL",
      "informationWithheld",
      "dataGeneralizations",
      "basisOfRecord",
    ],
  },
  occurrence: {
    required: ["occurrenceID", "eventID"],
    optional: [
      "isPartOfOccurrenceID",
      "surveyTargetID",
      "recordedBy",
      "recordedByID",
      "organismQuantity",
      "organismQuantityType",
      "sex",
      "lifeStage",
      "reproductiveCondition",
      "caste",
      "behavior",
      "vitality",
      "establishmentMeans",
      "degreeOfEstablishment",
      "pathway",
      "substrate",
      "occurrenceStatus",
      "occurrenceReferences",
      "informationWithheld",
      "dataGeneralizations",
      "occurrenceRemarks",
      "organismID",
      "organismScope",
      "organismName",
      "causeOfDeath",
      "organismRemarks",
      "verbatimIdentification",
      "identifiedBy",
      "identifiedByID",
      "dateIdentified",
      "identificationReferences",
      "identificationVerificationStatus",
      "identificationRemarks",
      "taxonID",
      "scientificNameID",
      "scientificName",
      "scientificNameAuthorship",
      "vernacularName",
      "taxonRank",
      "externalClassificationSource",
      "feedbackURL",
    ],
  },
  "occurrence-agent-role": {
    required: ["agentID", "occurrenceID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "occurrence-assertion": {
    required: ["occurrenceID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  "occurrence-identifier": {
    required: ["occurrenceID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "occurrence-media": {
    required: ["mediaID", "occurrenceID"],
    optional: [
      "subjectCategory", "subjectCategoryIRI", "subjectCategorySource",
      "subjectPartLiteral", "subjectPart",
      "subjectOrientationLiteral", "subjectOrientation",
      "physicalSetting",
    ],
  },
  "occurrence-protocol": {
    required: ["occurrenceID", "protocolID"],
    optional: [],
  },
  "occurrence-reference": {
    required: ["occurrenceID", "referenceID"],
    optional: ["relationshipType"],
  },
  organism: {
    required: ["organismID"],
    optional: [
      "organismScope",
      "organismName",
      "causeOfDeath",
      "associatedOrganisms",
      "organismRemarks",
    ],
  },
  "organism-assertion": {
    required: ["organismID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  "organism-identifier": {
    required: ["organismID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "organism-interaction": {
    required: ["organismInteractionID", "eventID", "subjectOccurrenceID"],
    optional: [
      "organismInteractionDescription",
      "subjectOrganismPart",
      "organismInteractionType",
      "relatedOccurrenceID",
      "externalRelatedOccurrenceID",
      "externalRelatedOccurrenceSource",
      "relatedOrganismPart",
      "feedbackURL",
    ],
  },
  "organism-interaction-agent-role": {
    required: ["agentID", "organismInteractionID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "organism-interaction-assertion": {
    required: ["organismInteractionID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  material: {
    required: ["materialEntityID"],
    optional: [
      "digitalSpecimenID",
      "eventID",
      "materialCategory",
      "discipline",
      "materialEntityType",
      "institutionCode",
      "institutionID",
      "ownerInstitutionCode",
      "ownerInstitutionID",
      "collectionCode",
      "collectionID",
      "catalogNumber",
      "otherCatalogNumbers",
      "collectedBy",
      "collectedByID",
      "objectQuantity",
      "objectQuantityType",
      "collectorNumber",
      "preparations",
      "disposition",
      "verbatimLabel",
      "associatedSequences",
      "materialReferences",
      "informationWithheld",
      "dataGeneralizations",
      "materialEntityRemarks",
      "evidenceForOccurrenceID",
      "derivedFromMaterialEntityID",
      "derivationEventID",
      "derivationType",
      "isPartOfMaterialEntityID",
      "verbatimIdentification",
      "typeStatus",
      "typeDesignationType",
      "typifiedName",
      "identifiedBy",
      "identifiedByID",
      "dateIdentified",
      "identificationReferences",
      "identificationVerificationStatus",
      "identificationRemarks",
      "taxonID",
      "scientificNameID",
      "geoClassificationCode",
      "geoName",
      "scientificName",
      "scientificNameAuthorship",
      "vernacularName",
      "taxonRank",
      "externalClassificationSource",
      "feedbackURL",
    ],
  },
  "material-agent-role": {
    required: ["agentID", "materialEntityID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "material-assertion": {
    required: ["materialEntityID"],
    optional: [
      "assertionID",
      "verbatimAssertionType",
      "assertionType",
      "assertionTypeIRI",
      "assertionTypeSource",
      "assertionMadeDate",
      "assertionEffectiveDate",
      "assertionValue",
      "assertionValueIRI",
      "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit",
      "assertionUnitIRI",
      "assertionUnitSource",
      "assertionError",
      "assertionBy",
      "assertionByID",
      "assertionProtocols",
      "assertionProtocolID",
      "assertionReferences",
      "assertionRemarks",
    ],
  },
  "material-identifier": {
    required: ["materialEntityID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "material-geological-context": {
    required: ["materialEntityID", "geologicalContextID"],
    optional: [],
  },
  "material-media": {
    required: ["mediaID", "materialEntityID"],
    optional: [
      "subjectCategory", "subjectCategoryIRI", "subjectCategorySource",
      "subjectPartLiteral", "subjectPart",
      "subjectOrientationLiteral", "subjectOrientation",
      "physicalSetting",
    ],
  },
  "material-protocol": {
    required: ["materialEntityID", "protocolID"],
    optional: [],
  },
  "material-provenance": {
    required: ["provenanceID", "materialEntityID"],
    optional: [],
  },
  "material-reference": {
    required: ["referenceID", "materialEntityID"],
    optional: ["relationshipType"],
  },
  "material-usage-policy": {
    required: ["usagePolicyID", "materialEntityID"],
    optional: [],
  },
  media: {
    required: ["mediaID"],
    optional: [
      "derivedFromMediaID", "isPartOfMediaID",
      "mediaType", "title", "description", "caption",
      "subtypeLiteral", "subtypeIRI",
      "collectionCode", "collectionID",
      "CreateDate", "timeOfDay", "digitizationDate",
      "captureDevice", "frameRate", "resourceCreationTechnique",
      "sample-rate", "modified",
      "language", "languageIRI",
      "MetadataDate", "metadataLanguageLiteral", "metadataLanguageIRI",
      "providerManagedID", "available",
      "hasServiceAccessPoint", "serviceExpectation",
      "accessURI", "format", "formatIRI",
      "variantLiteral", "variantIRI", "variantDescription",
      "PixelXDimension", "PixelYDimension",
      "hashFunction", "hashValue",
      "furtherInformationURL",
      "commenterLiteral", "commenterID", "comments",
      "Rating", "reviewerLiteral", "reviewerID", "reviewerComments",
      "physicalSetting",
      "subjectCategory", "subjectCategoryIRI", "subjectCategorySource",
      "tag",
      "subjectPartLiteral", "subjectPartIRI",
      "subjectOrientationLiteral", "subjectOrientationIRI",
      "startTime", "endTime", "startTimestamp", "endTimestamp",
      "mediaDuration", "mediaSpeed",
      "freqHigh", "freqLow",
      "xFrac", "yFrac", "heightFrac", "widthFrac", "radius",
    ],
  },
  "media-agent-role": {
    required: ["agentID", "mediaID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "media-assertion": {
    required: ["mediaID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  "media-identifier": {
    required: ["mediaID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "media-provenance": {
    required: ["provenanceID", "mediaID"],
    optional: [],
  },
  "media-usage-policy": {
    required: ["usagePolicyID", "mediaID"],
    optional: [],
  },
  identification: {
    required: ["identificationID"],
    optional: [
      "materialEntityID",
      "mediaID",
      "nucleotideAnalysisID",
      "nucleotideSequenceID",
      "occurrenceID",
      "organismID",
      "verbatimIdentification",
      "isAcceptedIdentification",
      "taxonFormula",
      "typeStatus",
      "typeDesignationType",
      "identifiedBy",
      "identifiedByID",
      "dateIdentified",
      "identificationReferences",
      "taxonAssignmentMethod",
      "identificationVerificationStatus",
      "identificationRemarks",
      "taxonID",
      "scientificNameID",
      "geoClassificationCode",
      "geoName",
      "scientificName",
      "scientificNameAuthorship",
      "vernacularName",
      "taxonRank",
      "externalClassificationSource",
      "kingdom",
      "phylum",
      "class",
      "order",
      "family",
      "subfamily",
      "genus",
      "genericName",
      "subgenus",
      "infragenericEpithet",
      "specificEpithet",
      "infraspecificEpithet",
      "cultivarEpithet",
      "nameAccordingTo",
      "nomenclaturalCode",
      "nomenclaturalStatus",
      "namePublishedIn",
      "namePublishedInYear",
      "taxonRemarks",
      "feedbackURL",
    ],
  },
  "identification-agent-role": {
    required: ["agentID", "identificationID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "identification-reference": {
    required: ["identificationID", "referenceID"],
    optional: ["relationshipType"],
  },
  "identification-taxon": {
    required: ["identificationID"],
    optional: [
      "taxonSortOrder",
      "taxonID",
      "scientificNameID",
      "geoClassificationCode",
      "geoName",
      "scientificName",
      "scientificNameAuthorship",
      "vernacularName",
      "taxonRank",
      "externalClassificationSource",
      "kingdom",
      "phylum",
      "class",
      "order",
      "family",
      "subfamily",
      "genus",
      "genericName",
      "subgenus",
      "infragenericEpithet",
      "specificEpithet",
      "infraspecificEpithet",
      "cultivarEpithet",
      "nameAccordingTo",
      "nomenclaturalCode",
      "nomenclaturalStatus",
      "namePublishedIn",
      "namePublishedInYear",
    ],
  },
  agent: {
    required: ["agentID"],
    optional: ["agentType", "preferredAgentName", "agentRemarks"],
  },
  "agent-agent-role": {
    required: ["agentID", "relatedAgentID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "agent-identifier": {
    required: ["agentID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "agent-media": {
    required: ["mediaID", "agentID"],
    optional: [
      "subjectCategory",
      "subjectCategoryIRI",
      "subjectCategorySource",
      "subjectPartLiteral",
      "subjectPart",
      "subjectOrientationLiteral",
      "subjectOrientation",
      "physicalSetting",
    ],
  },
  "bibliographic-resource": {
    required: ["referenceID"],
    optional: [
      "parentReferenceID",
      "referenceType",
      "bibliographicCitation",
      "title",
      "author",
      "authorID",
      "editor",
      "editorID",
      "publisher",
      "publisherID",
      "volume",
      "issue",
      "edition",
      "pages",
      "version",
      "issued",
      "accessed",
      "peerReviewStatus",
      "referenceRemarks",
    ],
  },
  "chronometric-age": {
    required: ["chronometricAgeID"],
    optional: [
      "eventID",
      "verbatimChronometricAge",
      "chronometricAgeProtocol",
      "chronometricAgeProtocolID",
      "uncalibratedChronometricAge",
      "chronometricAgeConversionProtocol",
      "chronometricAgeConversionProtocolID",
      "earliestChronometricAge",
      "earliestChronometricAgeReferenceSystem",
      "latestChronometricAge",
      "latestChronometricAgeReferenceSystem",
      "chronometricAgeUncertaintyInYears",
      "chronometricAgeUncertaintyMethod",
      "materialDated",
      "materialDatedID",
      "materialDatedRelationship",
      "chronometricAgeDeterminedBy",
      "chronometricAgeDeterminedByID",
      "chronometricAgeDeterminedDate",
      "chronometricAgeReferences",
      "chronometricAgeRemarks",
    ],
  },
  "chronometric-age-agent-role": {
    required: ["agentID", "chronometricAgeID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "chronometric-age-assertion": {
    required: ["chronometricAgeID"],
    optional: [
      "assertionID",
      "verbatimAssertionType",
      "assertionType",
      "assertionTypeIRI",
      "assertionTypeSource",
      "assertionMadeDate",
      "assertionEffectiveDate",
      "assertionValue",
      "assertionValueIRI",
      "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit",
      "assertionUnitIRI",
      "assertionUnitSource",
      "assertionError",
      "assertionBy",
      "assertionByID",
      "assertionProtocols",
      "assertionProtocolID",
      "assertionReferences",
      "assertionRemarks",
    ],
  },
  "chronometric-age-media": {
    required: ["mediaID", "chronometricAgeID"],
    optional: [
      "subjectCategory",
      "subjectCategoryIRI",
      "subjectCategorySource",
      "subjectPartLiteral",
      "subjectPart",
      "subjectOrientationLiteral",
      "subjectOrientation",
      "physicalSetting",
    ],
  },
  "chronometric-age-protocol": {
    required: ["chronometricAgeID", "protocolID"],
    optional: [],
  },
  "chronometric-age-reference": {
    required: ["chronometricAgeID", "referenceID"],
    optional: ["relationshipType"],
  },
  "geological-context": {
    required: ["geologicalContextID"],
    optional: [
      "earliestEonOrLowestEonothem",
      "latestEonOrHighestEonothem",
      "earliestEraOrLowestErathem",
      "latestEraOrHighestErathem",
      "earliestPeriodOrLowestSystem",
      "latestPeriodOrHighestSystem",
      "earliestEpochOrLowestSeries",
      "latestEpochOrHighestSeries",
      "earliestAgeOrLowestStage",
      "latestAgeOrHighestStage",
      "lowestBiostratigraphicZone",
      "highestBiostratigraphicZone",
      "lithostratigraphicTerms",
      "lithostratigraphicGroup",
      "formation",
      "member",
      "bed",
    ],
  },
  "geological-context-media": {
    required: ["mediaID", "geologicalContextID"],
    optional: [
      "subjectCategory",
      "subjectCategoryIRI",
      "subjectCategorySource",
      "subjectPartLiteral",
      "subjectPart",
      "subjectOrientationLiteral",
      "subjectOrientation",
      "physicalSetting",
    ],
  },
  "event-agent-role": {
    required: ["agentID", "eventID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "event-assertion": {
    required: ["eventID"],
    optional: [
      "assertionID",
      "verbatimAssertionType",
      "assertionType",
      "assertionTypeIRI",
      "assertionTypeSource",
      "assertionMadeDate",
      "assertionEffectiveDate",
      "assertionValue",
      "assertionValueIRI",
      "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit",
      "assertionUnitIRI",
      "assertionUnitSource",
      "assertionError",
      "assertionBy",
      "assertionByID",
      "assertionProtocols",
      "assertionProtocolID",
      "assertionReferences",
      "assertionRemarks",
    ],
  },
  "event-identifier": {
    required: ["eventID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "event-media": {
    required: ["mediaID", "eventID"],
    optional: [
      "subjectCategory",
      "subjectCategoryIRI",
      "subjectCategorySource",
      "subjectPartLiteral",
      "subjectPart",
      "subjectOrientationLiteral",
      "subjectOrientation",
      "physicalSetting",
    ],
  },
  "event-protocol": {
    required: ["eventID", "protocolID"],
    optional: [],
  },
  "event-provenance": {
    required: ["provenanceID", "eventID"],
    optional: [],
  },
  "event-reference": {
    required: ["eventID", "referenceID"],
    optional: ["relationshipType"],
  },
  "molecular-protocol": {
    required: ["molecularProtocolID"],
    optional: [
      "assayType", "samp_name", "project_name", "experimental_factor",
      "samp_taxon_id", "neg_cont_type", "pos_cont_type",
      "env_broad_scale", "env_local_scale", "env_medium",
      "subspecf_gen_lin", "ploidy", "num_replicons", "extrachrom_elements",
      "estimated_size", "ref_biomaterial", "source_mat_id",
      "pathogenicity", "biotic_relationship", "specific_host",
      "host_spec_range", "host_disease_stat", "trophic_level",
      "propagation", "encoded_traits", "rel_to_oxygen",
      "isol_growth_condt", "samp_collec_device", "samp_collec_method",
      "samp_mat_process", "size_frac", "samp_size", "samp_vol_we_dna_ext",
      "source_uvig", "virus_enrich_appr",
      "nucl_acid_ext", "nucl_acid_amp",
      "lib_size", "lib_reads_seqd", "lib_layout", "lib_vector", "lib_screen",
      "target_gene", "target_subfragment",
      "pcr_primers", "mid", "adapters", "pcr_cond",
      "seq_meth", "seq_quality_check", "chimera_check",
      "tax_ident", "assembly_qual", "assembly_name", "assembly_software",
      "annot", "number_contig", "feat_pred", "ref_db",
      "sim_search_meth", "tax_class",
      "_16s_recover", "_16s_recover_software",
      "trnas", "trna_ext_software",
      "compl_score", "compl_software", "compl_appr",
      "contam_score", "contam_screen_input", "contam_screen_param", "decontam_software",
      "sort_tech", "single_cell_lysis_appr", "single_cell_lysis_prot",
      "wga_amp_appr", "wga_amp_kit",
      "bin_param", "bin_software", "reassembly_bin", "mag_cov_software",
      "vir_ident_software", "pred_genome_type", "pred_genome_struc", "detec_type",
      "otu_class_appr", "otu_seq_comp_appr", "otu_db",
      "host_pred_appr", "host_pred_est_acc",
      "associated_resource", "sop",
      "pcr_primer_forward", "pcr_primer_reverse",
      "pcr_primer_name_forward", "pcr_primer_name_reverse", "pcr_primer_reference",
      "DNA_sequence",
      "concentration", "concentrationUnit", "methodDeterminationConcentrationAndRatios",
      "ratioOfAbsorbance260_230", "ratioOfAbsorbance260_280",
      "annealingTemp", "annealingTempUnit",
      "probeReporter", "probeQuencher", "ampliconSize",
      "thresholdQuantificationCycle", "baselineValue", "quantificationCycle",
      "automaticThresholdQuantificationCycle", "automaticBaselineValue",
      "contaminationAssessment",
      "partitionVolume", "partitionVolumeUnit",
      "estimatedNumberOfCopies",
      "amplificationReactionVolume", "amplificationReactionVolumeUnit",
      "pcr_analysis_software", "experimentalVariance",
      "pcr_primer_lod", "pcr_primer_loq",
    ],
  },
  "molecular-protocol-agent-role": {
    required: ["agentID", "molecularProtocolID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "molecular-protocol-assertion": {
    required: ["molecularProtocolID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  "molecular-protocol-reference": {
    required: ["referenceID", "molecularProtocolID"],
    optional: ["relationshipType"],
  },
  "nucleotide-analysis": {
    required: ["nucleotideAnalysisID", "eventID", "molecularProtocolID", "nucleotideSequenceID"],
    optional: ["materialEntityID", "readCount", "totalReadCount"],
  },
  "nucleotide-analysis-assertion": {
    required: ["nucleotideAnalysisID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  "organism-interaction-media": {
    required: ["mediaID", "organismInteractionID"],
    optional: [
      "subjectCategory", "subjectCategoryIRI", "subjectCategorySource",
      "subjectPartLiteral", "subjectPart",
      "subjectOrientationLiteral", "subjectOrientation",
      "physicalSetting",
    ],
  },
  "organism-interaction-reference": {
    required: ["organismInteractionID", "referenceID"],
    optional: ["relationshipType"],
  },
  "organism-reference": {
    required: ["organismID", "referenceID"],
    optional: ["relationshipType"],
  },
  "organism-relationship": {
    required: ["organismRelationshipID", "subjectOrganismID"],
    optional: [
      "relationshipType", "relationshipTypeIRI", "relationshipTypeSource",
      "relatedOrganismID",
      "externalRelatedOrganismID", "externalRelatedOrganismSource",
      "relationshipOrder",
      "relationshipAccordingTo", "relationshipAccordingToID",
      "relationshipEstablishedDate", "relationshipRemarks",
    ],
  },
  protocol: {
    required: ["protocolID"],
    optional: [
      "protocolType", "protocolName", "protocolDescription",
      "protocolReferences", "protocolRemarks",
    ],
  },
  "protocol-reference": {
    required: ["protocolID", "referenceID"],
    optional: ["relationshipType"],
  },
  provenance: {
    required: ["provenanceID"],
    optional: [
      "datasetID", "fundingAttribution", "fundingAttributionID",
      "source", "sourceIRI",
      "creatorLiteral", "creatorID",
      "providerLiteral", "providerID",
      "metadataCreatorLiteral", "metadataCreatorID",
      "metadataProviderLiteral", "metadataProviderID",
      "furtherInformationURL", "feedbackURL",
      "references", "bibliographicCitation",
      "projectID", "projectTitle",
    ],
  },
  "resource-relationship": {
    required: ["resourceRelationshipID", "subjectResourceID"],
    optional: [
      "subjectResourceType", "subjectResourceTypeIRI", "subjectResourceTypeSource",
      "relationshipType", "relationshipTypeIRI", "relationshipTypeSource",
      "relatedResourceID",
      "externalRelatedResourceID", "externalRelatedResourceSource",
      "relatedResourceType", "relatedResourceTypeIRI", "relatedResourceTypeSource",
      "relationshipOrder",
      "relationshipAccordingTo", "relationshipAccordingToID",
      "relationshipEstablishedDate", "relationshipRemarks",
    ],
  },
  survey: {
    required: ["surveyID", "eventID"],
    optional: [
      "siteCount", "siteNestingDescription",
      "verbatimSiteDescriptions", "verbatimSiteNames",
      "geospatialScopeAreaValue", "geospatialScopeAreaUnit",
      "totalAreaSampledValue", "totalAreaSampledUnit",
      "reportedExtremeConditions", "reportedWeather",
      "eventDurationValue", "eventDurationUnit",
      "taxonCompletenessReported", "taxonCompletenessProtocols",
      "isAbsenceReported", "absentTaxa",
      "hasNonTargetTaxa", "nonTargetTaxa", "areNonTargetTaxaFullyReported",
      "hasNonTargetOrganisms",
      "verbatimTargetScope",
      "identifiedBy", "identifiedByID", "identificationReferences",
      "compilationTypes", "compilationSourceTypes",
      "inventoryTypes",
      "protocolNames", "protocolDescriptions", "protocolReferences",
      "isAbundanceReported", "isAbundanceCapReported", "abundanceCap",
      "isVegetationCoverReported",
      "isLeastSpecificTargetCategoryQuantityInclusive",
      "hasVouchers", "voucherInstitutions",
      "hasMaterialSamples", "materialSampleTypes",
      "sampleSizeValue", "sampleSizeUnit",
      "samplingPerformedBy", "samplingPerformedByID",
      "isSamplingEffortReported",
      "samplingEffortProtocol", "samplingEffortProtocolID",
      "samplingEffortValue", "samplingEffortUnit",
      "informationWithheld", "dataGeneralizations",
      "feedbackURL",
    ],
  },
  "survey-agent-role": {
    required: ["agentID", "surveyID"],
    optional: ["agentRole", "agentRoleIRI", "agentRoleSource", "agentRoleOrder", "agentRoleDate"],
  },
  "survey-assertion": {
    required: ["surveyID"],
    optional: [
      "assertionID", "verbatimAssertionType",
      "assertionType", "assertionTypeIRI", "assertionTypeSource",
      "assertionMadeDate", "assertionEffectiveDate",
      "assertionValue", "assertionValueIRI", "assertionValueSource",
      "assertionValueNumeric",
      "assertionUnit", "assertionUnitIRI", "assertionUnitSource",
      "assertionError",
      "assertionBy", "assertionByID",
      "assertionProtocols", "assertionProtocolID",
      "assertionReferences", "assertionRemarks",
    ],
  },
  "survey-identifier": {
    required: ["surveyID", "identifier"],
    optional: ["identifierType", "identifierTypeIRI", "identifierTypeSource", "identifierLanguage"],
  },
  "survey-protocol": {
    required: ["protocolID", "surveyID"],
    optional: [],
  },
  "survey-reference": {
    required: ["referenceID", "surveyID"],
    optional: ["relationshipType"],
  },
  "survey-target": {
    required: ["surveyTargetID", "surveyID", "includeOrExclude", "isSurveyTargetFullyReported"],
    optional: [
      "surveyTargetType", "surveyTargetTypeIRI", "surveyTargetTypeSource",
      "surveyTargetValue", "surveyTargetValueIRI", "surveyTargetValueSource",
      "surveyTargetUnit", "surveyTargetUnitIRI", "surveyTargetUnitSource",
    ],
  },
  "usage-policy": {
    required: ["usagePolicyID"],
    optional: [
      "rights", "rightsIRI", "rightsHolder", "rightsHolderID",
      "owner", "ownerID",
      "usageTerms", "webStatement",
      "accessRights", "license", "licenseLogoURL",
      "licensingException", "credit",
      "attributionLogoURL", "attributionLinkURL",
    ],
  },
};

interface SchemaMapperProps {
  columns: string[];
  data: any[];
  fileName: string;
  onBack: () => void;
  onComplete?: (mappings: Record<string, string>, schema: string) => void;
}

export default function SchemaMapper({ columns, data, fileName, onBack, onComplete }: SchemaMapperProps) {
  const { t, language } = useLanguage();
  const storageKey = `dwc-mappings-${fileName}`;
  const autoMatchShown = useRef(false);
  const [selectedSchema, setSelectedSchema] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).schema || "event";
    } catch {}
    return "event";
  });
  const [mappings, setMappings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if columns match
        if (parsed.columns && JSON.stringify(parsed.columns.sort()) === JSON.stringify([...columns].sort())) {
          return parsed.mappings || {};
        }
      }
    } catch {}
    return {};
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [previewSchemaId, setPreviewSchemaId] = useState<string | null>(null);
  const [convertDatesToISO, setConvertDatesToISO] = useState(true);
  const [showAutoMatch, setShowAutoMatch] = useState(false);
  const [autoMatchResults, setAutoMatchResults] = useState<ReturnType<typeof findAutoMatches>>([]);
  const [dismissedSchemas, setDismissedSchemas] = useState<Set<string>>(new Set());
  const [selectedForDownload, setSelectedForDownload] = useState<Set<string>>(new Set());
  const [showIdGenerator, setShowIdGenerator] = useState(false);
  const [generatedIdConfigs, setGeneratedIdConfigs] = useState<import('./IdGeneratorDialog').IdFieldConfig[]>([]);
  const [showTutorial, setShowTutorial] = useState(() => {
    try { return !localStorage.getItem('dwc-mapper-tutorial-seen'); } catch { return true; }
  });
  const [tutorialPhase, setTutorialPhase] = useState<1 | 2>(1);
  const phase2ShownRef = useRef(false);

  // Show tutorial phase 2 when first mapping is made
  useEffect(() => {
    if (phase2ShownRef.current) return;
    const hasMappings = Object.keys(mappings).length > 0;
    const phase1Done = localStorage.getItem('dwc-mapper-tutorial-seen') === '1';
    const phase2Done = localStorage.getItem('dwc-mapper-tutorial-phase2-seen');
    if (hasMappings && phase1Done && !phase2Done && !showTutorial) {
      phase2ShownRef.current = true;
      setTutorialPhase(2);
      setShowTutorial(true);
    }
  }, [mappings, showTutorial]);

  // Auto-detect matches on mount (store results but don't show dialog automatically)
  useEffect(() => {
    if (autoMatchShown.current) return;
    // Only detect if no existing mappings
    if (Object.keys(mappings).length > 0) return;
    
    const matches = findAutoMatches(columns, data, schemaTerms, schemaTypes, language);
    if (matches.length > 0) {
      autoMatchShown.current = true;
      setAutoMatchResults(matches);
      // Don't auto-show — user triggers via button
    }
  }, [columns, data, language, mappings]);

  // Manual trigger for auto-detect headers
  const handleDetectHeaders = useCallback(() => {
    const matches = findAutoMatches(columns, data, schemaTerms, schemaTypes, language);
    setAutoMatchResults(matches);
    if (matches.length > 0) {
      setShowAutoMatch(true);
    }
  }, [columns, data, language]);

  // Persist mappings to localStorage
  const saveMappings = useCallback(
    (newMappings: Record<string, string>, schema?: string) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            mappings: newMappings,
            schema: schema || selectedSchema,
            columns,
          }),
        );
      } catch {}
    },
    [storageKey, selectedSchema, columns],
  );

  const handleAutoMatchApply = useCallback((selectedMatches: typeof autoMatchResults) => {
    const newMappings: Record<string, string> = { ...mappings };
    
    const schemaCounts: Record<string, number> = {};
    selectedMatches.forEach(m => {
      schemaCounts[m.schemaId] = (schemaCounts[m.schemaId] || 0) + 1;
      newMappings[m.termName] = m.column;
    });
    
    const topSchema = Object.entries(schemaCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSchema) {
      setSelectedSchema(topSchema[0]);
      saveMappings(newMappings, topSchema[0]);
    }
    
    setMappings(newMappings);
    setShowAutoMatch(false);
  }, [mappings, saveMappings]);

  // Wrap setMappings to also persist
  const updateMappings = useCallback(
    (updater: (prev: Record<string, string>) => Record<string, string>) => {
      setMappings((prev) => {
        const next = updater(prev);
        saveMappings(next);
        return next;
      });
    },
    [saveMappings],
  );

  const currentSchema = schemaTerms[selectedSchema];
  const allTerms = [...currentSchema.required, ...currentSchema.optional];

  // Helper: check if a term matches a search query
  function matchesTermSearch(term: string, q: string): boolean {
    if (term.toLowerCase().includes(q)) return true;
    const info = dwcTerms[term];
    if (!info) return false;
    return [info.description, info.descriptionEN, info.descriptionFR, info.descriptionDE, info.category]
      .filter(Boolean)
      .some((text) => text!.toLowerCase().includes(q));
  }

  // All schemas with their terms, filtered by search
  const allSchemasFiltered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const results: { schemaId: string; schemaName: string; required: string[]; optional: string[] }[] = [];
    
    for (const [schemaId, schema] of Object.entries(schemaTerms)) {
      const schemaInfo = schemaTypes.find(s => s.id === schemaId);
      const schemaName = schemaInfo?.name || schemaId;
      
      const filteredReq = q ? schema.required.filter(t => matchesTermSearch(t, q)) : schema.required;
      const filteredOpt = q ? schema.optional.filter(t => matchesTermSearch(t, q)) : schema.optional;
      
      if (filteredReq.length > 0 || filteredOpt.length > 0) {
        results.push({ schemaId, schemaName, required: filteredReq, optional: filteredOpt });
      }
    }
    
    return results;
  }, [searchTerm]);

  // Filter terms by search — for backward compat
  const matchesTerm = useCallback(
    (term: string) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return matchesTermSearch(term, q);
    },
    [searchTerm],
  );

  const filteredRequired = currentSchema.required.filter(matchesTerm);
  const filteredOptional = currentSchema.optional.filter(matchesTerm);

  // Compute optimal table layout from current mappings
  const optimalLayout = useMemo(() => {
    const mapped = Object.keys(mappings);
    if (mapped.length === 0) return [];
    
    // Find which schemas each mapped term belongs to
    const schemaForTerm: Record<string, string[]> = {};
    mapped.forEach(term => {
      const schemas: string[] = [];
      for (const [schemaId, schema] of Object.entries(schemaTerms)) {
        if (schema.required.includes(term) || schema.optional.includes(term)) {
          schemas.push(schemaId);
        }
      }
      schemaForTerm[term] = schemas;
    });
    
    // Greedy set-cover: pick schemas that cover the most unmapped terms
    const uncovered = new Set(mapped);
    const chosen: { schemaId: string; terms: string[]; required: string[] }[] = [];
    
    while (uncovered.size > 0) {
      let bestSchema = '';
      let bestTerms: string[] = [];
      let bestRequired: string[] = [];
      let bestCount = 0;
      
      for (const [schemaId, schema] of Object.entries(schemaTerms)) {
        const allSchemaTerms = [...schema.required, ...schema.optional];
        const covered = allSchemaTerms.filter(t => uncovered.has(t));
        if (covered.length > bestCount) {
          bestCount = covered.length;
          bestSchema = schemaId;
          bestTerms = covered;
          bestRequired = schema.required.filter(t => !mappings[t]);
        }
      }
      
      if (bestCount === 0) break;
      chosen.push({ schemaId: bestSchema, terms: bestTerms, required: bestRequired });
      bestTerms.forEach(t => uncovered.delete(t));
    }
    
    return chosen;
  }, [mappings]);

  // Get sample values for a column
  const getSampleValues = useCallback(
    (columnName: string) => {
      return data
        .slice(0, 3)
        .map((row) => row[columnName])
        .filter(Boolean)
        .join(", ");
    },
    [data],
  );

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, column: string) => {
    e.dataTransfer.setData("text/plain", column);
    setDraggedColumn(column);
  };

  // Check if column should allow multi-mapping (ID columns)
  const isMultiMapColumn = (colName: string) => /id$/i.test(colName) || /ID/.test(colName);

  // Handle drop
  const handleDrop = (e: React.DragEvent, termName: string) => {
    e.preventDefault();
    const columnName = e.dataTransfer.getData("text/plain");

    updateMappings((prev) => {
      const newMappings = { ...prev };
      // Only remove previous mappings if NOT an ID column
      if (!isMultiMapColumn(columnName)) {
        Object.keys(newMappings).forEach((key) => {
          if (newMappings[key] === columnName) delete newMappings[key];
        });
      }
      newMappings[termName] = columnName;
      return newMappings;
    });
    setDraggedColumn(null);
  };

  // Remove mapping
  const handleRemoveMapping = (termName: string) => {
    updateMappings((prev) => {
      const newMappings = { ...prev };
      delete newMappings[termName];
      return newMappings;
    });
  };

  // Tap-to-assign handlers
  const handleTapSelectColumn = (column: string) => {
    setSelectedColumn((prev) => (prev === column ? null : column));
  };

  const handleTapAssignTerm = (termName: string) => {
    if (!selectedColumn) return;
    updateMappings((prev) => {
      const newMappings = { ...prev };
      // Only remove previous mappings if NOT an ID column
      if (!isMultiMapColumn(selectedColumn)) {
        Object.keys(newMappings).forEach((key) => {
          if (newMappings[key] === selectedColumn) delete newMappings[key];
        });
      }
      newMappings[termName] = selectedColumn;
      return newMappings;
    });
    setSelectedColumn(null);
  };

  const handleReset = () => {
    updateMappings(() => ({}));
  };

  // Check if column is mapped
  // Get first mapping for a column
  const getColumnMapping = (columnName: string) => {
    return Object.entries(mappings).find(([, col]) => col === columnName)?.[0] || null;
  };

  // Get ALL mappings for a column (for ID multi-map display)
  const getAllColumnMappings = (columnName: string) => {
    return Object.entries(mappings).filter(([, col]) => col === columnName).map(([term]) => term);
  };

  // Auto-map across ALL schemas (not just current)
  const handleAutoMap = () => {
    const newMappings: Record<string, string> = { ...mappings };

    for (const [, schema] of Object.entries(schemaTerms)) {
      [...schema.required, ...schema.optional].forEach((term) => {
        if (!newMappings[term]) {
          const match = findBestColumnMatch(term, columns);
          if (match) {
            newMappings[term] = match;
          }
        }
      });
    }

    updateMappings(() => newMappings);
  };

  // Persist schema selection
  const handleSchemaChange = (schemaId: string) => {
    setSelectedSchema(schemaId);
    saveMappings(mappings, schemaId);
  };

  // Check if all required fields are mapped
  const allRequiredMapped = currentSchema.required.every((term) => mappings[term]);

  // Handle complete
  const handleComplete = () => {
    if (allRequiredMapped) {
      onComplete?.(mappings, selectedSchema);
    }
  };

  // Group mappings by schema type
  // Compute required ID terms that are unmapped across all schemas with mappings
  const unmappedRequiredIdTerms = useMemo(() => {
    const idTerms = new Set<string>();
    for (const [schemaId, schema] of Object.entries(schemaTerms)) {
      // Only check schemas that have at least one mapped field
      const hasMapped = [...schema.required, ...schema.optional].some(t => mappings[t]);
      if (!hasMapped) continue;
      for (const req of schema.required) {
        if (req.toLowerCase().endsWith('id') && !mappings[req]) {
          idTerms.add(req);
        }
      }
    }
    return [...idTerms];
  }, [mappings]);

  // Pre-computed generated ID values per term
  const generatedIdValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const config of generatedIdConfigs) {
      if (config.mode === 'skip') continue;
      result[config.term] = generateAllIds(config, data);
    }
    return result;
  }, [generatedIdConfigs, data]);

  const getMappingsBySchema = useCallback(() => {
    const grouped: Record<string, Record<string, string>> = {};
    Object.entries(mappings).forEach(([term, col]) => {
      for (const [schemaId, schema] of Object.entries(schemaTerms)) {
        if (schema.required.includes(term) || schema.optional.includes(term)) {
          if (!grouped[schemaId]) grouped[schemaId] = {};
          grouped[schemaId][term] = col;
          break;
        }
      }
    });
    return grouped;
  }, [mappings]);

  // Date conversion helpers
  const excelDateToISO = (serial: number): string => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const msPerDay = 86400000;
    const date = new Date(excelEpoch.getTime() + serial * msPerDay);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
    if (hours === 0 && minutes === 0) return dateStr;
    return `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const normalizeDate = (value: string): string => {
    if (!value || value.trim() === "") return value;
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(trimmed)) return trimmed;

    // Excel serial number: integer or decimal, e.g. 45733 or 45733.552777
    const asNum = Number(trimmed);
    if (!isNaN(asNum) && asNum > 1000 && asNum < 200000 && /^\d+(\.\d+)?$/.test(trimmed)) {
      return excelDateToISO(asNum);
    }

    const dmy = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmy) {
      const [, d, m, y] = dmy;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const ymd = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return trimmed;
  };

  const isDateTerm = (term: string) =>
    /date|Date|day|Day|eventDate|dateIdentified|georeferencedDate|CreateDate|agentRoleDate/.test(term);

  // Apply date conversion to a value if the term is date-related
  const maybeConvertDate = useCallback(
    (value: string, term: string): string => {
      if (!convertDatesToISO) return value;
      if (!isDateTerm(term)) return value;
      return normalizeDate(value);
    },
    [convertDatesToISO],
  );

  // Generate preview rows for a schema
  const getPreviewRows = useCallback(
    (termMappings: Record<string, string>) => {
      const dwcHeaders = Object.keys(termMappings);
      return data.slice(0, 5).map((row) => {
        const previewRow: Record<string, string> = {};
        dwcHeaders.forEach((term) => {
          const sourceCol = termMappings[term];
          const rawValue = String(row[sourceCol] ?? "");
          // Always show original value first
          previewRow[term] = rawValue;
          // Add converted ISO column when conversion is enabled and value changed
          if (convertDatesToISO && isDateTerm(term)) {
            const converted = maybeConvertDate(rawValue, term);
            if (converted !== rawValue && rawValue.trim() !== "") {
              previewRow[`${term}_ISO`] = converted;
            }
          }
        });
        return previewRow;
      });
    },
    [data, maybeConvertDate, convertDatesToISO],
  );

  // Generate CSV content for a given set of term->column mappings
  const generateCSV = useCallback(
    (termMappings: Record<string, string>) => {
      const dwcHeaders = Object.keys(termMappings);
      
      // Build headers: original column first, then _ISO converted column if enabled
      const csvHeaders: string[] = [];
      dwcHeaders.forEach((term) => {
        csvHeaders.push(term);
        if (convertDatesToISO && isDateTerm(term)) {
          csvHeaders.push(`${term}_ISO`);
        }
      });
      
      const csvRows: string[] = [csvHeaders.join(",")];

      data.forEach((row) => {
        const rowValues: string[] = [];
        dwcHeaders.forEach((dwcTerm) => {
          const sourceColumn = termMappings[dwcTerm];
          const rawValue = String(row[sourceColumn] ?? "");
          const escape = (v: string) => {
            if (v.includes(",") || v.includes('"') || v.includes("\n")) {
              return `"${v.replace(/"/g, '""')}"`;
            }
            return v;
          };
          // Original value always first
          rowValues.push(escape(rawValue));
          // Converted ISO value added after if enabled
          if (convertDatesToISO && isDateTerm(dwcTerm)) {
            const converted = maybeConvertDate(rawValue, dwcTerm);
            rowValues.push(escape(converted));
          }
        });
        csvRows.push(rowValues.join(","));
      });

      const BOM = "\uFEFF";
      return BOM + csvRows.join("\n");
    },
    [data, maybeConvertDate, convertDatesToISO],
  );

  // Download a single CSV file
  const downloadFile = useCallback((content: string, name: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Download as ZIP helper
  const downloadZip = useCallback(async (files: { name: string; content: string }[], zipName: string) => {
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Download all DwC files as ZIP
  const handleDownloadAll = useCallback(() => {
    const grouped = getMappingsBySchema();
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const files = Object.entries(grouped).map(([schemaId, termMappings]) => ({
      name: `${schemaId}_${baseName}.csv`,
      content: generateCSV(termMappings),
    }));
    downloadZip(files, `${baseName}_dwc-dp.zip`);
  }, [getMappingsBySchema, generateCSV, downloadZip, fileName]);

  // Download single schema CSV (keep as direct download)
  const handleDownloadSchema = useCallback(
    (schemaId: string) => {
      const grouped = getMappingsBySchema();
      const termMappings = grouped[schemaId];
      if (!termMappings) return;
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const csv = generateCSV(termMappings);
      downloadFile(csv, `${schemaId}_${baseName}.csv`);
    },
    [getMappingsBySchema, generateCSV, downloadFile, fileName],
  );

  const groupedMappings = getMappingsBySchema();
  const schemasWithMappings = Object.keys(groupedMappings);

  // Classify schemas as optimal or optional
  const classifiedSchemas = useMemo(() => {
    const optimalIds = new Set(optimalLayout.map(o => o.schemaId));
    const optimal: string[] = [];
    const optional: string[] = [];
    
    schemasWithMappings.forEach(schemaId => {
      const fullSchema = schemaTerms[schemaId];
      if (!fullSchema) { optional.push(schemaId); return; }
      const hasReqFields = fullSchema.required.length > 0;
      const allReqMapped = !hasReqFields || fullSchema.required.every(t => mappings[t]);
      if (optimalIds.has(schemaId) && allReqMapped) {
        optimal.push(schemaId);
      } else {
        optional.push(schemaId);
      }
    });
    return { optimal, optional };
  }, [optimalLayout, schemasWithMappings, mappings]);

  // Download filtered schemas as ZIP
  const handleDownloadFiltered = useCallback((filter: 'optimal' | 'optional') => {
    const grouped = getMappingsBySchema();
    const ids = filter === 'optimal' ? classifiedSchemas.optimal : classifiedSchemas.optional;
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const files = ids
      .map(schemaId => {
        const termMappings = grouped[schemaId];
        if (!termMappings) return null;
        return { name: `${schemaId}_${baseName}.csv`, content: generateCSV(termMappings) };
      })
      .filter(Boolean) as { name: string; content: string }[];
    downloadZip(files, `${baseName}_${filter}.zip`);
  }, [getMappingsBySchema, classifiedSchemas, generateCSV, downloadZip, fileName]);

  // Download selected schemas as ZIP
  const handleDownloadSelected = useCallback(() => {
    if (selectedForDownload.size === 0) return;
    const grouped = getMappingsBySchema();
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const files = [...selectedForDownload]
      .map(schemaId => {
        const termMappings = grouped[schemaId];
        if (!termMappings) return null;
        return { name: `${schemaId}_${baseName}.csv`, content: generateCSV(termMappings) };
      })
      .filter(Boolean) as { name: string; content: string }[];
    downloadZip(files, `${baseName}_selected.zip`);
  }, [selectedForDownload, getMappingsBySchema, generateCSV, downloadZip, fileName]);

  // Toggle schema selection for download
  const toggleSchemaSelection = useCallback((schemaId: string) => {
    setSelectedForDownload(prev => {
      const next = new Set(prev);
      if (next.has(schemaId)) next.delete(schemaId);
      else next.add(schemaId);
      return next;
    });
  }, []);

  const selectedSchemaInfo = schemaTypes.find((s) => s.id === selectedSchema);

  return (
    <>
      {showTutorial && (
        <SchemaMapperTutorial
          phase={tutorialPhase}
          onComplete={() => {
            if (tutorialPhase === 1) {
              try { localStorage.setItem('dwc-mapper-tutorial-seen', '1'); } catch {}
            } else {
              try { localStorage.setItem('dwc-mapper-tutorial-phase2-seen', '1'); } catch {}
            }
            setShowTutorial(false);
          }}
          onSkip={() => {
            if (tutorialPhase === 1) {
              try { localStorage.setItem('dwc-mapper-tutorial-seen', '1'); } catch {}
            } else {
              try { localStorage.setItem('dwc-mapper-tutorial-phase2-seen', '1'); } catch {}
            }
            setShowTutorial(false);
          }}
        />
      )}
      <AnimatePresence>
        {showAutoMatch && autoMatchResults.length > 0 && (
          <AutoMatchDialog
            matches={autoMatchResults}
            onApply={handleAutoMatchApply}
            onDismiss={() => setShowAutoMatch(false)}
          />
        )}
      </AnimatePresence>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Button onClick={onBack} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Sparkles className="w-8 h-8 text-purple-400" />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("schema.title")}</h1>
              <p className="text-muted-foreground">{t("schema.subtitle")}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setTutorialPhase(1); setShowTutorial(true); }}
              className="text-xs border-primary/30 text-primary hover:bg-primary/10"
            >
              {t("mapperTutorial.replay")}
            </Button>
          </div>
        </motion.div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Your Columns */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card data-tour="columns-panel" className="bg-card/90 border-border backdrop-blur h-full">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-card-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                    {t("schema.yourColumns")} ({columns.length})
                  </span>
                  <Badge variant="secondary">
                    {data.length} {t("schema.rows")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 max-h-[60vh] overflow-y-auto space-y-2">
                {/* Mobile hint */}
                <p className="text-xs text-muted-foreground md:hidden mb-2 flex items-center gap-1">
                  👆 {t("core.tapToSelect")}
                </p>
                {/* Selected column banner (mobile) */}
                {selectedColumn && (
                  <div className="md:hidden p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/50 text-indigo-200 text-sm flex items-center gap-2 mb-2">
                    <span>👆</span>
                    {t("core.selectedColumn", { column: selectedColumn })}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedColumn(null)}
                      className="ml-auto h-5 px-1 text-indigo-300"
                    >
                      ✕
                    </Button>
                  </div>
                )}
                {columns.map((column, idx) => {
                  const mappedTo = getColumnMapping(column);
                  const allMappedTo = getAllColumnMappings(column);
                  const isSelected = selectedColumn === column;
                  const isIdColumn = isMultiMapColumn(column);
                  return (
                    <motion.div
                      key={column}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, column)}
                        onDragEnd={() => setDraggedColumn(null)}
                        onClick={() => handleTapSelectColumn(column)}
                        className={`
                                                    p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all
                                                    md:cursor-grab cursor-pointer
                                                    ${
                                                      isSelected
                                                        ? "border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-400/50"
                                                        : mappedTo
                                                          ? "border-green-500/50 bg-green-500/10"
                                                          : "border-border bg-muted/50 hover:border-purple-500/50"
                                                    }
                                                    ${draggedColumn === column ? "opacity-50 scale-95" : ""}
                                                `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-muted-foreground md:hidden flex-shrink-0" />
                            <span className="font-semibold text-foreground">{column}</span>
                            {isIdColumn && allMappedTo.length > 1 && (
                              <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                ×{allMappedTo.length}
                              </Badge>
                            )}
                          </div>
                          {isSelected && <MousePointerClick className="w-4 h-4 text-indigo-400 animate-pulse" />}
                          {allMappedTo.length > 0 && !isSelected && (
                            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                              {allMappedTo.slice(0, 5).map(term => (
                                <Badge
                                  key={term}
                                  variant="outline"
                                  className="text-green-400 border-green-500/50 text-[10px] px-1 cursor-pointer hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMapping(term);
                                  }}
                                  title={`Kliknij aby usunąć mapowanie → ${term}`}
                                >
                                  → {term} ✕
                                </Badge>
                              ))}
                              {allMappedTo.length > 5 && (
                                <Badge variant="outline" className="text-green-400 border-green-500/50 text-[10px] px-1">
                                  +{allMappedTo.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {t("schema.samplePrefix")} {getSampleValues(column) || "—"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: All Schema Terms */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card data-tour="schemas-panel" className="bg-card/90 border-border backdrop-blur h-full flex flex-col">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  Wszystkie schematy DwC-DP
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {Object.keys(schemaTerms).length} schematów
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                {/* Search - cross-schema */}
                <div className="relative mb-4">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={`${t("schema.searchFields")} (${t("schema.allSchemas") || "all schemas"})…`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-muted-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Map all optional button */}
                {(() => {
                  // Check if there are any optional schemas
                  const hasOptional = allSchemasFiltered.some(({ schemaId }) => {
                    const fullSchema = schemaTerms[schemaId];
                    if (!fullSchema) return false;
                    const missing = fullSchema.required.filter(t => !mappings[t]);
                    if (missing.length === 0) return false;
                    return missing.every(reqTerm =>
                      Object.entries(schemaTerms).some(([otherId, otherSchema]) => {
                        if (otherId === schemaId) return false;
                        return (otherSchema.required.includes(reqTerm) || otherSchema.optional.includes(reqTerm)) && mappings[reqTerm];
                      })
                    );
                  });
                  if (!hasOptional) return null;
                  return (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mb-3 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs"
                      onClick={() => {
                        updateMappings((prev) => {
                          const newMappings = { ...prev };
                          for (const [schemaId, schema] of Object.entries(schemaTerms)) {
                            const missing = schema.required.filter(t => !newMappings[t]);
                            if (missing.length === 0) continue;
                            const isOpt = missing.every(reqTerm =>
                              Object.entries(schemaTerms).some(([otherId, otherSchema]) => {
                                if (otherId === schemaId) return false;
                                return (otherSchema.required.includes(reqTerm) || otherSchema.optional.includes(reqTerm)) && newMappings[reqTerm];
                              })
                            );
                            if (!isOpt) continue;
                            [...schema.required, ...schema.optional].forEach((term) => {
                              if (!newMappings[term]) {
                                const match = findBestColumnMatch(term, columns);
                                if (match) newMappings[term] = match;
                              }
                            });
                          }
                          return newMappings;
                        });
                      }}
                    >
                      ⚡ Mapuj wszystkie opcjonalne
                    </Button>
                  );
                })()}

                {/* All schemas, grouped, filterable */}
                <div className="flex-1 max-h-[50vh] overflow-y-auto space-y-4">
                  {allSchemasFiltered.length > 0 ? (
                    <>
                      {/* Show schemas prioritized by optimal layout */}
                      {(() => {
                        // Sort: schemas with mappings first, then optimal layout order, then rest
                        const optimalIds = new Set(optimalLayout.map(o => o.schemaId));
                        const mappedIds = new Set(schemasWithMappings);
                        
                        const sorted = [...allSchemasFiltered].sort((a, b) => {
                          const aMapped = [...a.required, ...a.optional].filter(t => mappings[t]).length;
                          const bMapped = [...b.required, ...b.optional].filter(t => mappings[t]).length;
                          const aHasMappings = mappedIds.has(a.schemaId);
                          const bHasMappings = mappedIds.has(b.schemaId);
                          
                          // Check if all required fields are satisfied
                          const aFullSchema = schemaTerms[a.schemaId];
                          const bFullSchema = schemaTerms[b.schemaId];
                          const aMissingReq = aFullSchema?.required.filter(t => !mappings[t]).length || 0;
                          const bMissingReq = bFullSchema?.required.filter(t => !mappings[t]).length || 0;
                          const aReqOk = aMissingReq === 0;
                          const bReqOk = bMissingReq === 0;
                          
                          // Priority: mapped schemas first, then req satisfied before not, then by mapped count desc
                          if (aHasMappings !== bHasMappings) return bHasMappings ? 1 : -1;
                          if (aHasMappings && bHasMappings) {
                            if (aReqOk !== bReqOk) return aReqOk ? -1 : 1;
                            return bMapped - aMapped;
                          }
                          const aOptimal = optimalIds.has(a.schemaId);
                          const bOptimal = optimalIds.has(b.schemaId);
                          if (aOptimal !== bOptimal) return aOptimal ? -1 : 1;
                          return 0;
                        });
                        
                        const dismissed = sorted.filter(s => dismissedSchemas.has(s.schemaId));
                        const visible = sorted.filter(s => !dismissedSchemas.has(s.schemaId));
                        
                        return (<>
                        {visible.map(({ schemaId, schemaName, required: req, optional: opt }) => {
                          const info = schemaTypes.find(s => s.id === schemaId);
                          const isOptimal = optimalIds.has(schemaId);
                          const hasMappings = mappedIds.has(schemaId);
                          const mappedCount = [...req, ...opt].filter(t => mappings[t]).length;
                          const totalVisible = req.length + opt.length;

                          // Check if schema is "optional" — required fields missing but
                          // could be satisfied by columns already mapped in other schemas
                          const fullSchema = schemaTerms[schemaId];
                          const missingRequired = fullSchema?.required.filter(t => !mappings[t]) || [];
                          const allRequiredSatisfied = missingRequired.length === 0;
                          const isOptionalSchema = !allRequiredSatisfied && missingRequired.length > 0 && missingRequired.every(reqTerm => {
                            return Object.entries(schemaTerms).some(([otherId, otherSchema]) => {
                              if (otherId === schemaId) return false;
                              return (otherSchema.required.includes(reqTerm) || otherSchema.optional.includes(reqTerm)) && mappings[reqTerm];
                            });
                          });

                          // Mapped schemas collapsed; search results open if small
                          const shouldBeOpen = !hasMappings && (searchTerm.length > 0 && totalVisible <= 15);
                          
                          return (
                            <details
                              key={schemaId}
                              open={shouldBeOpen}
                              className={`rounded-xl border transition-colors ${
                                isOptimal ? 'border-emerald-500/50 bg-emerald-500/5' :
                                hasMappings ? 'border-green-500/30 bg-green-500/5' :
                                isOptionalSchema ? 'border-amber-500/30 bg-amber-500/5' :
                                'border-border bg-muted/20'
                              }`}
                            >
                              <summary className="flex items-center gap-2 p-3 cursor-pointer select-none hover:bg-muted/30 rounded-xl">
                                {info && (
                                  <div className={`p-1 rounded ${info.color} flex-shrink-0`}>
                                    <info.icon className="w-3 h-3 text-white" />
                                  </div>
                                )}
                                <span className="font-semibold text-sm text-foreground flex-1">{schemaName}</span>
                                {isOptionalSchema && (
                                  <>
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] h-4 px-1">
                                      opcjonalna
                                    </Badge>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateMappings((prev) => {
                                          const newMappings = { ...prev };
                                          const allTerms = [...fullSchema.required, ...fullSchema.optional];
                                          allTerms.forEach((term) => {
                                            if (!newMappings[term]) {
                                              const match = findBestColumnMatch(term, columns);
                                              if (match) newMappings[term] = match;
                                            }
                                          });
                                          return newMappings;
                                        });
                                      }}
                                      className="text-[10px] h-4 px-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40 hover:text-amber-200 transition-colors"
                                    >
                                      ⚡ Mapuj
                                    </button>
                                  </>
                                )}
                                {mappedCount > 0 && !isOptionalSchema && (
                                  (() => {
                                    const hasReqFields = fullSchema && fullSchema.required.length > 0;
                                    const allReqMapped = !hasReqFields || fullSchema.required.every(t => mappings[t]);
                                    const showOptimal = isOptimal && allReqMapped;
                                    return (
                                      <Badge 
                                        className={`${showOptimal 
                                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                          : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                        } text-[10px] h-4 px-1 cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors`}
                                        title={t('schema.dismissSchema')}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissedSchemas(prev => new Set([...prev, schemaId])); }}
                                      >
                                        {showOptimal ? `✓ ${t('schema.optimal')}` : t('schema.optionalTable')} ✕
                                      </Badge>
                                    );
                                  })()
                                )}
                                {mappedCount > 0 && (
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                    {mappedCount} zmapowanych
                                  </Badge>
                                )}
                                {hasMappings && (
                                  <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                )}
                                <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground">
                                  {req.length}+{opt.length}
                                </Badge>
                              </summary>
                              <div className="px-3 pb-3 space-y-2">
                                {isOptionalSchema && (
                                  <p className="text-[10px] text-amber-400 mb-1">
                                    ℹ Wymagane pola ({missingRequired.join(', ')}) są już zmapowane w innych tabelach. Kliknij „⚡ Mapuj" aby automapować.
                                  </p>
                                )}
                                {req.length > 0 && (
                                  <div>
                                    <p className="text-[10px] text-orange-400 font-semibold mb-1 uppercase tracking-wider">Wymagane</p>
                                    {req.map(term => (
                                      <TermDropZone
                                        key={`${schemaId}-${term}`}
                                        termName={term}
                                        mappedColumn={mappings[term]}
                                        isRequired={true}
                                        onDrop={handleDrop}
                                        onRemove={handleRemoveMapping}
                                        onTapAssign={handleTapAssignTerm}
                                        hasSelectedColumn={!!selectedColumn}
                                      />
                                    ))}
                                  </div>
                                )}
                                {opt.length > 0 && (
                                  <div>
                                    <p className="text-[10px] text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Opcjonalne ({opt.length})</p>
                                    {[...opt].sort((a, b) => {
                                      const aMapped = mappings[a] ? 0 : 1;
                                      const bMapped = mappings[b] ? 0 : 1;
                                      return aMapped - bMapped;
                                    }).map(term => (
                                      <TermDropZone
                                        key={`${schemaId}-${term}`}
                                        termName={term}
                                        mappedColumn={mappings[term]}
                                        isRequired={false}
                                        onDrop={handleDrop}
                                        onRemove={handleRemoveMapping}
                                        onTapAssign={handleTapAssignTerm}
                                        hasSelectedColumn={!!selectedColumn}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </details>
                          );
                        })}
                        {dismissed.length > 0 && (
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground mb-1">{t('schema.dismissed')} ({dismissed.length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {dismissed.map(({ schemaId, schemaName }) => (
                                <Badge 
                                  key={schemaId}
                                  variant="outline" 
                                  className="text-[10px] h-5 px-1.5 cursor-pointer text-muted-foreground hover:text-foreground hover:border-emerald-500/50 transition-colors"
                                  onClick={() => setDismissedSchemas(prev => { const next = new Set(prev); next.delete(schemaId); return next; })}
                                >
                                  + {schemaName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        </>);
                      })()}
                      {searchTerm && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          {allSchemasFiltered.reduce((sum, s) => sum + s.required.length + s.optional.length, 0)} wyników w {allSchemasFiltered.length} schematach
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                      Brak wyników dla „{searchTerm}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div data-tour="auto-map-btn" className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                  <div className="flex gap-3">
                    <Button onClick={handleAutoMap} variant="outline" className="flex-1">
                      {t("schema.mapRequired")}
                    </Button>
                    <Button onClick={handleReset} variant="ghost" className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4 mr-1" />
                      {t("schema.reset")}
                    </Button>
                  </div>
                  <Button
                    onClick={handleDetectHeaders}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs border-cyan-500/40 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {t("schema.detectHeaders")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Optimal Layout Panel */}
        {optimalLayout.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-6"
          >
            <Card data-tour="optimal-layout" className="bg-card/90 border-border backdrop-blur">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
                  <Minimize2 className="w-5 h-5 text-emerald-400" />
                  {t('schema.optimalLayout')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('schema.optimalDescription', { fields: Object.keys(mappings).length, tables: optimalLayout.length })}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {optimalLayout.map(({ schemaId, terms, required }) => {
                    const info = schemaTypes.find(s => s.id === schemaId);
                    return (
                      <div
                        key={schemaId}
                        className="p-3 rounded-xl border border-border bg-muted/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                        onClick={() => { handleSchemaChange(schemaId); setSearchTerm(""); }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {info && (
                            <div className={`p-1 rounded ${info.color}`}>
                              <info.icon className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span className="font-semibold text-sm text-foreground">{info?.name || schemaId}</span>
                          {(() => {
                            const schema = schemaTerms[schemaId];
                            const hasReqFields = schema && schema.required.length > 0;
                            return (
                              <Badge className={`text-[10px] h-4 px-1 ${hasReqFields ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                                {hasReqFields ? `✓ ${t('schema.optimal')}` : t('schema.optionalTable')}
                              </Badge>
                            );
                          })()}
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-auto">{terms.length} {t('schema.fieldsCount')}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {terms.slice(0, 8).map(term => (
                            <Badge key={term} variant="outline" className="text-[10px] text-muted-foreground border-border">
                              {term}
                            </Badge>
                          ))}
                          {terms.length > 8 && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                              +{terms.length - 8}
                            </Badge>
                          )}
                        </div>
                        {required.length > 0 && (
                          <p className="text-[10px] text-orange-400 mt-1.5">
                            ⚠ Brak wymaganych: {required.join(', ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Download Panel */}
        {schemasWithMappings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6"
          >
            <Card data-tour="download-panel" className="bg-card/90 border-border backdrop-blur">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
                  <Download className="w-5 h-5 text-amber-400" />
                  {t("schema.downloadPackage")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t("schema.downloadPackageDesc")}</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Date conversion button */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <CalendarClock className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{t("schema.dateConversion")}</p>
                    <p className="text-xs text-muted-foreground">{t("schema.dateConversionDesc")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={convertDatesToISO ? "default" : "outline"}
                    onClick={() => {
                      setConvertDatesToISO((prev) => !prev);
                      // Auto-open preview of first schema with mappings
                      if (!convertDatesToISO && schemasWithMappings.length > 0 && !previewSchemaId) {
                        setPreviewSchemaId(schemasWithMappings[0]);
                      }
                    }}
                    className={convertDatesToISO ? "bg-cyan-600 hover:bg-cyan-700 text-white" : ""}
                  >
                    <CalendarClock className="w-4 h-4 mr-1" />
                    {convertDatesToISO ? t("schema.datesConverted") : t("schema.convertDates")}
                  </Button>
                </div>

                {/* File cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {schemasWithMappings.map((schemaId) => {
                    const info = schemaTypes.find((s) => s.id === schemaId);
                    const termCount = Object.keys(groupedMappings[schemaId]).length;
                    const isPreviewOpen = previewSchemaId === schemaId;
                    const isSelected = selectedForDownload.has(schemaId);
                    return (
                      <div key={schemaId} className="flex flex-col gap-1">
                        <div
                          onClick={() => toggleSchemaSelection(schemaId)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                              : isPreviewOpen
                                ? "border-cyan-500/50 bg-cyan-500/10"
                                : "border-border bg-muted/50 hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          {info && (
                            <div className={`p-1.5 rounded-lg ${info.color}`}>
                              <info.icon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{schemaId}.csv</p>
                            <p className="text-xs text-muted-foreground">
                              {termCount} {t("schema.columns")}, {data.length} {t("schema.rows")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewSchemaId(isPreviewOpen ? null : schemaId)}
                            className="flex-1 h-7 text-xs text-muted-foreground hover:text-cyan-400"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            {t("schema.preview")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadSchema(schemaId)}
                            className="flex-1 h-7 text-xs text-muted-foreground hover:text-amber-400"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Preview table */}
                <AnimatePresence>
                  {previewSchemaId && groupedMappings[previewSchemaId] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border border-border bg-muted/30 overflow-x-auto">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">
                            {previewSchemaId}.csv — {t("schema.previewFirst5")}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewSchemaId(null)}
                            className="h-6 px-2 text-muted-foreground"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="overflow-x-auto">
                          {(() => {
                            const previewRows = getPreviewRows(groupedMappings[previewSchemaId]);
                            const allHeaders = previewRows.length > 0
                              ? Object.keys(previewRows[0])
                              : Object.keys(groupedMappings[previewSchemaId]);
                            return (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border">
                                {allHeaders.map((term) => {
                                  const isOriginal = term.endsWith('_original');
                                  return (
                                  <th
                                    key={term}
                                    className={`px-3 py-2 text-left font-mono font-semibold whitespace-nowrap ${isOriginal ? 'text-amber-400/70 italic' : 'text-foreground'}`}
                                  >
                                    {isOriginal ? term.replace('_original', ' (oryginał)') : term}
                                    {isDateTerm(term) && convertDatesToISO && !isOriginal && (
                                      <CalendarClock className="inline w-3 h-3 ml-1 text-cyan-400" />
                                    )}
                                  </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {previewRows.map((row, i) => (
                                <tr key={i} className="border-b border-border/30">
                                  {allHeaders.map((term, j) => {
                                    const isOriginal = term.endsWith('_original');
                                    return (
                                    <td
                                      key={j}
                                      className={`px-3 py-1.5 whitespace-nowrap max-w-[180px] truncate ${
                                        isOriginal ? 'text-amber-400/60 italic' :
                                        isDateTerm(term) && convertDatesToISO ? 'text-cyan-500 font-medium' : 'text-muted-foreground'
                                      }`}
                                    >
                                      {row[term] || "—"}
                                    </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Button
                    onClick={handleDownloadAll}
                    variant="outline"
                    className="w-full py-5 text-base border-amber-500 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t("schema.downloadAll")} ZIP ({schemasWithMappings.length} {t("schema.files")})
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleDownloadFiltered('optimal')}
                      variant="outline"
                      disabled={classifiedSchemas.optimal.length === 0}
                      className="py-3 text-sm border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-40"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      {t("schema.downloadOptimal")} ({classifiedSchemas.optimal.length})
                    </Button>
                    <Button
                      onClick={() => handleDownloadFiltered('optional')}
                      variant="outline"
                      disabled={classifiedSchemas.optional.length === 0}
                      className="py-3 text-sm border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 disabled:opacity-40"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      {t("schema.downloadOptional")} ({classifiedSchemas.optional.length})
                    </Button>
                    <Button
                      onClick={handleDownloadSelected}
                      variant="outline"
                      disabled={selectedForDownload.size === 0}
                      className="py-3 text-sm border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-40"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      {t("schema.downloadSelected")} ({selectedForDownload.size})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex gap-4"
        >
          <Button
            onClick={handleComplete}
            disabled={!allRequiredMapped}
            className={`flex-1 py-6 text-lg ${
              allRequiredMapped
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {allRequiredMapped ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                {t("schema.continueValidation")}
              </span>
            ) : (
              <span>{t("schema.mapAllRequired")}</span>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
    </>
  );
}

// Term Drop Zone Component
interface TermDropZoneProps {
  termName: string;
  mappedColumn?: string;
  isRequired: boolean;
  onDrop: (e: React.DragEvent, termName: string) => void;
  onRemove: (termName: string) => void;
  onTapAssign?: (termName: string) => void;
  hasSelectedColumn?: boolean;
}

function TermDropZone({
  termName,
  mappedColumn,
  isRequired,
  onDrop,
  onRemove,
  onTapAssign,
  hasSelectedColumn = false,
}: TermDropZoneProps) {
  const { t, language } = useLanguage();
  const [isOver, setIsOver] = useState(false);
  const term = dwcTerms[termName];
  const termDescription = term
    ? language === "fr" && term.descriptionFR
      ? term.descriptionFR
      : language === "de" && term.descriptionDE
        ? term.descriptionDE
        : language === "en" && term.descriptionEN
          ? term.descriptionEN
          : term.description
    : null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    onDrop(e, termName);
  };

  const handleClick = () => {
    if (hasSelectedColumn && !mappedColumn) {
      onTapAssign?.(termName);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
                p-4 rounded-xl border-2 transition-all
                ${isOver ? "border-purple-500 bg-purple-500/20 scale-[1.02]" : ""}
                ${hasSelectedColumn && !mappedColumn ? "border-indigo-400 bg-indigo-500/20 border-dashed animate-pulse cursor-pointer" : ""}
                ${
                  !isOver && !hasSelectedColumn && mappedColumn
                    ? "border-green-500/50 bg-green-500/10"
                    : !isOver && !hasSelectedColumn && !mappedColumn
                      ? isRequired
                        ? "border-dashed border-orange-500/50 bg-orange-500/5"
                        : "border-dashed border-border bg-muted/30"
                      : ""
                }
            `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm font-semibold text-foreground">{termName}</span>
            {isRequired && <Badge className="bg-orange-500/80 text-white text-xs">{t("schema.required")}</Badge>}
            {term?.category && (
              <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 text-xs">
                {term.category === "core" ? "Core IDs" : term.category}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{termDescription || term?.description || "Darwin Core term"}</p>
        </div>
        {hasSelectedColumn && !mappedColumn && (
          <MousePointerClick className="w-4 h-4 text-indigo-400 animate-bounce flex-shrink-0" />
        )}
        {mappedColumn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(termName);
            }}
            className="text-muted-foreground hover:text-red-400 h-6 px-2"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {mappedColumn ? (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-sm text-green-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {mappedColumn}
          </p>
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3" />
            {t("schema.dragHere")}
          </p>
          {term?.example && (
            <p className="text-xs text-muted-foreground mt-1">
              {t("schema.examplePrefix")} <code className="text-foreground/70">{term.example}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
