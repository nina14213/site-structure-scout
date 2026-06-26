DwC Data Quest v1.0 – Release Notes
________________________________________
Project Overview & Main Aim
DwC Data Quest is an interactive web application designed to bridge the "data mobilization gap" in biodiversity informatics. Its primary aim is to transform the technical hurdle of data standardization into a guided, hands-on journey, helping users learn, practice, and apply the workflows needed to prepare publishable, standards-compliant datasets for GBIF.
The project specifically supports the DwC Data Package (DwC-DP) standard, ratified by GBIF on 23 June 2026, making it a timely and relevant tool for the global community.
________________________________
Key Features: The Learning Quest
The application is organized as a sequence of practical missions, each representing a critical step in biodiversity data preparation.
Column Mapping: An interactive drag-and-drop module where users match raw source columns to Darwin Core terms.
Extension Network: A module teaching users how to link core records with extensions (e.g., event-to-occurrence relationships) while checking referential integrity. It features both a Classic learning mode and a gamified Arcade escape-room style.
Data Packaging: A mission focused on metadata generation (descriptions, creators, and licenses) leading to the creation of meta.xml and datapackage.json.
Species Hunter: A taxonomic module where users practice resolving typos and synonyms against the GBIF Backbone concepts.
BOSS: Validation: A final challenge that simulates real publication blockers, such as broken identifiers, malformed dates, and coordinate problems, to build good data habits.
_________________________________
Production Utility: "Create Your Data Package"
Beyond education, the tool serves as a practical utility for researchers and scientific teams.
Multi-format Import: Supports CSV, TXT, and XLSX files with a live data preview.
Automated Assistance: Includes automatic header detection, suggested mappings for similar terms, and automatic unique identifier generation to ensure data integrity.
Standardization Tools: Allows for the transformation of dates into ISO format while preserving the original data for user convenience.
Customization: Users can include custom columns not compatible with DwC terms in their final tables, ensuring the tool fits their specific research needs.
__________________________________
Technical & Accessibility Specifications
Accessibility: Designed to meet WCAG 2.1/2.2 AA standards, featuring a panel for text size adjustment and Light/Dark mode toggles.
No Installation Required: A fully responsive, web-based solution accessible via any modern browser on laptops, desktops, or mobile devices.
Real-time Accuracy: Every time the app launches, it verifies terms against the official GBIF GitHub repository, ensuring definitions are always synchronized with the latest standards.
Privacy & Persistence: User data is not collected; settings and mission progress are stored locally in browser cookies, allowing users to resume work seamlessly.
Multilingual Support: Currently available in English and Polish, with French and German versions in development.
___________________________________
Impact and Open Science Commitment
DwC Data Quest is a newly assembled solution tailored to improve data literacy and readiness. It is built with a commitment to Open Science and will be released under a clear open-source license, allowing institutions worldwide to adapt, translate, or extend the tool for local training.
__________________________________
Developed by:
Katarzyna Słupecka (Biological Spatial Information Laboratory, Adam Mickiewicz University)
Krystian Mateusz Florkowski (Biodiversity Digitization Laboratory, Adam Mickiewicz University)
