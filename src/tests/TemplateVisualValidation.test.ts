/**
 * Visual Template Validation Tests
 * 
 * This test suite validates that generated certificates match the template image exactly
 * Requirements: 1.1, 1.2, 1.5 - Template accuracy and visual consistency
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TemplateCertificateGenerator } from '../utils/TemplateCertificateGenerator';
import { TEMPLATE_LAYOUT } from '../utils/TemplateLayoutConstants';

describe('Template Visual Validation', () => {
  let generator: TemplateCertificateGenerator;

  beforeEach(() => {
    generator = new TemplateCertificateGenerator();
  });

  describe('Template Image Compliance', () => {
    it('should match template image positioning specifications', () => {
      // Requirements: 1.3, 1.4 - Exact positioning and template layout replication
      
      // Validate header positioning matches template image
      const header = TEMPLATE_LAYOUT.POSITIONS.HEADER;
      expect(header.TITLE.X).toBe(105); // Center of 210mm page
      expect(header.TITLE.Y).toBe(60);  // Measured from template
      expect(header.TITLE.FONT_SIZE).toBe(20); // Template font size
      
      // Validate logo positioning matches template
      expect(header.LOGO.X).toBe(30);   // Left margin + offset
      expect(header.LOGO.Y).toBe(30);   // Top margin + offset
      expect(header.LOGO.WIDTH).toBe(35);  // Template logo width
      expect(header.LOGO.HEIGHT).toBe(23); // Template logo height
      
      // Validate decorative lines match template
      expect(header.DECORATIVE_LINES.Y1).toBe(86);  // First line position
      expect(header.DECORATIVE_LINES.Y2).toBe(88);  // Second line position
      expect(header.DECORATIVE_LINES.X_START).toBe(35); // Line start
      expect(header.DECORATIVE_LINES.X_END).toBe(175);   // Line end
    });

    it('should match template certification box specifications', () => {
      // Requirements: 1.3 - Exact template certification section
      const cert = TEMPLATE_LAYOUT.POSITIONS.CERTIFICATION;
      
      expect(cert.X).toBe(35);        // Left alignment with content
      expect(cert.Y).toBe(100);       // Below header section
      expect(cert.WIDTH).toBe(140);   // Content width
      expect(cert.FONT_SIZE).toBe(11); // Template font size
      expect(cert.LINE_HEIGHT).toBe(4.5); // Template line spacing
    });

    it('should match template data fields layout exactly', () => {
      // Requirements: 1.4 - Exact field positioning and spacing
      const fields = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;
      
      expect(fields.START_Y).toBe(120);      // Start below certification
      expect(fields.LINE_HEIGHT).toBe(13);   // Template line height
      expect(fields.SECTION_SPACING).toBe(6); // Section gaps
      expect(fields.LABEL_X).toBe(35);       // Label alignment
      expect(fields.VALUE_X).toBe(100);      // Value alignment
      expect(fields.FIELD_WIDTH).toBe(70);   // Field width
    });

    it('should match template footer and signature area', () => {
      // Requirements: 1.3 - Template footer positioning
      const footer = TEMPLATE_LAYOUT.POSITIONS.FOOTER;
      
      expect(footer.START_Y).toBe(240);           // Footer start position
      expect(footer.SEPARATOR_LINE_Y).toBe(235);  // Separator line
      expect(footer.ISSUE_DATE.Y).toBe(250);      // Issue date position
      expect(footer.CERT_NUMBER.Y).toBe(260);     // Certificate number
      expect(footer.SIGNATURE.LABEL_Y).toBe(272); // Signature label
      expect(footer.SIGNATURE.LINE_Y).toBe(286);  // Signature line
    });

    it('should use exact template colors and styling', () => {
      // Requirements: 1.3, 1.4 - Template color accuracy
      const colors = TEMPLATE_LAYOUT.COLORS;
      
      // Validate primary colors match template
      expect(colors.PRIMARY).toBe('#2c3e50');    // Dark blue-gray
      expect(colors.SECONDARY).toBe('#34495e');  // Medium blue-gray
      expect(colors.TEXT).toBe('#2c3e50');       // Main text
      expect(colors.LIGHT).toBe('#bdc3c7');      // Light elements
      expect(colors.ACCENT).toBe('#e74c3c');     // Red accent
      expect(colors.BACKGROUND).toBe('#ffffff'); // White background
    });

    it('should replicate template border specifications exactly', () => {
      // Requirements: 1.3 - Exact border replication
      const borders = TEMPLATE_LAYOUT.BORDERS;
      
      // Main border specifications
      expect(borders.MAIN_BORDER.WIDTH).toBe(1);
      expect(borders.MAIN_BORDER.X).toBe(20);
      expect(borders.MAIN_BORDER.Y).toBe(20);
      expect(borders.MAIN_BORDER.WIDTH_SIZE).toBe(170);
      expect(borders.MAIN_BORDER.HEIGHT_SIZE).toBe(257);
      
      // Inner border specifications
      expect(borders.INNER_BORDER.WIDTH).toBe(0.3);
      expect(borders.INNER_BORDER.X).toBe(25);
      expect(borders.INNER_BORDER.Y).toBe(25);
      expect(borders.INNER_BORDER.WIDTH_SIZE).toBe(160);
      expect(borders.INNER_BORDER.HEIGHT_SIZE).toBe(247);
    });
  });

  describe('Template Text Content Validation', () => {
    it('should include exact text content from template image', () => {
      // Requirements: 4.3 - Template text content exactly as shown
      const text = TEMPLATE_LAYOUT.TEXT;
      
      // Header text validation
      expect(text.HEADER.TITLE).toBe('CERTIFICATE OF BIRTH');
      expect(text.HEADER.HOSPITAL_NAME).toBe('HODO HOSPITAL, KAZHAKOOTTAM');
      expect(text.HEADER.SUBTITLE).toBe('Official Birth Certificate');
      
      // Certification text validation
      expect(text.CERTIFICATION).toContain('This is to certify that the following information');
      expect(text.CERTIFICATION).toContain('has been taken from the original record of birth');
      expect(text.CERTIFICATION).toContain('HODO Hospital, Kazhakoottam');
      expect(text.CERTIFICATION).toContain('Registration of Births and Deaths Act, 1969');
      expect(text.CERTIFICATION).toContain('serves as official proof of birth');
    });

    it('should include all section headers exactly as template', () => {
      // Requirements: 4.3 - Section headers and labels precisely positioned
      const sections = TEMPLATE_LAYOUT.TEXT.SECTIONS;
      
      expect(sections.BIRTH_DETAILS).toBe('BIRTH DETAILS');
      expect(sections.REGISTRATION_DETAILS).toBe('OFFICIAL REGISTRATION DETAILS');
      expect(sections.PARENT_DETAILS).toBe('PARENT DETAILS');
    });

    it('should include all field labels exactly as template', () => {
      // Requirements: 4.3 - Field labels exactly as shown
      const labels = TEMPLATE_LAYOUT.TEXT.FIELD_LABELS;
      
      expect(labels.CHILD_NAME).toBe('Name of Child');
      expect(labels.GENDER).toBe('Gender');
      expect(labels.DATE_OF_BIRTH).toBe('Date of Birth');
      expect(labels.PLACE_OF_BIRTH).toBe('Place of Birth');
      expect(labels.REGISTRATION_NO).toBe('Registration No');
      expect(labels.REGISTRATION_DATE).toBe('Date of Registration');
      expect(labels.REGISTERING_AUTHORITY).toBe('Registering Authority');
      expect(labels.PARENT_NAME).toBe('Name of Mother/Father');
      expect(labels.ADDRESS).toBe('Address');
      expect(labels.NATIONALITY).toBe('Nationality');
    });

    it('should include footer elements exactly as template', () => {
      // Requirements: 4.3 - Footer elements as shown in template
      const footer = TEMPLATE_LAYOUT.TEXT.FOOTER;
      
      expect(footer.AUTH_HEADER).toBe('AUTHENTICATION');
      expect(footer.ISSUE_DATE_LABEL).toBe('Date of Issue:');
      expect(footer.CERT_NUMBER_LABEL).toBe('Certificate No:');
      expect(footer.SIGNATURE_LABEL).toBe('Signature of Issuing Authority:');
      expect(footer.AUTHORITY_NAME).toBe('HODO Hospital');
      expect(footer.DESIGNATION).toBe('Registrar of Births');
      expect(footer.VALIDITY_NOTE).toBe('This certificate is valid only with official seal and signature');
    });

    it('should include official seal text elements', () => {
      // Requirements: 4.3 - Official seal elements as shown
      const sealText = TEMPLATE_LAYOUT.TEXT.FOOTER.SEAL_TEXT;
      
      expect(sealText.OFFICIAL).toBe('OFFICIAL');
      expect(sealText.SEAL).toBe('SEAL');
      expect(sealText.HOSPITAL).toBe('HODO HOSPITAL');
    });
  });

  describe('Template Spacing and Alignment Validation', () => {
    it('should maintain exact spacing measurements from template', () => {
      // Requirements: 1.4 - Exact spacing and alignment
      const spacing = TEMPLATE_LAYOUT.SPACING;
      
      expect(spacing.LINE_HEIGHT.TITLE).toBe(12);
      expect(spacing.LINE_HEIGHT.SUBTITLE).toBe(8);
      expect(spacing.LINE_HEIGHT.BODY_TEXT).toBe(4.5);
      expect(spacing.LINE_HEIGHT.FIELD_TEXT).toBe(13);
      expect(spacing.LINE_HEIGHT.SECTION_GAP).toBe(6);
    });

    it('should maintain exact margin specifications', () => {
      // Requirements: 1.4 - Template margin accuracy
      const margins = TEMPLATE_LAYOUT.SPACING.MARGINS;
      
      expect(margins.CONTENT_LEFT).toBe(35);
      expect(margins.CONTENT_RIGHT).toBe(175);
      expect(margins.CONTENT_WIDTH).toBe(140);
    });

    it('should maintain exact padding specifications', () => {
      // Requirements: 1.4 - Template padding accuracy
      const padding = TEMPLATE_LAYOUT.SPACING.PADDING;
      
      expect(padding.SECTION_HEADER).toBe(10);
      expect(padding.FIELD_GROUP).toBe(8);
      expect(padding.CERTIFICATION_BOX).toBe(8);
    });
  });

  describe('Template Font and Typography Validation', () => {
    it('should use exact font specifications from template', () => {
      // Requirements: 1.3, 1.4 - Template font accuracy
      const fonts = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS.FONTS;
      
      // Section header fonts
      expect(fonts.SECTION_HEADER.SIZE).toBe(11);
      expect(fonts.SECTION_HEADER.WEIGHT).toBe('bold');
      expect(fonts.SECTION_HEADER.CHAR_SPACING).toBe(0.2);
      
      // Field label fonts
      expect(fonts.FIELD_LABEL.SIZE).toBe(10);
      expect(fonts.FIELD_LABEL.WEIGHT).toBe('bold');
      expect(fonts.FIELD_LABEL.CHAR_SPACING).toBe(0.1);
      
      // Field value fonts
      expect(fonts.FIELD_VALUE.SIZE).toBe(10);
      expect(fonts.FIELD_VALUE.WEIGHT).toBe('normal');
      expect(fonts.FIELD_VALUE.CHAR_SPACING).toBe(0.05);
      
      // Important value fonts
      expect(fonts.IMPORTANT_VALUE.SIZE).toBe(11);
      expect(fonts.IMPORTANT_VALUE.WEIGHT).toBe('bold');
      expect(fonts.IMPORTANT_VALUE.CHAR_SPACING).toBe(0.15);
    });

    it('should use exact header font specifications', () => {
      // Requirements: 1.3 - Header font accuracy
      const header = TEMPLATE_LAYOUT.POSITIONS.HEADER;
      
      expect(header.TITLE.FONT_SIZE).toBe(20);
      expect(header.TITLE.FONT_WEIGHT).toBe('bold');
      expect(header.TITLE.CHAR_SPACING).toBe(0.5);
      
      expect(header.HOSPITAL_NAME.FONT_SIZE).toBe(14);
      expect(header.HOSPITAL_NAME.FONT_WEIGHT).toBe('bold');
      expect(header.HOSPITAL_NAME.CHAR_SPACING).toBe(0.3);
      
      expect(header.SUBTITLE.FONT_SIZE).toBe(9);
      expect(header.SUBTITLE.FONT_WEIGHT).toBe('normal');
      expect(header.SUBTITLE.CHAR_SPACING).toBe(0.1);
    });
  });

  describe('Template Security Elements Validation', () => {
    it('should include security watermark specifications', () => {
      // Requirements: 4.2 - Security elements for official documents
      const security = TEMPLATE_LAYOUT.SECURITY;
      
      expect(security.WATERMARK.TEXT).toBe('HODO HOSPITAL');
      expect(security.WATERMARK.FONT_SIZE).toBe(60);
      expect(security.WATERMARK.COLOR).toBe('#f0f0f0');
      expect(security.WATERMARK.ANGLE).toBe(45);
      expect(security.WATERMARK.X).toBe(105);
      expect(security.WATERMARK.Y).toBe(150);
    });

    it('should include corner security marks', () => {
      // Requirements: 4.2 - Security corner marks
      const cornerMarks = TEMPLATE_LAYOUT.SECURITY.CORNER_MARKS;
      
      expect(cornerMarks.FONT_SIZE).toBe(6);
      expect(cornerMarks.COLOR).toBe('#c8c8c8');
      
      const positions = cornerMarks.POSITIONS;
      expect(positions.TOP_LEFT.TEXT).toBe('HODO');
      expect(positions.TOP_RIGHT.TEXT).toBe('TIMESTAMP');
      expect(positions.BOTTOM_LEFT.TEXT).toBe('OFFICIAL');
      expect(positions.BOTTOM_RIGHT.TEXT).toBe('AUTHENTIC');
    });
  });

  describe('Template Validation Rules', () => {
    it('should enforce template field validation rules', () => {
      // Requirements: 3.5 - Field validation according to template
      const validation = TEMPLATE_LAYOUT.VALIDATION;
      
      expect(validation.REQUIRED_FIELDS).toContain('babyName');
      expect(validation.REQUIRED_FIELDS).toContain('dateOfBirth');
      
      expect(validation.OPTIONAL_FIELDS).toContain('gender');
      expect(validation.OPTIONAL_FIELDS).toContain('registrationNo');
      expect(validation.OPTIONAL_FIELDS).toContain('parentName');
      expect(validation.OPTIONAL_FIELDS).toContain('address');
      expect(validation.OPTIONAL_FIELDS).toContain('nationality');
    });

    it('should enforce template field length limits', () => {
      // Requirements: 1.4 - Template field constraints
      const fieldLengths = TEMPLATE_LAYOUT.VALIDATION.FIELD_LENGTHS;
      
      expect(fieldLengths.MAX_NAME_LENGTH).toBe(50);
      expect(fieldLengths.MAX_ADDRESS_LENGTH).toBe(100);
      expect(fieldLengths.MAX_REGISTRATION_LENGTH).toBe(20);
    });

    it('should support template date formats', () => {
      // Requirements: 2.3 - Template date format requirements
      const dateFormats = TEMPLATE_LAYOUT.VALIDATION.DATE_FORMATS;
      
      expect(dateFormats.DISPLAY).toBe('DD/MM/YYYY');
      expect(dateFormats.INPUT_ACCEPTED).toContain('YYYY-MM-DD');
      expect(dateFormats.INPUT_ACCEPTED).toContain('DD/MM/YYYY');
      expect(dateFormats.INPUT_ACCEPTED).toContain('MM/DD/YYYY');
    });
  });

  describe('Template Professional Quality Validation', () => {
    it('should maintain professional appearance standards', () => {
      // Requirements: 1.5 - Professional quality and printability
      
      // Page dimensions should be standard A4
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.WIDTH).toBe(210);
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.HEIGHT).toBe(297);
      
      // Margins should be appropriate for printing
      const margins = TEMPLATE_LAYOUT.PAGE_DIMENSIONS.MARGINS;
      expect(margins.TOP).toBeGreaterThanOrEqual(15);
      expect(margins.BOTTOM).toBeGreaterThanOrEqual(15);
      expect(margins.LEFT).toBeGreaterThanOrEqual(15);
      expect(margins.RIGHT).toBeGreaterThanOrEqual(15);
    });

    it('should ensure readable font sizes', () => {
      // Requirements: 1.5 - Professional readability
      const header = TEMPLATE_LAYOUT.POSITIONS.HEADER;
      const fields = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS.FONTS;
      
      // All font sizes should be readable (minimum 8pt)
      expect(header.TITLE.FONT_SIZE).toBeGreaterThanOrEqual(16);
      expect(header.HOSPITAL_NAME.FONT_SIZE).toBeGreaterThanOrEqual(12);
      expect(header.SUBTITLE.FONT_SIZE).toBeGreaterThanOrEqual(8);
      expect(fields.FIELD_LABEL.SIZE).toBeGreaterThanOrEqual(8);
      expect(fields.FIELD_VALUE.SIZE).toBeGreaterThanOrEqual(8);
    });

    it('should ensure appropriate contrast ratios', () => {
      // Requirements: 1.5 - Professional visual quality
      const colors = TEMPLATE_LAYOUT.COLORS;
      
      // Primary text should be dark enough for good contrast
      expect(colors.PRIMARY).toBe('#2c3e50'); // Dark blue-gray
      expect(colors.TEXT).toBe('#2c3e50');    // Same as primary
      
      // Background should be white for maximum contrast
      expect(colors.BACKGROUND).toBe('#ffffff');
      
      // Light elements should be light enough but still visible
      expect(colors.LIGHT).toBe('#bdc3c7');
    });
  });
});