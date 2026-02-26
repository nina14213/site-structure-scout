import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ArrowLeft, 
    Sparkles,
    FileSpreadsheet,
    Users,
    Target,
    Calendar,
    Image,
    Search as SearchIcon,
    Grid3X3,
    RotateCcw,
    Check,
    X,
    Download
} from 'lucide-react';
import { dwcTerms } from './DwCTerms';
import { useLanguage } from '@/i18n/LanguageContext';

// Darwin Core Data Package schema types based on https://gbif.github.io/dwc-dp/qrg/
const schemaTypes = [
    { id: 'event', name: 'Event', icon: Grid3X3, color: 'bg-purple-600' },
    { id: 'occurrence', name: 'Occurrence', icon: Target, color: 'bg-rose-600' },
    { id: 'organism', name: 'Organism', icon: Users, color: 'bg-emerald-600' },
    { id: 'material', name: 'Material Entity', icon: Calendar, color: 'bg-amber-600' },
    { id: 'media', name: 'Media', icon: Image, color: 'bg-blue-600' },
    { id: 'identification', name: 'Identification', icon: SearchIcon, color: 'bg-cyan-600' },
];

// Schema-specific required/optional terms based on DwC-DP Quick Reference Guide
// Source: https://gbif.github.io/dwc-dp/qrg/
const schemaTerms: Record<string, { required: string[]; optional: string[] }> = {
    event: {
        // Only eventID is required for Event table per DwC-DP QRG
        required: ['eventID'],
        optional: [
            'parentEventID', 'preferredEventName', 'eventCategory', 'eventType', 
            'datasetName', 'datasetID', 'fieldNumber', 'eventConductedBy', 'eventConductedByID',
            'eventDate', 'eventTime', 'startDayOfYear', 'endDayOfYear', 'year', 'month', 'day',
            'verbatimEventDate', 'verbatimLocality', 'verbatimElevation', 'verbatimDepth',
            'verbatimCoordinates', 'verbatimLatitude', 'verbatimLongitude', 'verbatimCoordinateSystem',
            'verbatimSRS', 'higherGeography', 'higherGeographyID', 'continent', 'waterBody',
            'islandGroup', 'island', 'country', 'countryCode', 'stateProvince', 'county',
            'municipality', 'locality', 'minimumElevationInMeters', 'maximumElevationInMeters',
            'minimumDepthInMeters', 'maximumDepthInMeters', 'decimalLatitude', 'decimalLongitude',
            'geodeticDatum', 'coordinateUncertaintyInMeters', 'coordinatePrecision',
            'pointRadiusSpatialFit', 'footprintWKT', 'footprintSRS', 'footprintSpatialFit',
            'georeferencedBy', 'georeferencedByID', 'georeferencedDate', 'georeferenceProtocol',
            'georeferenceProtocolID', 'georeferenceSources', 'georeferenceRemarks',
            'habitat', 'samplingProtocol', 'samplingEffort', 'sampleSizeValue', 'sampleSizeUnit',
            'eventRemarks', 'fieldNotes', 'informationWithheld', 'dataGeneralizations',
            'basisOfRecord'
        ],
    },
    occurrence: {
        // Only occurrenceID is required per DwC-DP QRG; basisOfRecord is recommended but not required
        required: ['occurrenceID'],
        optional: [
            'eventID', 'basisOfRecord', 'catalogNumber', 'recordNumber', 'recordedBy', 'recordedByID',
            'individualCount', 'organismQuantity', 'organismQuantityType',
            'sex', 'lifeStage', 'reproductiveCondition', 'caste', 'behavior',
            'vitality', 'establishmentMeans', 'degreeOfEstablishment', 'pathway',
            'georeferenceVerificationStatus', 'occurrenceStatus', 'occurrenceRemarks',
            'associatedMedia', 'associatedOccurrences', 'associatedReferences',
            'associatedSequences', 'associatedTaxa', 'otherCatalogNumbers',
            'preparations', 'disposition', 'informationWithheld', 'dataGeneralizations'
        ],
    },
    organism: {
        // Only organismID is required per DwC-DP QRG
        required: ['organismID'],
        optional: [
            'eventID', 'organismName', 'organismScope', 'associatedOccurrences', 'associatedOrganisms',
            'previousIdentifications', 'organismRemarks'
        ],
    },
    material: {
        // Only materialEntityID is required per DwC-DP QRG
        required: ['materialEntityID'],
        optional: [
            'eventID', 'materialEntityType', 'preparations', 'disposition', 'verbatimLabel',
            'associatedSequences', 'materialEntityRemarks'
        ],
    },
    media: {
        // Only mediaID is required per DwC-DP QRG
        required: ['mediaID'],
        optional: [
            'eventID', 'mediaType', 'accessURI', 'WebStatement', 'format', 'rights',
            'Owner', 'creator', 'CreateDate', 'description', 'caption',
            'associatedOccurrences', 'associatedOrganisms'
        ],
    },
    identification: {
        // Only identificationID is required per DwC-DP QRG
        required: ['identificationID'],
        optional: [
            'eventID', 'verbatimIdentification', 'identifiedBy', 'identifiedByID', 'dateIdentified',
            'identificationReferences', 'identificationVerificationStatus',
            'identificationRemarks', 'typeStatus', 'taxonID', 'scientificName',
            'scientificNameAuthorship', 'taxonRank', 'kingdom', 'phylum', 'class',
            'order', 'family', 'subfamily', 'genus', 'subgenus', 'specificEpithet',
            'infraspecificEpithet', 'cultivarEpithet', 'vernacularName'
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
    const { t } = useLanguage();
    const [selectedSchema, setSelectedSchema] = useState('event');
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

    const currentSchema = schemaTerms[selectedSchema];
    const allTerms = [...currentSchema.required, ...currentSchema.optional];

    // Filter terms by search
    const filteredRequired = currentSchema.required.filter(term => 
        term.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredOptional = currentSchema.optional.filter(term => 
        term.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get sample values for a column
    const getSampleValues = useCallback((columnName: string) => {
        return data.slice(0, 3).map(row => row[columnName]).filter(Boolean).join(', ');
    }, [data]);

    // Handle drag start
    const handleDragStart = (e: React.DragEvent, column: string) => {
        e.dataTransfer.setData('text/plain', column);
        setDraggedColumn(column);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent, termName: string) => {
        e.preventDefault();
        const columnName = e.dataTransfer.getData('text/plain');
        
        setMappings(prev => {
            const newMappings = { ...prev };
            // Remove previous mapping for this column
            Object.keys(newMappings).forEach(key => {
                if (newMappings[key] === columnName) delete newMappings[key];
            });
            newMappings[termName] = columnName;
            return newMappings;
        });
        setDraggedColumn(null);
    };

    // Remove mapping
    const handleRemoveMapping = (termName: string) => {
        setMappings(prev => {
            const newMappings = { ...prev };
            delete newMappings[termName];
            return newMappings;
        });
    };

    // Reset all mappings
    const handleReset = () => {
        setMappings({});
    };

    // Check if column is mapped
    const getColumnMapping = (columnName: string) => {
        return Object.entries(mappings).find(([, col]) => col === columnName)?.[0] || null;
    };

    // Auto-map required fields (basic matching)
    const handleAutoMap = () => {
        const newMappings: Record<string, string> = { ...mappings };
        
        currentSchema.required.forEach(term => {
            if (!newMappings[term]) {
                // Try to find a matching column
                const matchingColumn = columns.find(col => 
                    col.toLowerCase().includes(term.toLowerCase()) ||
                    term.toLowerCase().includes(col.toLowerCase().replace(/[^a-z]/g, ''))
                );
                if (matchingColumn) {
                    newMappings[term] = matchingColumn;
                }
            }
        });
        
        setMappings(newMappings);
    };

    // Check if all required fields are mapped
    const allRequiredMapped = currentSchema.required.every(term => mappings[term]);

    // Handle complete
    const handleComplete = () => {
        if (allRequiredMapped) {
            onComplete?.(mappings, selectedSchema);
        }
    };

    // Download CSV with DwC headers (UTF-8, WGS-84 only)
    const handleDownloadCSV = () => {
        // Get all mapped DwC terms as headers
        const dwcHeaders = Object.keys(mappings);
        
        // Check if data uses WGS-84 (look for geodeticDatum column or coordinate_system)
        const datumMapping = mappings['geodeticDatum'];
        const hasWGS84Data = data.every(row => {
            if (datumMapping) {
                const datum = row[datumMapping]?.toString().toUpperCase();
                return datum === 'WGS84' || datum === 'WGS 84' || datum === 'EPSG:4326';
            }
            // If no datum column mapped, check common column names
            const coordinateSystemCol = columns.find(col => 
                col.toLowerCase().includes('coordinate') || 
                col.toLowerCase().includes('datum') ||
                col.toLowerCase().includes('system')
            );
            if (coordinateSystemCol) {
                const value = row[coordinateSystemCol]?.toString().toUpperCase();
                return value === 'WGS84' || value === 'WGS 84' || value === 'EPSG:4326';
            }
            return true; // Assume WGS-84 if no datum info
        });

        if (!hasWGS84Data) {
            alert('Warning: Some data may not be in WGS-84 format. Only WGS-84 coordinates are included.');
        }

        // Build CSV content
        const csvRows: string[] = [];
        
        // Add header row with DwC terms
        csvRows.push(dwcHeaders.join(','));
        
        // Add data rows (only WGS-84)
        data.forEach(row => {
            // Check if this row is WGS-84
            const datumCol = datumMapping || columns.find(col => 
                col.toLowerCase().includes('coordinate') || 
                col.toLowerCase().includes('datum') ||
                col.toLowerCase().includes('system')
            );
            if (datumCol) {
                const datum = row[datumCol]?.toString().toUpperCase();
                if (datum && datum !== 'WGS84' && datum !== 'WGS 84' && datum !== 'EPSG:4326') {
                    return; // Skip non-WGS84 rows
                }
            }
            
            const rowValues = dwcHeaders.map(dwcTerm => {
                const sourceColumn = mappings[dwcTerm];
                const value = row[sourceColumn] ?? '';
                // Escape values with commas or quotes
                const strValue = String(value);
                if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
                    return `"${strValue.replace(/"/g, '""')}"`;
                }
                return strValue;
            });
            csvRows.push(rowValues.join(','));
        });

        // Create and download CSV with UTF-8 BOM
        const BOM = '\uFEFF';
        const csvContent = BOM + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dwc_${selectedSchema}_${fileName.replace(/\.[^/.]+$/, '')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const selectedSchemaInfo = schemaTypes.find(s => s.id === selectedSchema);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            onClick={onBack}
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                {t('schema.title')}
                            </h1>
                            <p className="text-muted-foreground">
                                {t('schema.subtitle')}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Schema Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <Card className="bg-card/90 border-border backdrop-blur">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">{t('schema.selectSchema')}</p>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {schemaTypes.map((schema) => {
                                    const Icon = schema.icon;
                                    const isSelected = selectedSchema === schema.id;
                                    return (
                                        <button
                                            key={schema.id}
                                            onClick={() => setSelectedSchema(schema.id)}
                                            className={`
                                                flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                                                ${isSelected 
                                                    ? 'border-purple-500 bg-purple-500/20' 
                                                    : 'border-border bg-muted/50 hover:border-muted-foreground'}
                                            `}
                                        >
                                            <div className={`p-2 rounded-lg ${schema.color}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {schema.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Main Content - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Your Columns */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-card/90 border-border backdrop-blur h-full">
                            <CardHeader className="border-b border-border">
                                <CardTitle className="text-card-foreground flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                                        {t('schema.yourColumns')} ({columns.length})
                                    </span>
                                    <Badge variant="secondary">
                                        {data.length} {t('schema.rows')}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 max-h-[60vh] overflow-y-auto space-y-2">
                                {columns.map((column, idx) => {
                                    const mappedTo = getColumnMapping(column);
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
                                                className={`
                                                    p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all
                                                    ${mappedTo 
                                                        ? 'border-green-500/50 bg-green-500/10' 
                                                        : 'border-border bg-muted/50 hover:border-purple-500/50'}
                                                    ${draggedColumn === column ? 'opacity-50 scale-95' : ''}
                                                `}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-semibold text-foreground">{column}</span>
                                                    {mappedTo && (
                                                        <Badge variant="outline" className="text-green-400 border-green-500/50 text-xs">
                                                            → {mappedTo}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {t('schema.samplePrefix')} {getSampleValues(column) || '—'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Right: Schema Terms */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-card/90 border-border backdrop-blur h-full flex flex-col">
                            <CardHeader className="border-b border-border">
                                <CardTitle className="text-card-foreground flex items-center gap-2">
                                    {selectedSchemaInfo && (
                                        <div className={`p-1.5 rounded-lg ${selectedSchemaInfo.color}`}>
                                            <selectedSchemaInfo.icon className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    {selectedSchemaInfo?.name} Schema
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1 flex flex-col">
                                {/* Search */}
                                <div className="relative mb-4">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        placeholder={t('schema.searchFields')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                {/* Tabs */}
                                <Tabs defaultValue="required" className="flex-1 flex flex-col">
                                    <TabsList className="w-full bg-muted mb-4">
                                        <TabsTrigger value="required" className="flex-1">
                                            {t('schema.required')} ({currentSchema.required.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="optional" className="flex-1">
                                            {t('schema.optional')} ({currentSchema.optional.length})
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex-1 max-h-[40vh] overflow-y-auto">
                                        <TabsContent value="required" className="mt-0 space-y-3">
                                            {filteredRequired.map(term => (
                                                <TermDropZone
                                                    key={term}
                                                    termName={term}
                                                    mappedColumn={mappings[term]}
                                                    isRequired={true}
                                                    onDrop={handleDrop}
                                                    onRemove={handleRemoveMapping}
                                                />
                                            ))}
                                        </TabsContent>

                                        <TabsContent value="optional" className="mt-0 space-y-3">
                                            {filteredOptional.map(term => (
                                                <TermDropZone
                                                    key={term}
                                                    termName={term}
                                                    mappedColumn={mappings[term]}
                                                    isRequired={false}
                                                    onDrop={handleDrop}
                                                    onRemove={handleRemoveMapping}
                                                />
                                            ))}
                                        </TabsContent>
                                    </div>
                                </Tabs>

                                {/* Actions */}
                                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                                    <Button
                                        onClick={handleAutoMap}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {t('schema.mapRequired')}
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        variant="ghost"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        {t('schema.reset')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 flex gap-4"
                >
                    <Button
                        onClick={handleDownloadCSV}
                        disabled={Object.keys(mappings).length === 0}
                        variant="outline"
                        className="py-6 text-lg border-amber-500 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        {t('schema.downloadCSV')}
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={!allRequiredMapped}
                        className={`flex-1 py-6 text-lg ${
                            allRequiredMapped
                            ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {allRequiredMapped ? (
                            <span className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                {t('schema.continueValidation')}
                            </span>
                        ) : (
                            <span>{t('schema.mapAllRequired')}</span>
                        )}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}

// Term Drop Zone Component
interface TermDropZoneProps {
    termName: string;
    mappedColumn?: string;
    isRequired: boolean;
    onDrop: (e: React.DragEvent, termName: string) => void;
    onRemove: (termName: string) => void;
}

function TermDropZone({ termName, mappedColumn, isRequired, onDrop, onRemove }: TermDropZoneProps) {
    const { t, language } = useLanguage();
    const [isOver, setIsOver] = useState(false);
    const term = dwcTerms[termName];
    const termDescription = term
        ? (language === 'fr' && term.descriptionFR ? term.descriptionFR
            : language === 'de' && term.descriptionDE ? term.descriptionDE
            : language === 'en' && term.descriptionEN ? term.descriptionEN
            : term.description)
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

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                p-4 rounded-xl border-2 transition-all
                ${isOver ? 'border-purple-500 bg-purple-500/20 scale-[1.02]' : ''}
                ${mappedColumn 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : isRequired 
                        ? 'border-dashed border-orange-500/50 bg-orange-500/5' 
                        : 'border-dashed border-border bg-muted/30'}
            `}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-semibold text-foreground">
                            {termName}
                        </span>
                        {isRequired && (
                            <Badge className="bg-orange-500/80 text-white text-xs">
                                {t('schema.required')}
                            </Badge>
                        )}
                        {term?.category && (
                            <Badge variant="outline" className="text-cyan-400 border-cyan-500/50 text-xs">
                                {term.category === 'core' ? 'Core IDs' : term.category}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {termDescription || term?.description || 'Darwin Core term'}
                    </p>
                </div>
                {mappedColumn && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(termName)}
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
                        {t('schema.dragHere')}
                    </p>
                    {term?.example && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('schema.examplePrefix')} <code className="text-foreground/70">{term.example}</code>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}