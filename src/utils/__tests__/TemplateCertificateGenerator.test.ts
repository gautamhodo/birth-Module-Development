import { TemplateCertificateGenerator, BirthRecordInput, ParentDataInput } from '../TemplateCertificateGenerator';

// Mock jsPDF to avoid actual PDF generation in tests
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
    circle: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(['Test line 1', 'Test line 2']),
    getTextWidth: jest.fn().mockReturnValue(50),
    save: jest.fn(),
    output: jest.fn().mockReturnValue('mock-pdf-blob'),
    internal: {
      pageSize: {
        width: 210,
        height: 297
      }
    },
    setDisplayMode: jest.fn(),
    setLineCap: jest.fn(),
    setLineJoin: jest.fn()
  }));
});

describe('TemplateCertificateGenerator - Task 8: Filename Generation and Download', () => {
  let generator: TemplateCertificateGenerator;
  let mockBirthRecord: BirthRecordInput;
  let mockParentData: ParentDataInput;

  beforeEach(() => {
    generator = new TemplateCertificateGenerator();
    
    mockBirthRecord = {
      firstName: 'John',
      lastName: 'Doe',
      babyName: 'John Doe',
      gender: '2',
      dateOfBirth: '2024-01-15',
      birthId: 'BIRTH123',
      visitId: 'VISIT456',
      admittedDate: '2024-01-16'
    };

    mockParentData = {
      firstName: 'Jane',
      lastName: 'Doe',
      nationality: 'Indian',
      address: '123 Main Street, Kazhakoottam, Kerala'
    };

    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Descriptive Filename Generation', () => {
    test('should generate descriptive filename with patient information', () => {
      const filename = generator.previewFilename(mockBirthRecord, mockParentData);
      
      expect(filename).toContain('John_Doe');
      expect(filename).toContain('BirthCertificate');
      expect(filename).toContain('DOB_2024-01-15');
      expect(filename).toContain('Reg_BIRTH123');
      expect(filename).toContain('Issued_');
      expect(filename).toEndWith('.pdf');
    });

    test('should handle missing baby name gracefully', () => {
      const recordWithoutName = { ...mockBirthRecord, babyName: '', firstName: '', lastName: '' };
      const filename = generator.previewFilename(recordWithoutName, mockParentData);
      
      expect(filename).toContain('UnknownName');
      expect(filename).toContain('BirthCertificate');
      expect(filename).toEndWith('.pdf');
    });

    test('should sanitize special characters in filename', () => {
      const recordWithSpecialChars = {
        ...mockBirthRecord,
        babyName: 'John/Doe<>:"|?*Smith'
      };
      
      const filename = generator.previewFilename(recordWithSpecialChars, mockParentData);
      
      expect(filename).not.toMatch(/[<>:"/\\|?*]/);
      expect(filename).toContain('John_DoeSmith');
    });

    test('should include current system date in filename', () => {
      const filename = generator.previewFilename(mockBirthRecord, mockParentData);
      const currentDate = new Date().toISOString().slice(0, 10);
      
      expect(filename).toContain(`Issued_${currentDate}`);
    });

    test('should truncate overly long filenames', () => {
      const recordWithLongName = {
        ...mockBirthRecord,
        babyName: 'A'.repeat(100),
        birthId: 'B'.repeat(50)
      };
      
      const filename = generator.previewFilename(recordWithLongName, mockParentData);
      
      expect(filename.length).toBeLessThanOrEqual(200);
      expect(filename).toEndWith('.pdf');
    });

    test('should handle missing birth date in filename', () => {
      const recordWithoutDate = { ...mockBirthRecord, dateOfBirth: '' };
      const filename = generator.previewFilename(recordWithoutDate, mockParentData);
      
      expect(filename).toContain('BirthCertificate');
      expect(filename).not.toContain('DOB_');
      expect(filename).toEndWith('.pdf');
    });

    test('should use registration number in filename', () => {
      const filename = generator.previewFilename(mockBirthRecord, mockParentData);
      
      expect(filename).toContain('Reg_BIRTH123');
    });

    test('should fallback to visitId if birthId is missing', () => {
      const recordWithoutBirthId = { ...mockBirthRecord, birthId: '' };
      const filename = generator.previewFilename(recordWithoutBirthId, mockParentData);
      
      expect(filename).toContain('Reg_VISIT456');
    });
  });

  describe('Download Functionality', () => {
    test('should generate and download certificate successfully', async () => {
      const mockSave = jest.fn();
      (generator as any).doc.save = mockSave;

      await expect(
        generator.generateAndDownloadCertificate(mockBirthRecord, mockParentData)
      ).resolves.toBeUndefined();

      expect(mockSave).toHaveBeenCalledWith(
        expect.stringContaining('John_Doe_BirthCertificate')
      );
    });

    test('should handle download errors gracefully', async () => {
      const mockSave = jest.fn().mockImplementation(() => {
        throw new Error('Download failed');
      });
      (generator as any).doc.save = mockSave;

      await expect(
        generator.generateAndDownloadCertificate(mockBirthRecord, mockParentData)
      ).rejects.toThrow('Download failed');
    });

    test('should validate required data before download', async () => {
      const invalidRecord = { ...mockBirthRecord, babyName: '', firstName: '', dateOfBirth: '' };

      await expect(
        generator.generateAndDownloadCertificate(invalidRecord, mockParentData)
      ).rejects.toThrow('Certificate generation failed');
    });
  });

  describe('Current System Date Integration', () => {
    test('should include current system date as issue date', () => {
      const currentDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // Test the private method through public interface
      generator.generateFromTemplate(mockBirthRecord, mockParentData);

      // Verify that the current date is used in the certificate
      const mockText = (generator as any).doc.text;
      const textCalls = mockText.mock.calls;
      
      // Check if current date appears in any text call
      const hasCurrentDate = textCalls.some((call: any[]) => 
        call[0] && call[0].toString().includes(currentDate)
      );
      
      expect(hasCurrentDate).toBe(true);
    });

    test('should format current date correctly for certificate', () => {
      const generator = new TemplateCertificateGenerator();
      const currentDate = (generator as any).getCurrentDate();
      
      // Should be in DD/MM/YYYY format
      expect(currentDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      
      // Should be today's date
      const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      expect(currentDate).toBe(today);
    });
  });

  describe('Cross-Browser Compatibility', () => {
    test('should detect browser download capabilities', () => {
      const checkSupport = (generator as any).checkBrowserDownloadSupport();
      expect(typeof checkSupport).toBe('boolean');
    });

    test('should get appropriate download method for browser', () => {
      const downloadMethod = (generator as any).getBrowserOptimizedDownloadMethod();
      expect(['native', 'blob', 'fallback']).toContain(downloadMethod);
    });

    test('should handle download failure gracefully', () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation();
      
      (generator as any).showDownloadFailureMessage();
      
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Certificate generated successfully, but download failed')
      );
      
      mockAlert.mockRestore();
    });
  });
});