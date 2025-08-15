/**
 * Template Layout Helper Functions
 * 
 * Utility functions for working with template layout constants and positioning
 * Requirements: 1.3, 1.4 - Precise positioning and template layout replication
 */

import { TEMPLATE_LAYOUT } from './TemplateLayoutConstants';

/**
 * Calculate Y position for data fields based on section and field index
 */
export function calculateFieldY(sectionIndex: number, fieldIndex: number): number {
  const { START_Y, LINE_HEIGHT, SECTION_SPACING } = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;
  
  // Base Y position
  let y = START_Y;
  
  // Add spacing for previous sections (each section has a header + spacing)
  y += sectionIndex * (LINE_HEIGHT + SECTION_SPACING);
  
  // Add spacing for fields within current section
  y += fieldIndex * LINE_HEIGHT;
  
  return y;
}

/**
 * Get font configuration for specific text type
 */
export function getFontConfig(textType: 'title' | 'subtitle' | 'section_header' | 'field_label' | 'field_value' | 'important_value' | 'footer_text' | 'note') {
  const { POSITIONS } = TEMPLATE_LAYOUT;
  
  switch (textType) {
    case 'title':
      return {
        size: POSITIONS.HEADER.TITLE.FONT_SIZE,
        weight: POSITIONS.HEADER.TITLE.FONT_WEIGHT
      };
    case 'subtitle':
      return {
        size: POSITIONS.HEADER.HOSPITAL_NAME.FONT_SIZE,
        weight: POSITIONS.HEADER.HOSPITAL_NAME.FONT_WEIGHT
      };
    case 'section_header':
      return {
        size: POSITIONS.DATA_FIELDS.FONTS.SECTION_HEADER.SIZE,
        weight: POSITIONS.DATA_FIELDS.FONTS.SECTION_HEADER.WEIGHT
      };
    case 'field_label':
      return {
        size: POSITIONS.DATA_FIELDS.FONTS.FIELD_LABEL.SIZE,
        weight: POSITIONS.DATA_FIELDS.FONTS.FIELD_LABEL.WEIGHT
      };
    case 'field_value':
      return {
        size: POSITIONS.DATA_FIELDS.FONTS.FIELD_VALUE.SIZE,
        weight: POSITIONS.DATA_FIELDS.FONTS.FIELD_VALUE.WEIGHT
      };
    case 'important_value':
      return {
        size: POSITIONS.DATA_FIELDS.FONTS.IMPORTANT_VALUE.SIZE,
        weight: POSITIONS.DATA_FIELDS.FONTS.IMPORTANT_VALUE.WEIGHT
      };
    case 'footer_text':
      return {
        size: POSITIONS.FOOTER.ISSUE_DATE.FONT_SIZE,
        weight: 'normal'
      };
    case 'note':
      return {
        size: POSITIONS.FOOTER.VALIDITY_NOTE.FONT_SIZE,
        weight: 'italic'
      };
    default:
      return {
        size: 10,
        weight: 'normal'
      };
  }
}

/**
 * Get color value for specific element type
 */
export function getColor(colorType: 'primary' | 'secondary' | 'text' | 'light' | 'accent' | 'background'): string {
  const { COLORS } = TEMPLATE_LAYOUT;
  
  switch (colorType) {
    case 'primary':
      return COLORS.PRIMARY;
    case 'secondary':
      return COLORS.SECONDARY;
    case 'text':
      return COLORS.TEXT;
    case 'light':
      return COLORS.LIGHT;
    case 'accent':
      return COLORS.ACCENT;
    case 'background':
      return COLORS.BACKGROUND;
    default:
      return COLORS.TEXT;
  }
}

/**
 * Calculate section header Y position
 */
export function calculateSectionHeaderY(sectionIndex: number): number {
  const { START_Y, LINE_HEIGHT, SECTION_SPACING } = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;
  const { SECTION_HEADER } = TEMPLATE_LAYOUT.SPACING.PADDING;
  
  let y = START_Y;
  
  // Add spacing for previous sections
  if (sectionIndex > 0) {
    // Each previous section includes: header + fields + section spacing
    // Approximate 4 fields per section for calculation
    y += sectionIndex * (SECTION_HEADER + (4 * LINE_HEIGHT) + SECTION_SPACING);
  }
  
  return y;
}

/**
 * Validate field positioning within page bounds
 */
export function validatePosition(x: number, y: number): { isValid: boolean; adjustedX?: number; adjustedY?: number } {
  const { PAGE_DIMENSIONS } = TEMPLATE_LAYOUT;
  const { MARGINS } = PAGE_DIMENSIONS;
  
  const minX = MARGINS.LEFT;
  const maxX = PAGE_DIMENSIONS.WIDTH - MARGINS.RIGHT;
  const minY = MARGINS.TOP;
  const maxY = PAGE_DIMENSIONS.HEIGHT - MARGINS.BOTTOM;
  
  let adjustedX = x;
  let adjustedY = y;
  let isValid = true;
  
  if (x < minX) {
    adjustedX = minX;
    isValid = false;
  } else if (x > maxX) {
    adjustedX = maxX;
    isValid = false;
  }
  
  if (y < minY) {
    adjustedY = minY;
    isValid = false;
  } else if (y > maxY) {
    adjustedY = maxY;
    isValid = false;
  }
  
  return { isValid, adjustedX, adjustedY };
}

