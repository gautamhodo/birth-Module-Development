# Birth Certificate Template Analysis

## Overview
This document provides a detailed analysis of the birth certificate template image (`frontend/src/assets/certifcate_text.png`) and documents the exact positioning, spacing, and formatting specifications required for precise template replication.

## Template Structure Analysis

### Page Layout
- **Format**: A4 (210mm x 297mm)
- **Orientation**: Portrait
- **Margins**: 20mm on all sides
- **Content Area**: 170mm x 257mm
- **Border Style**: Double border (main + decorative inner border)

### Header Section (Y: 30-90mm)
1. **Logo Placement**
   - Position: Top-left at (30mm, 30mm)
   - Size: 35mm width x 23mm height
   - Style: HODO Hospital logo with medical cross

2. **Title Section**
   - Main Title: "CERTIFICATE OF BIRTH" at (105mm, 60mm)
   - Font: 20pt, Bold, Centered
   - Hospital Name: "HODO HOSPITAL, KAZHAKOOTTAM" at (105mm, 72mm)
   - Font: 14pt, Bold, Centered
   - Subtitle: "Official Birth Certificate" at (105mm, 80mm)
   - Font: 9pt, Normal, Centered

3. **Decorative Elements**
   - Primary line: Y=86mm, thickness 0.8pt
   - Secondary line: Y=88mm, thickness 0.3pt
   - Span: 35mm to 175mm (full content width)

### Certification Text Section (Y: 90-115mm)
- **Position**: (35mm, 100mm)
- **Width**: 140mm (content width)
- **Font**: 11pt, Normal
- **Content**: Standard certification statement
- **Box**: Subtle border with 8mm padding
- **Line Height**: 4.5mm for text wrapping

### Data Fields Section (Y: 120-235mm)
#### Section Structure
- **Start Position**: Y=120mm
- **Line Height**: 13mm between fields
- **Section Spacing**: 6mm additional space between sections
- **Label Position**: X=35mm
- **Value Position**: X=100mm
- **Field Width**: 70mm for values

#### Field Specifications
1. **Birth Details Section**
   - Section Header: "BIRTH DETAILS" (11pt, Bold)
   - Fields:
     - Name of Child (Important: 11pt Bold)
     - Gender (10pt Normal)
     - Date of Birth (Important: 11pt Bold)
     - Place of Birth (10pt Normal)

2. **Registration Details Section**
   - Section Header: "OFFICIAL REGISTRATION DETAILS" (11pt, Bold)
   - Fields:
     - Registration No (Important: 11pt Bold)
     - Date of Registration (Important: 11pt Bold)
     - Registering Authority (10pt Normal)

3. **Parent Details Section**
   - Section Header: "PARENT DETAILS" (11pt, Bold)
   - Fields:
     - Name of Mother/Father (10pt Normal)
     - Address (10pt Normal)
     - Nationality (10pt Normal)

#### Field Formatting
- **Labels**: 10pt, Bold, Left-aligned
- **Values**: 10pt, Normal (11pt Bold for important fields)
- **Underlines**: 0.2pt thickness, light gray, 1.5mm below text
- **Alignment**: Values left-aligned at X=100mm

### Footer Section (Y: 240-297mm)
#### Authentication Area (Y: 240-270mm)
- **Header**: "AUTHENTICATION" at (35mm, 242mm), 10pt Bold
- **Issue Date**: Label at (35mm, 250mm), Value at (68mm, 250mm), 9pt
- **Certificate Number**: Label at (35mm, 260mm), Value at (68mm, 260mm), 9pt

#### Signature Area (Y: 270-300mm)
- **Signature Label**: "Signature of Issuing Authority:" at (35mm, 272mm), 9pt
- **Signature Line**: From (35mm, 286mm) to (110mm, 286mm), 0.5pt
- **Authority Name**: "HODO Hospital" at (35mm, 292mm), 10pt Bold
- **Designation**: "Registrar of Births" at (35mm, 298mm), 8pt Normal

#### Official Seal (Y: 257-293mm)
- **Center Position**: (140mm, 275mm)
- **Outer Circle**: 18mm radius, 1.5pt thickness
- **Inner Circle**: 15mm radius, 0.5pt thickness
- **Text Elements**:
  - "OFFICIAL" at center Y-3mm, 8pt Bold
  - "SEAL" at center Y+3mm, 8pt Bold
  - "HODO HOSPITAL" at center Y+9mm, 6pt Normal
  - Year at center Y+14mm, 5pt Normal

#### Validity Note
- **Position**: (105mm, 305mm), Centered
- **Font**: 7pt, Italic
- **Text**: "This certificate is valid only with official seal and signature"

## Color Specifications
Based on template analysis:
- **Primary Color**: #2c3e50 (Dark blue-gray for headers)
- **Secondary Color**: #34495e (Medium blue-gray for sections)
- **Text Color**: #2c3e50 (Main body text)
- **Light Color**: #bdc3c7 (Lines and subtle elements)
- **Accent Color**: #e74c3c (Medical cross and emphasis)
- **Background**: #ffffff (White)

## Font Hierarchy
1. **Title**: 20pt Bold (Main certificate title)
2. **Subtitle**: 14pt Bold (Hospital name)
3. **Section Headers**: 11pt Bold (Birth Details, etc.)
4. **Important Fields**: 11pt Bold (Names, dates, registration)
5. **Standard Fields**: 10pt Normal (Regular data fields)
6. **Labels**: 10pt Bold (Field labels)
7. **Footer Text**: 9pt Normal (Authentication section)
8. **Notes**: 7pt Italic (Validity statement)

## Spacing and Alignment
- **Line Heights**: 13mm for data fields, 4.5mm for wrapped text
- **Section Gaps**: 6mm additional space between major sections
- **Margins**: 20mm page margins, 35mm content left margin
- **Field Alignment**: Labels at 35mm, values at 100mm
- **Center Alignment**: 105mm for centered elements (titles, seal text)

## Security Elements
1. **Watermarks**:
   - Main: "HODO HOSPITAL" at 45° angle, very light gray
   - Secondary: "OFFICIAL DOCUMENT" at 45° angle, lighter gray

2. **Corner Marks**:
   - Top-left: "HODO"
   - Top-right: Timestamp
   - Bottom-left: "OFFICIAL"
   - Bottom-right: "AUTHENTIC"

3. **Borders**:
   - Main border: 1pt black line
   - Inner border: 0.3pt gray line
   - Field underlines: 0.2pt light gray

## Implementation Notes
- All measurements are in millimeters for PDF generation
- Font weights: 'normal', 'bold', 'italic'
- Text alignment: 'left', 'center', 'right'
- Colors specified in hex format for consistency
- Positioning uses absolute coordinates from top-left origin
- Line thickness specified in points (pt)

## Validation Requirements
- **Critical Fields**: Baby name, date of birth (prevent generation if missing)
- **Optional Fields**: Gender, registration details, parent info (use defaults)
- **Field Lengths**: Name max 50 chars, address max 100 chars
- **Date Formats**: Accept multiple input formats, display as DD/MM/YYYY

This analysis ensures pixel-perfect replication of the template image while maintaining professional document standards and official formatting requirements.