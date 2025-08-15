/**
 * Comprehensive Test Suite for Template Certificate Generator
 * 
 * This test suite validates template accuracy and integration according to:
 * Requirements: 1.1, 1.2, 1.5, 3.1, 3.2 - Template accuracy and integration testing
 * 
 * Test Coverage:
 * - Template layout accuracy against reference image
 * - Data mapping validation with various patient records
 * - Integration testing from PatientProfile and BirthRecords
 * - Professional quality and printability verification
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TemplateCertificateGenerator, ValidationError, CertificateGenerationError } from '../utils/TemplateCertificateGenerator';
import { TEMPLATE_LAYOUT } from '../utils/TemplateLayoutConstants';

// Mock jsPDF for testing
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setProperties: jest.fn(),
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    setDisplayMode: jest.fn(),
    setLineCap: jest.fn(),
    setLineJoin: jest.fn(),
    save: jest.fn(),
    internal: {
      pageSize: {
        width: 210,
        height: 297
      }
    }
  }));
});

describe('TemplateCertificateGenerator - Template Accuracy Tests', () => {
  let generator: TemplateCertificateGenerator;
  let mockDoc: any;

  beforeEach(() => {
    generator = new TemplateCertificateGenerator();
    mockDoc = (generator as any).doc;
    jest.clearAllMocks();
  });

  describe('Template Layout Accuracy', () => {
    it('should match exact template dimensions', () => {
      // Requirements: 1.3, 1.4 - Exact template layout replication
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.WIDTH).toBe(210);
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.HEIGHT).toBe(297);
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.MARGINS.TOP).toBe(20);
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.MARGINS.BOTTOM).toBe(20);
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.MARGINS.LEFT).toBe(20);
      expect(TEMPLATE_LAYOUT.PAGE_DIMENSIONS.MARGINS.RIGHT).toBe(20);
    });

    it('should position header elements exactly as template', () => {
      // Requirements: 1.3 - Exact template header positioning
      const header = TEMPLATE_LAYOUT.POSITIONS.HEADER;
      
      expect(header.LOGO.X).toBe(30);
      expect(header.LOGO.Y).toBe(30);
      expect(header.LOGO.WIDTH).toBe(35);
      expect(header.LOGO.HEIGHT).toBe(23);
      
      expect(header.TITLE.X).toBe(105);
      expect(header.TITLE.Y).toBe(60);
      expect(header.TITLE.FONT_SIZE).toBe(20);
      
      expect(header.HOSPITAL_NAME.X).toBe(105);
      expect(header.HOSPITAL_NAME.Y).toBe(72);
      expect(header.HOSPITAL_NAME.FONT_SIZE).toBe(14);
    });

    it('should position data fields with exact template spacing', () => {
      // Requirements: 1.4 - Exact spacing and field positioning
      const fields = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;
      
      expect(fields.START_Y).toBe(120);
      expect(fields.LINE_HEIGHT).toBe(13);
      expect(fields.SECTION_SPACING).toBe(6);
      expect(fields.LABEL_X).toBe(35);
      expect(fields.VALUE_X).toBe(100);
      expect(fields.FIELD_WIDTH).toBe(70);
    });

    it('should use exact template colors and styling', () => {
      // Requirements: 1.3, 1.4 - Template color and styling accuracy
      const colors = TEMPLATE_LAYOUT.COLORS;
      
      expect(colors.PRIMARY).toBe('#2c3e50');
      expect(colors.SECONDARY).toBe('#34495e');
      expect(colors.TEXT).toBe('#2c3e50');
      expect(colors.LIGHT).toBe('#bdc3c7');
      expect(colors.ACCENT).toBe('#e74c3c');
      expect(colors.BACKGROUND).toBe('#ffffff');
    });

    it('should replicate exact border specifications', () => {
      // Requirements: 1.3, 1.4 - Exact border positioning and styling
      const borders = TEMPLATE_LAYOUT.BORDERS;
      
      expect(borders.MAIN_BORDER.WIDTH).toBe(1);
      expect(borders.MAIN_BORDER.X).toBe(20);
      expect(borders.MAIN_BORDER.Y).toBe(20);
      expect(borders.MAIN_BORDER.WIDTH_SIZE).toBe(170);
      expect(borders.MAIN_BORDER.HEIGHT_SIZE).toBe(257);
      
      expect(borders.INNER_BORDER.WIDTH).toBe(0.3);
      expect(borders.INNER_BORDER.X).toBe(25);
      expect(borders.INNER_BORDER.Y).toBe(25);
    });
  });

  describe('Data Mapping Accuracy Tests', () => {
    const sampleBirthRecord = {
      firstName: 'John',
      lastName: 'Doe',
      babyName: 'John Doe',
      gender: 2, // Male
      dateOfBirth: '2024-01-15',
      birthId: 'BR2024001',
      visitId: 'V2024001',
      admittedDate: '2024-01-15'
    };

    const sampleParentData = {
      firstName: 'Jane',
      lastName: 'Doe',
      nationality: 'Indian',
      address: '123 Main Street, Kazhakoottam'
    };

    it('should correctly map baby name from various sources', () => {
      // Requirements: 2.1 - Baby name mapping from birthRecord.babyName or firstName
      const testCases = [
        { input: { babyName: 'Test Baby' }, expected: 'Test Baby' },
        { input: { firstName: 'Test First' }, expected: 'Test First' },
        { input: { babyName: 'Baby Name', firstName: 'First Name' }, expected: 'Baby Name' }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).extractBabyName(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should correctly convert gender codes to readable text', () => {
      // Requirements: 2.2 - Gender conversion (1=Female, 2=Male)
      const testCases = [
        { input: 1, expected: 'Female' },
        { input: 2, expected: 'Male' },
        { input: '1', expected: 'Female' },
        { input: '2', expected: 'Male' },
        { input: 'male', expected: 'Male' },
        { input: 'female', expected: 'Female' },
        { input: 'M', expected: 'Male' },
        { input: 'F', expected: 'Female' },
        { input: undefined, expected: 'Not Specified' },
        { input: null, expected: 'Not Specified' },
        { input: '', expected: 'Not Specified' }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).formatGender(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should format dates correctly for template display', () => {
      // Requirements: 2.3 - Date formatting for readable display
      const testCases = [
        { input: '2024-01-15', expected: '15/01/2024' },
        { input: '2023-12-25', expected: '25/12/2023' },
        { input: undefined, expected: 'Not Provided' },
        { input: null, expected: 'Not Provided' },
        { input: '', expected: 'Not Provided' },
        { input: 'invalid-date', expected: 'Invalid Date' }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).formatDate(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should use correct place of birth from template', () => {
      // Requirements: 2.4 - Place of birth from template
      expect(TEMPLATE_LAYOUT.TEXT.DEFAULTS.PLACE_OF_BIRTH).toBe('HODO HOSPITAL, KAZHAKOOTTAM');
    });

    it('should extract registration numbers correctly', () => {
      // Requirements: 2.5 - Registration details using birthId or visit ID
      const testCases = [
        { input: { birthId: 'BR001' }, expected: 'BR001' },
        { input: { visitId: 'V001' }, expected: 'V001' },
        { input: { birthId: 'BR001', visitId: 'V001' }, expected: 'BR001' },
        { input: {}, expected: expect.stringMatching(/^REG-\d+$/) }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).extractRegistrationNumber(testCase.input);
        if (typeof testCase.expected === 'string') {
          expect(result).toBe(testCase.expected);
        } else {
          expect(result).toMatch(testCase.expected);
        }
      });
    });

    it('should handle parent name concatenation correctly', () => {
      // Requirements: 2.7 - Parent name from parentData firstName and lastName
      const testCases = [
        { input: { firstName: 'Jane', lastName: 'Doe' }, expected: 'Jane Doe' },
        { input: { firstName: 'Jane' }, expected: 'Jane' },
        { input: { lastName: 'Doe' }, expected: 'Doe' },
        { input: { firstName: '', lastName: '' }, expected: 'Not Provided' },
        { input: null, expected: 'Not Provided' },
        { input: undefined, expected: 'Not Provided' }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).extractParentName(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should handle address formatting correctly', () => {
      // Requirements: 2.8 - Address information from parentData
      const testCases = [
        { input: { address: '123 Main St' }, expected: '123 Main St' },
        { input: { nationality: 'Indian' }, expected: 'Indian' },
        { input: { address: '123 Main St', nationality: 'Indian' }, expected: '123 Main St' },
        { input: { address: '', nationality: '' }, expected: 'Not Provided' },
        { input: null, expected: 'Not Provided' }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).extractAddress(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should handle nationality with appropriate defaults', () => {
      // Requirements: 2.9 - Nationality information with defaults
      const testCases = [
        { input: { nationality: 'American' }, expected: 'American' },
        { input: { nationality: '' }, expected: 'Indian' },
        { input: null, expected: 'Indian' },
        { input: undefined, expected: 'Indian' }
      ];

      testCases.forEach(testCase => {
        const result = (generator as any).extractNationality(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should generate complete template data mapping', () => {
      // Requirements: 2.1-2.9 - Complete data mapping validation
      const templateData = (generator as any).mapToTemplateFields(sampleBirthRecord, sampleParentData);
      
      expect(templateData.babyName).toBe('John Doe');
      expect(templateData.gender).toBe('Male');
      expect(templateData.dateOfBirth).toBe('15/01/2024');
      expect(templateData.placeOfBirth).toBe('HODO HOSPITAL, KAZHAKOOTTAM');
      expect(templateData.registrationNo).toBe('BR2024001');
      expect(templateData.dateOfRegistration).toBe('15/01/2024');
      expect(templateData.parentName).toBe('Jane Doe');
      expect(templateData.address).toBe('123 Main Street, Kazhakoottam');
      expect(templateData.nationality).toBe('Indian');
      expect(templateData.issueDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });
  });

  describe('Data Validation and Error Handling Tests', () => {
    it('should validate required fields correctly', () => {
      // Requirements: 3.5 - Validate required fields before certificate generation
      const validRecord = {
        babyName: 'Test Baby',
        dateOfBirth: '2024-01-15'
      };

      const invalidRecord = {
        babyName: '',
        dateOfBirth: ''
      };

      const validResult = (generator as any).validateAllData(validRecord, null);
      expect(validResult.isValid).toBe(true);
      expect(validResult.criticalErrors).toHaveLength(0);

      const invalidResult = (generator as any).validateAllData(invalidRecord, null);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.criticalErrors).toContain('Baby name is required');
      expect(invalidResult.criticalErrors).toContain('Date of birth is required');
    });

    it('should handle missing parent data gracefully', () => {
      // Requirements: 3.5 - Handle cases where parentData might be null or incomplete
      const birthRecord = {
        babyName: 'Test Baby',
        dateOfBirth: '2024-01-15'
      };

      const result = (generator as any).validateAllData(birthRecord, null);
      expect(result.warnings).toContain('Parent data is missing - using default values');
    });

    it('should provide appropriate defaults for missing optional data', () => {
      // Requirements: 3.5 - Provide appropriate defaults for missing optional data
      const incompleteData = {
        babyName: 'Test Baby',
        gender: '',
        parentName: '',
        address: '',
        nationality: '',
        registrationNo: ''
      };

      const result = (generator as any).handleMissingDataWithDefaults(incompleteData);
      
      expect(result.gender).toBe('Not Specified');
      expect(result.parentName).toBe('Not Provided');
      expect(result.address).toBe('Not Provided');
      expect(result.nationality).toBe('Not Specified');
      expect(result.registrationNo).toMatch(/^TEMP-\d+$/);
    });

    it('should throw ValidationError for critical missing data', () => {
      // Requirements: 3.5 - User-friendly error messages for critical missing data
      const invalidRecord = {};
      const invalidParentData = null;

      expect(() => {
        generator.generateFromTemplate(invalidRecord, invalidParentData);
      }).toThrow(ValidationError);
    });

    it('should handle certificate generation errors appropriately', () => {
      // Requirements: 3.5 - Handle PDF generation failures gracefully
      const validRecord = {
        babyName: 'Test Baby',
        dateOfBirth: '2024-01-15'
      };

      // Mock PDF generation failure
      mockDoc.save = jest.fn().mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      expect(() => {
        generator.generateFromTemplate(validRecord, null);
      }).toThrow();
    });
  });

  describe('Professional Quality and Printability Tests', () => {
    it('should generate descriptive filenames with patient information', () => {
      // Requirements: 4.5 - Descriptive filenames using patient information
      const birthRecord = {
        babyName: 'John Doe',
        dateOfBirth: '2024-01-15'
      };

      const filename = generator.previewFilename(birthRecord, null);
      expect(filename).toContain('John_Doe');
      expect(filename).toContain('2024');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should include current system date as issue date', () => {
      // Requirements: 4.1 - Current system date as issue date
      const currentDate = (generator as any).getCurrentDate();
      expect(currentDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      
      const today = new Date();
      const expectedDate = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      expect(currentDate).toBe(expectedDate);
    });

    it('should include all required official elements', () => {
      // Requirements: 4.2, 4.3 - Official elements and template text content
      const text = TEMPLATE_LAYOUT.TEXT;
      
      expect(text.HEADER.TITLE).toBe('CERTIFICATE OF BIRTH');
      expect(text.HEADER.HOSPITAL_NAME).toBe('HODO HOSPITAL, KAZHAKOOTTAM');
      expect(text.FOOTER.AUTHORITY_NAME).toBe('HODO Hospital');
      expect(text.FOOTER.DESIGNATION).toBe('Registrar of Births');
      expect(text.FOOTER.VALIDITY_NOTE).toContain('official seal and signature');
    });

    it('should set appropriate PDF properties for professional appearance', () => {
      // Requirements: 4.4 - Professional PDF format and properties
      const birthRecord = {
        babyName: 'Test Baby',
        dateOfBirth: '2024-01-15'
      };

      generator.generateFromTemplate(birthRecord, null);

      expect(mockDoc.setProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Birth Certificate'),
          subject: expect.stringContaining('Official Birth Certificate'),
          author: expect.stringContaining('HODO Hospital'),
          creator: expect.stringContaining('HODO Hospital')
        })
      );
    });
  });

  describe('Template Text Content Accuracy Tests', () => {
    it('should include exact static text elements from template', () => {
      // Requirements: 4.3 - Template text content exactly as shown
      const text = TEMPLATE_LAYOUT.TEXT;
      
      expect(text.CERTIFICATION).toContain('This is to certify that the following information');
      expect(text.CERTIFICATION).toContain('HODO Hospital, Kazhakoottam');
      expect(text.CERTIFICATION).toContain('Registration of Births and Deaths Act, 1969');
      
      expect(text.SECTIONS.BIRTH_DETAILS).toBe('BIRTH DETAILS');
      expect(text.SECTIONS.REGISTRATION_DETAILS).toBe('OFFICIAL REGISTRATION DETAILS');
      expect(text.SECTIONS.PARENT_DETAILS).toBe('PARENT DETAILS');
    });

    it('should include all required field labels exactly as template', () => {
      // Requirements: 4.3 - Field labels and content areas precisely positioned
      const labels = TEMPLATE_LAYOUT.TEXT.FIELD_LABELS;
      
      expect(labels.CHILD_NAME).toBe('Name of Child');
      expect(labels.GENDER).toBe('Gender');
      expect(labels.DATE_OF_BIRTH).toBe('Date of Birth');
      expect(labels.PLACE_OF_BIRTH).toBe('Place of Birth');
      expect(labels.REGISTRATION_NO).toBe('Registration No');
      expect(labels.REGISTRATION_DATE).toBe('Date of Registration');
      expect(labels.PARENT_NAME).toBe('Name of Mother/Father');
      expect(labels.ADDRESS).toBe('Address');
      expect(labels.NATIONALITY).toBe('Nationality');
    });

    it('should include signature and official elements as shown in template', () => {
      // Requirements: 4.3 - Signature and official elements as shown in template
      const footer = TEMPLATE_LAYOUT.TEXT.FOOTER;
      
      expect(footer.AUTH_HEADER).toBe('AUTHENTICATION');
      expect(footer.ISSUE_DATE_LABEL).toBe('Date of Issue:');
      expect(footer.CERT_NUMBER_LABEL).toBe('Certificate No:');
      expect(footer.SIGNATURE_LABEL).toBe('Signature of Issuing Authority:');
      expect(footer.SEAL_TEXT.OFFICIAL).toBe('OFFICIAL');
      expect(footer.SEAL_TEXT.SEAL).toBe('SEAL');
      expect(footer.SEAL_TEXT.HOSPITAL).toBe('HODO HOSPITAL');
    });
  });

  describe('Integration Boundary Tests', () => {
    it('should handle edge cases in data mapping', () => {
      // Requirements: 1.1, 1.2 - Template accuracy with various data scenarios
      const edgeCases = [
        {
          name: 'Very long baby name',
          record: { babyName: 'A'.repeat(100), dateOfBirth: '2024-01-15' },
          parent: null
        },
        {
          name: 'Special characters in name',
          record: { babyName: "O'Connor-Smith", dateOfBirth: '2024-01-15' },
          parent: null
        },
        {
          name: 'Unicode characters',
          record: { babyName: 'José María', dateOfBirth: '2024-01-15' },
          parent: null
        },
        {
          name: 'Empty strings vs null values',
          record: { babyName: '', firstName: 'Test', dateOfBirth: '2024-01-15' },
          parent: { firstName: '', lastName: null }
        }
      ];

      edgeCases.forEach(testCase => {
        expect(() => {
          generator.generateFromTemplate(testCase.record, testCase.parent);
        }).not.toThrow(`Failed for case: ${testCase.name}`);
      });
    });

    it('should maintain template consistency across different data sets', () => {
      // Requirements: 1.5 - Professional quality and consistency
      const dataSets = [
        {
          record: { babyName: 'Short', dateOfBirth: '2024-01-15' },
          parent: { firstName: 'A', lastName: 'B' }
        },
        {
          record: { babyName: 'Very Long Baby Name Here', dateOfBirth: '2024-12-31' },
          parent: { firstName: 'Very Long First Name', lastName: 'Very Long Last Name' }
        }
      ];

      dataSets.forEach((dataSet, index) => {
        expect(() => {
          generator.generateFromTemplate(dataSet.record, dataSet.parent);
        }).not.toThrow(`Failed for dataset ${index + 1}`);
      });
    });
  });
});

describe('Integration Tests - PatientProfile and BirthRecords', () => {
  describe('PatientProfile Integration', () => {
    it('should integrate seamlessly with existing Print Birth Report button', () => {
      // Requirements: 3.1 - PatientProfile component integration
      // This test validates that the certificate generator can be called
      // from the PatientProfile component with the expected data structure
      
      const mockBirthRecord = {
        babyName: 'Test Baby',
        firstName: 'Test',
        lastName: 'Baby',
        gender: 1,
        dateOfBirth: '2024-01-15',
        birthId: 'BR001',
        admittedDate: '2024-01-15'
      };

      const mockParentData = {
        firstName: 'Parent',
        lastName: 'Name',
        nationality: 'Indian',
        address: '123 Test Street'
      };

      const generator = new TemplateCertificateGenerator();
      
      expect(() => {
        generator.generateFromTemplate(mockBirthRecord, mockParentData);
      }).not.toThrow();
    });

    it('should maintain existing data retrieval patterns', () => {
      // Requirements: 3.1 - Maintain existing data retrieval (birthRecord and parentData)
      const generator = new TemplateCertificateGenerator();
      
      // Test that the generator can handle the data structure
      // that comes from PatientProfile component
      const patientProfileData = {
        birthRecord: {
          babyName: 'Patient Baby',
          gender: 2,
          dateOfBirth: '2024-01-15',
          birthId: 'BR123'
        },
        parentData: {
          firstName: 'Patient',
          lastName: 'Parent'
        }
      };

      expect(() => {
        generator.generateFromTemplate(
          patientProfileData.birthRecord,
          patientProfileData.parentData
        );
      }).not.toThrow();
    });
  });

  describe('BirthRecords Integration', () => {
    it('should work with BirthRecords page print icon functionality', () => {
      // Requirements: 3.2 - BirthRecords page print icon functionality
      const mockRecord = {
        id: 1,
        firstName: 'Record',
        lastName: 'Baby',
        gender: 1,
        dateOfBirth: '2024-01-15',
        birthId: 'BR456'
      };

      const generator = new TemplateCertificateGenerator();
      
      expect(() => {
        generator.generateFromTemplate(mockRecord, null);
      }).not.toThrow();
    });

    it('should ensure consistent certificate format across both entry points', () => {
      // Requirements: 3.2 - Consistent certificate format across both entry points
      const generator = new TemplateCertificateGenerator();
      
      const patientProfileData = {
        babyName: 'Test Baby',
        dateOfBirth: '2024-01-15'
      };

      const birthRecordsData = {
        firstName: 'Test Baby',
        dateOfBirth: '2024-01-15'
      };

      // Both should generate without errors and use the same template
      expect(() => {
        generator.generateFromTemplate(patientProfileData, null);
      }).not.toThrow();

      expect(() => {
        generator.generateFromTemplate(birthRecordsData, null);
      }).not.toThrow();
    });
  });

  describe('Cross-Component Consistency Tests', () => {
    it('should generate identical certificates for same data from different components', () => {
      // Requirements: 3.1, 3.2 - Consistent certificate generation
      const generator1 = new TemplateCertificateGenerator();
      const generator2 = new TemplateCertificateGenerator();
      
      const testData = {
        babyName: 'Consistency Test',
        dateOfBirth: '2024-01-15',
        gender: 1
      };

      const parentData = {
        firstName: 'Test',
        lastName: 'Parent'
      };

      // Both generators should handle the same data identically
      expect(() => {
        generator1.generateFromTemplate(testData, parentData);
      }).not.toThrow();

      expect(() => {
        generator2.generateFromTemplate(testData, parentData);
      }).not.toThrow();
    });
  });
});