/**
 * Get border configuration for specific border type
 */
export function getBorderConfig(borderType: 'main' | 'inner' | 'decorative_primary' | 'decorative_secondary' | 'field_underline') {
  const { BORDERS } = TEMPLATE_LAYOUT;
  
  switch (borderType) {
    case 'main':
      return BORDERS.MAIN_BORDER;
    case 'inner':
      return BORDERS.INNER_BORDER;
    case 'decorative_primary':
      return BORDERS.DECORATIVE_LINES.PRIMARY;
    case 'decorative_secondary':
      return BORDERS.DECORATIVE_LINES.SECONDARY;
    case 'field_underline':
      return BORDERS.FIELD_UNDERLINES;
    default:
      return BORDERS.FIELD_UNDERLINES;
  }
}

/**
 * Calculate text width for centering and alignment
 */
export function calculateCenterX(textWidth: number): number {
  return TEMPLATE_LAYOUT.PAGE_DIMENSIONS.WIDTH / 2;
}

/**
 * Get spacing value for specific spacing type
 */
export function getSpacing(spacingType: 'line_height' | 'section_gap' | 'field_gap' | 'padding'): number {
  const { SPACING } = TEMPLATE_LAYOUT;
  
  switch (spacingType) {
    case 'line_height':
      return SPACING.LINE_HEIGHT.FIELD_TEXT;
    case 'section_gap':
      return SPACING.LINE_HEIGHT.SECTION_GAP;
    case 'field_gap':
      return TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS.LINE_HEIGHT;
    case 'padding':
      return SPACING.PADDING.FIELD_GROUP;
    default:
      return SPACING.LINE_HEIGHT.BODY_TEXT;
  }
}

/**
 * Format text to fit within template constraints
 */
export function formatTextForTemplate(text: string, maxLength: number): string {
  if (!text) return '';
  
  // Trim whitespace
  text = text.trim();
  
  // Truncate if too long
  if (text.length > maxLength) {
    text = text.substring(0, maxLength - 3) + '...';
  }
  
  return text;
}

/**
 * Get field importance level for font styling
 */
export function getFieldImportance(fieldName: string): 'important' | 'normal' {
  const importantFields = [
    'babyName',
    'dateOfBirth',
    'registrationNo',
    'registrationDate'
  ];
  
  return importantFields.includes(fieldName) ? 'important' : 'normal';
}

/**
 * Calculate seal text positions relative to seal center
 */
export function calculateSealTextPositions(centerX: number, centerY: number) {
  const { SEAL } = TEMPLATE_LAYOUT.POSITIONS.FOOTER;
  
  return {
    official: {
      x: centerX,
      y: centerY + SEAL.TEXT_OFFSETS.OFFICIAL_Y
    },
    seal: {
      x: centerX,
      y: centerY + SEAL.TEXT_OFFSETS.SEAL_Y
    },
    hospital: {
      x: centerX,
      y: centerY + SEAL.TEXT_OFFSETS.HOSPITAL_Y
    },
    year: {
      x: centerX,
      y: centerY + SEAL.TEXT_OFFSETS.YEAR_Y
    }
  };
}

/**
 * Get security watermark configuration
 */
export function getWatermarkConfig(type: 'primary' | 'secondary') {
  const { SECURITY } = TEMPLATE_LAYOUT;
  
  return type === 'primary' ? SECURITY.WATERMARK : SECURITY.SECONDARY_WATERMARK;
}

/**
 * Validate and format date for template display
 */
export function formatDateForTemplate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    // Format as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return dateString; // Return original if formatting fails
  }
}

/**
 * Generate certificate number using template format
 */
export function generateCertificateNumber(registrationNo: string): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Clean registration number
  const cleanRegNo = registrationNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'TEMP';
  
  return `HODO-${year}-${month}-${cleanRegNo}`;
}

/**
 * Get default values for missing fields
 */
export function getDefaultValue(fieldName: string): string {
  const { DEFAULTS } = TEMPLATE_LAYOUT.TEXT;
  
  switch (fieldName) {
    case 'placeOfBirth':
      return DEFAULTS.PLACE_OF_BIRTH;
    case 'nationality':
      return DEFAULTS.NATIONALITY;
    case 'registeringAuthority':
      return DEFAULTS.REGISTERING_AUTHORITY;
    case 'gender':
      return 'Not Specified';
    case 'parentName':
      return 'Parent Name Not Provided';
    case 'address':
      return 'Address Not Provided';
    default:
      return '';
  }
}