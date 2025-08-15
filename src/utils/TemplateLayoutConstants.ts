/**
 * Template Layout Constants for Birth Certificate
 * 
 * This file contains exact positioning, spacing, and font specifications
 * derived from the template image at frontend/src/assets/certifcate_text.png
 * 
 * Requirements: 1.3, 1.4 - Exact positioning and template layout replication
 */

// Page dimensions (A4 in mm)
export const PAGE_DIMENSIONS = {
    WIDTH: 210,
    HEIGHT: 297,
    MARGINS: {
      TOP: 20,
      BOTTOM: 20,
      LEFT: 20,
      RIGHT: 20
    }
  } as const;
  
  // Template-specific positioning constants (in mm from top-left)
  // Measurements derived from exact template analysis for precise replication
  export const TEMPLATE_POSITIONS = {
    // Header section positioning - exact measurements from template
    HEADER: {
      LOGO: {
        X: 30,
        Y: 30,
        WIDTH: 35,
        HEIGHT: 23,
        // Precise logo positioning offsets
        BORDER_OFFSET: 1,
        TEXT_OFFSET_X: 17.5, // Center X
        TEXT_OFFSET_Y_1: 38,  // First line Y
        TEXT_OFFSET_Y_2: 44   // Second line Y
      },
      TITLE: {
        X: 105, // Exact center of page
        Y: 60,
        FONT_SIZE: 20,
        FONT_WEIGHT: 'bold',
        // Character spacing for exact template matching
        CHAR_SPACING: 0.5,
        LETTER_SPACING: 1.2
      },
      HOSPITAL_NAME: {
        X: 105,
        Y: 72,
        FONT_SIZE: 14,
        FONT_WEIGHT: 'bold',
        CHAR_SPACING: 0.3
      },
      SUBTITLE: {
        X: 105,
        Y: 80,
        FONT_SIZE: 9,
        FONT_WEIGHT: 'normal',
        CHAR_SPACING: 0.1
      },
      DECORATIVE_LINES: {
        Y1: 86,
        Y2: 88,
        X_START: 35,
        X_END: 175,
        // Precise line spacing and thickness
        LINE_SPACING: 2,
        PRIMARY_THICKNESS: 0.8,
        SECONDARY_THICKNESS: 0.3
      }
    },
  
    // Certification text section - precise measurements for exact template replication
    CERTIFICATION: {
      X: 35,
      Y: 100,
      WIDTH: 140,
      FONT_SIZE: 11,
      LINE_HEIGHT: 4.5,
      BOX_PADDING: 8,
      
      // Precise text formatting specifications
      TEXT_ALIGNMENT: 'justify',
      CHAR_SPACING: 0.02,
      WORD_SPACING: 0.5,
      LINE_HEIGHT_FACTOR: 1.2,
      
      // Box styling for exact template matching
      BOX_STYLING: {
        BORDER_COLOR: [189, 195, 199],
        BORDER_WIDTH: 0.3,
        INNER_SHADOW_COLOR: [240, 240, 240],
        INNER_SHADOW_WIDTH: 0.1,
        CORNER_RADIUS: 0,
        PADDING_TOP: 5,
        PADDING_BOTTOM: 8,
        PADDING_LEFT: 3,
        PADDING_RIGHT: 3
      },
      
      // Corner accent specifications
      CORNER_ACCENTS: {
        SIZE: 1.5,
        COLOR: [44, 62, 80],
        WIDTH: 0.3
      }
    },
  
    // Data fields section - precise measurements for exact template matching
    DATA_FIELDS: {
      START_Y: 120,
      LINE_HEIGHT: 13,
      SECTION_SPACING: 6,
      LABEL_X: 35,
      VALUE_X: 100,
      UNDERLINE_OFFSET: 1.5,
      FIELD_WIDTH: 70,
      
      // Precise spacing measurements from template
      INTER_FIELD_SPACING: 2,
      SECTION_HEADER_SPACING: 8,
      FIELD_GROUP_SPACING: 4,
      
      // Exact alignment specifications
      LABEL_ALIGNMENT: 'left',
      VALUE_ALIGNMENT: 'left',
      COLON_OFFSET: 0.5,
      
      // Font specifications for different field types - exact template matching
      FONTS: {
        SECTION_HEADER: {
          SIZE: 11,
          WEIGHT: 'bold',
          CHAR_SPACING: 0.2,
          LINE_HEIGHT_FACTOR: 1.3
        },
        FIELD_LABEL: {
          SIZE: 10,
          WEIGHT: 'bold',
          CHAR_SPACING: 0.1,
          LINE_HEIGHT_FACTOR: 1.2
        },
        FIELD_VALUE: {
          SIZE: 10,
          WEIGHT: 'normal',
          CHAR_SPACING: 0.05,
          LINE_HEIGHT_FACTOR: 1.2
        },
        IMPORTANT_VALUE: {
          SIZE: 11,
          WEIGHT: 'bold',
          CHAR_SPACING: 0.15,
          LINE_HEIGHT_FACTOR: 1.3
        }
      },
      
      // Underline styling for exact template matching
      UNDERLINE_STYLING: {
        MAIN_COLOR: [189, 195, 199],
        SHADOW_COLOR: [220, 220, 220],
        SHADOW_OFFSET: 0.2,
        THICKNESS: 0.2,
        SHADOW_THICKNESS: 0.1
      }
    },
  
    // Footer section positioning
    FOOTER: {
      START_Y: 240,
      SEPARATOR_LINE_Y: 235,
      
      // Authentication section
      AUTH_HEADER: {
        X: 35,
        Y: 242,
        FONT_SIZE: 10
      },
      
      // Issue date positioning
      ISSUE_DATE: {
        LABEL_X: 35,
        VALUE_X: 68,
        Y: 250,
        FONT_SIZE: 9
      },
      
      // Certificate number positioning
      CERT_NUMBER: {
        LABEL_X: 35,
        VALUE_X: 68,
        Y: 260,
        FONT_SIZE: 9
      },
      
      // Signature section
      SIGNATURE: {
        LABEL_X: 35,
        LABEL_Y: 272,
        LINE_Y: 286,
        LINE_X_START: 35,
        LINE_X_END: 110,
        AUTHORITY_NAME_Y: 292,
        DESIGNATION_Y: 298,
        FONT_SIZE: 9
      },
      
      // Official seal positioning
      SEAL: {
        CENTER_X: 140,
        CENTER_Y: 275,
        OUTER_RADIUS: 18,
        INNER_RADIUS: 15,
        TEXT_OFFSETS: {
          OFFICIAL_Y: -3,
          SEAL_Y: 3,
          HOSPITAL_Y: 9,
          YEAR_Y: 14
        },
        FONTS: {
          MAIN_TEXT: 8,
          HOSPITAL_TEXT: 6,
          YEAR_TEXT: 5
        }
      },
      
      // Validity note
      VALIDITY_NOTE: {
        X: 105,
        Y: 305,
        FONT_SIZE: 7
      }
    }
  } as const;
  
  // Template-specific text content and formatting
  export const TEMPLATE_TEXT = {
    HEADER: {
      TITLE: 'CERTIFICATE OF BIRTH',
      HOSPITAL_NAME: 'HODO HOSPITAL, KAZHAKOOTTAM',
      SUBTITLE: 'Official Birth Certificate'
    },
    
    CERTIFICATION: 'This is to certify that the following information has been taken from the original record of birth which is in the register of HODO Hospital, Kazhakoottam. This certificate is issued in accordance with the Registration of Births and Deaths Act, 1969, and serves as official proof of birth.',
    
    SECTIONS: {
      BIRTH_DETAILS: 'BIRTH DETAILS',
      REGISTRATION_DETAILS: 'OFFICIAL REGISTRATION DETAILS',
      PARENT_DETAILS: 'PARENT DETAILS'
    },
    
    FIELD_LABELS: {
      CHILD_NAME: 'Name of Child',
      GENDER: 'Gender',
      DATE_OF_BIRTH: 'Date of Birth',
      PLACE_OF_BIRTH: 'Place of Birth',
      REGISTRATION_NO: 'Registration No',
      REGISTRATION_DATE: 'Date of Registration',
      REGISTERING_AUTHORITY: 'Registering Authority',
      PARENT_NAME: 'Name of Mother/Father',
      ADDRESS: 'Address',
      NATIONALITY: 'Nationality'
    },
    
    FOOTER: {
      AUTH_HEADER: 'AUTHENTICATION',
      ISSUE_DATE_LABEL: 'Date of Issue:',
      CERT_NUMBER_LABEL: 'Certificate No:',
      SIGNATURE_LABEL: 'Signature of Issuing Authority:',
      AUTHORITY_NAME: 'HODO Hospital',
      DESIGNATION: 'Registrar of Births',
      SEAL_TEXT: {
        OFFICIAL: 'OFFICIAL',
        SEAL: 'SEAL',
        HOSPITAL: 'HODO HOSPITAL'
      },
      VALIDITY_NOTE: 'This certificate is valid only with official seal and signature',
      DISCLAIMER: 'Any alteration or tampering with this document renders it invalid',
      VERIFICATION_NOTE: 'For verification, contact HODO Hospital at +91-471-XXXXXXX'
    },
    
    DEFAULTS: {
      PLACE_OF_BIRTH: 'HODO HOSPITAL, KAZHAKOOTTAM',
      NATIONALITY: 'Indian',
      REGISTERING_AUTHORITY: 'HODO Hospital, Kazhakoottam'
    }
  } as const;
  
  // Color specifications matching template
  export const TEMPLATE_COLORS = {
    PRIMARY: '#2c3e50',      // Dark blue-gray for headers and important text
    SECONDARY: '#34495e',    // Medium blue-gray for section headers
    TEXT: '#2c3e50',         // Main text color
    LIGHT: '#bdc3c7',        // Light gray for lines and subtle elements
    ACCENT: '#e74c3c',       // Red for medical cross and emphasis
    BACKGROUND: '#ffffff'    // White background
  } as const;
  
  // Border and line specifications
  export const TEMPLATE_BORDERS = {
    MAIN_BORDER: {
      WIDTH: 1,
      COLOR: '#000000',
      X: 20,
      Y: 20,
      WIDTH_SIZE: 170,
      HEIGHT_SIZE: 257
    },
    
    INNER_BORDER: {
      WIDTH: 0.3,
      COLOR: '#666666',
      X: 25,
      Y: 25,
      WIDTH_SIZE: 160,
      HEIGHT_SIZE: 247
    },
    
    DECORATIVE_LINES: {
      PRIMARY: {
        WIDTH: 0.8,
        COLOR: TEMPLATE_COLORS.PRIMARY
      },
      SECONDARY: {
        WIDTH: 0.3,
        COLOR: TEMPLATE_COLORS.SECONDARY
      }
    },
    
    FIELD_UNDERLINES: {
      WIDTH: 0.2,
      COLOR: TEMPLATE_COLORS.LIGHT
    }
  } as const;
  
  // Spacing and layout specifications
  export const TEMPLATE_SPACING = {
    LINE_HEIGHT: {
      TITLE: 12,
      SUBTITLE: 8,
      BODY_TEXT: 4.5,
      FIELD_TEXT: 13,
      SECTION_GAP: 6
    },
    
    MARGINS: {
      CONTENT_LEFT: 35,
      CONTENT_RIGHT: 175,
      CONTENT_WIDTH: 140
    },
    
    PADDING: {
      SECTION_HEADER: 10,
      FIELD_GROUP: 8,
      CERTIFICATION_BOX: 8
    }
  } as const;
  
  // Security and watermark specifications
  export const TEMPLATE_SECURITY = {
    WATERMARK: {
      TEXT: 'HODO HOSPITAL',
      FONT_SIZE: 60,
      COLOR: '#f0f0f0',
      ANGLE: 45,
      X: 105,
      Y: 150
    },
    
    SECONDARY_WATERMARK: {
      TEXT: 'OFFICIAL DOCUMENT',
      FONT_SIZE: 20,
      COLOR: '#fafafa',
      ANGLE: 45,
      X: 105,
      Y: 180
    },
    
    CORNER_MARKS: {
      FONT_SIZE: 6,
      COLOR: '#c8c8c8',
      POSITIONS: {
        TOP_LEFT: { X: 22, Y: 24, TEXT: 'HODO' },
        TOP_RIGHT: { X: 160, Y: 24, TEXT: 'TIMESTAMP' },
        BOTTOM_LEFT: { X: 22, Y: 274, TEXT: 'OFFICIAL' },
        BOTTOM_RIGHT: { X: 160, Y: 274, TEXT: 'AUTHENTIC' }
      }
    }
  } as const;
  
  // Field validation and formatting specifications
  export const TEMPLATE_VALIDATION = {
    REQUIRED_FIELDS: [
      'babyName',
      'dateOfBirth'
    ],
    
    OPTIONAL_FIELDS: [
      'gender',
      'registrationNo',
      'registrationDate',
      'parentName',
      'address',
      'nationality'
    ],
    
    FIELD_LENGTHS: {
      MAX_NAME_LENGTH: 50,
      MAX_ADDRESS_LENGTH: 100,
      MAX_REGISTRATION_LENGTH: 20
    },
    
    DATE_FORMATS: {
      DISPLAY: 'DD/MM/YYYY',
      INPUT_ACCEPTED: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']
    }
  } as const;
  
  // Export all constants as a single object for easy import
  export const TEMPLATE_LAYOUT = {
    PAGE_DIMENSIONS,
    POSITIONS: TEMPLATE_POSITIONS,
    TEXT: TEMPLATE_TEXT,
    COLORS: TEMPLATE_COLORS,
    BORDERS: TEMPLATE_BORDERS,
    SPACING: TEMPLATE_SPACING,
    SECURITY: TEMPLATE_SECURITY,
    VALIDATION: TEMPLATE_VALIDATION
  } as const;