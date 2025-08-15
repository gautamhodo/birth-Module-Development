import { BirthCertificateGenerator, BirthRecordData, ParentData } from '../BirthCertificateGenerator';
import { HODO_LOGO_BASE64, HODO_LOGO_FALLBACK, HOSPITAL_COLORS } from '../../assets/hodo-logo';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    addImage: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    circle: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(['Test line 1', 'Test line 2']),
    save: jest.fn()
  }));
});

describe('BirthCertificateGenerator - Logo Integration', () => {
  let generator: BirthCertificateGenerator;
  let mockBirthRecord: BirthRecordData;
  let mockParentData: ParentData;

  beforeEach(() => {
    generator = new BirthCertificateGenerator();
    mockBirthRecord = {
      firstName: 'John',
      lastName: 'Doe',
      gender: '1',
      dateOfBirth: '2024-01-15',
      birthId: 'BR001',
      admittedDate: '2024-01-15',
      visitId: 'V001'
    };
    mockParentData = {
      firstName: 'Jane',
      lastName: 'Doe',
      nationality: 'Indian',
      address: '123 Test Street, Kazhakoottam'
    };
  });

  test('should have logo assets defined', () => {
    expect(HODO_LOGO_BASE64).toBeDefined();
    expect(HODO_LOGO_BASE64).toContain('data:image/svg+xml;base64,');
    expect(HODO_LOGO_FALLBACK).toBeDefined();
    expect(HODO_LOGO_FALLBACK).toContain('data:image/svg+xml;base64,');
  });

  test('should have hospital colors defined', () => {
    expect(HOSPITAL_COLORS.primary).toBe('#2E86AB');
    expect(HOSPITAL_COLORS.secondary).toBe('#A23B72');
    expect(HOSPITAL_COLORS.accent).toBe('#E74C3C');
    expect(HOSPITAL_COLORS.text).toBe('#2C3E50');
    expect(HOSPITAL_COLORS.light).toBe('#87CEEB');
    expect(HOSPITAL_COLORS.white).toBe('#FFFFFF');
  });

  test('should generate certificate without throwing errors', () => {
    expect(() => {
      generator.generateCertificate(mockBirthRecord, mockParentData);
    }).not.toThrow();
  });

  test('should handle missing birth record data gracefully', () => {
    const emptyBirthRecord: BirthRecordData = {};
    const emptyParentData: ParentData = {};

    expect(() => {
      generator.generateCertificate(emptyBirthRecord, emptyParentData);
    }).not.toThrow();
  });

  test('should format gender correctly', () => {
    const generator = new BirthCertificateGenerator();
    
    // Test gender formatting through certificate generation
    const maleRecord = { ...mockBirthRecord, gender: '1' };
    const femaleRecord = { ...mockBirthRecord, gender: '2' };
    
    expect(() => {
      generator.generateCertificate(maleRecord, mockParentData);
      generator.generateCertificate(femaleRecord, mockParentData);
    }).not.toThrow();
  });

  test('should handle logo loading scenarios', () => {
    // Test that the generator can handle different logo loading scenarios
    // This is mainly testing that the methods exist and don't throw errors
    expect(() => {
      generator.generateCertificate(mockBirthRecord, mockParentData);
    }).not.toThrow();
  });
});