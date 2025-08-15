import jsPDF from 'jspdf';
import { HODO_LOGO_BASE64, HODO_LOGO_FALLBACK, HOSPITAL_COLORS } from './assets/hodo-logo';

// TypeScript interfaces for certificate data mapping
export interface CertificateData {
  babyName: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  registrationNo: string;
  dateOfRegistration: string;
  parentName: string;
  address: string;
  nationality: string;
  issueDate: string;
  issuingAuthority: string;
}

export interface BirthRecordData {
  firstName?: string;
  lastName?: string;
  gender?: string | number;
  dateOfBirth?: string;
  birthId?: string;
  admittedDate?: string;
  visitId?: string;
}

export interface ParentData {
  firstName?: string;
  lastName?: string;
  nationality?: string;
  address?: string;
}

// Error types for comprehensive error handling
export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'warning';
}

export interface CertificateGenerationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  message: string;
}

export class BirthCertificateGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  /**
   * Set consistent text formatting for different text elements
   * Requirements: 4.1, 4.4, 4.5 - Professional typography with proper font sizing and weight
   */
  private setTextFormat(type: 'title' | 'subtitle' | 'header' | 'label' | 'value' | 'important' | 'note'): void {
    switch (type) {
      case 'title':
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(20);
        this.doc.setTextColor(HOSPITAL_COLORS.primary);
        break;
      case 'subtitle':
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(14);
        this.doc.setTextColor(HOSPITAL_COLORS.secondary);
        break;
      case 'header':
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(11);
        this.doc.setTextColor(HOSPITAL_COLORS.secondary);
        break;
      case 'label':
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(10);
        this.doc.setTextColor(HOSPITAL_COLORS.primary);
        break;
      case 'value':
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        this.doc.setTextColor(HOSPITAL_COLORS.text);
        break;
      case 'important':
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(11);
        this.doc.setTextColor(HOSPITAL_COLORS.text);
        break;
      case 'note':
        this.doc.setFont('helvetica', 'italic');
        this.doc.setFontSize(7);
        this.doc.setTextColor(HOSPITAL_COLORS.light);
        break;
    }
  }

  /**
   * Main method to generate the birth certificate with comprehensive error handling
   * Requirements: 3.3, 3.4 - Data validation and user-friendly error messages
   */
  public generateCertificate(birthRecord: BirthRecordData, parentData: ParentData): CertificateGenerationResult {
    try {
      // Step 1: Validate input data before generation
      const validationResult = this.validateCertificateData(birthRecord, parentData);

      // Check for critical errors that prevent certificate generation
      if (validationResult.errors.length > 0) {
        return {
          success: false,
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          message: 'Certificate generation failed due to missing critical data. Please provide the required information.'
        };
      }

      // Step 2: Map the data to certificate format with fallback handling
      const certificateData = this.mapDataToCertificate(birthRecord, parentData);

      // Step 3: Initialize the document with error handling
      this.initializeDocumentSafely();

      // Step 4: Add all certificate sections with error handling
      this.addLogo();
      this.addHeader();
      this.addCertificationText();
      this.addDataFields(certificateData);
      this.addFooter(certificateData);

      // Step 5: Save the document with error handling
      this.saveDocumentSafely(certificateData.babyName);

      // Return success result with any warnings
      return {
        success: true,
        errors: [],
        warnings: validationResult.warnings,
        message: validationResult.warnings.length > 0
          ? 'Certificate generated successfully with some default values used for missing optional data.'
          : 'Certificate generated successfully.'
      };

    } catch (error) {
      console.error('Certificate generation failed:', error);

      return {
        success: false,
        errors: [{
          field: 'system',
          message: 'An unexpected error occurred during certificate generation. Please try again.',
          severity: 'critical'
        }],
        warnings: [],
        message: 'Certificate generation failed due to a system error. Please contact support if the problem persists.'
      };
    }
  }

  /**
   * Validate certificate data before generation
   * Requirements: 3.3, 3.4 - Data validation and user-friendly error messages
   */
  private validateCertificateData(birthRecord: BirthRecordData, parentData: ParentData): { errors: ValidationError[], warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Critical validations - these prevent certificate generation
    if (!birthRecord) {
      errors.push({
        field: 'birthRecord',
        message: 'Birth record data is required to generate the certificate.',
        severity: 'critical'
      });
      return { errors, warnings }; // Return early if no birth record
    }

    // Validate baby name (critical)
    if (!birthRecord.firstName?.trim() && !birthRecord.lastName?.trim()) {
      errors.push({
        field: 'babyName',
        message: 'Baby name is required. Please provide at least a first name or last name.',
        severity: 'critical'
      });
    }

    // Validate date of birth (critical)
    if (!birthRecord.dateOfBirth?.trim()) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Date of birth is required for the certificate.',
        severity: 'critical'
      });
    } else {
      // Validate date format
      const birthDate = new Date(birthRecord.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        errors.push({
          field: 'dateOfBirth',
          message: 'Invalid date of birth format. Please provide a valid date.',
          severity: 'critical'
        });
      } else {
        // Check if birth date is in the future
        const today = new Date();
        if (birthDate > today) {
          errors.push({
            field: 'dateOfBirth',
            message: 'Date of birth cannot be in the future.',
            severity: 'critical'
          });
        }

        // Check if birth date is too far in the past (more than 150 years)
        const maxAge = new Date();
        maxAge.setFullYear(maxAge.getFullYear() - 150);
        if (birthDate < maxAge) {
          warnings.push({
            field: 'dateOfBirth',
            message: 'Birth date appears to be very old. Please verify the date is correct.',
            severity: 'warning'
          });
        }
      }
    }

    // Warning validations - these allow generation but with fallback values

    // Validate gender (warning only)
    if (!birthRecord.gender) {
      warnings.push({
        field: 'gender',
        message: 'Gender information is missing. "Not Specified" will be used.',
        severity: 'warning'
      });
    }

    // Validate registration information (warning only)
    if (!birthRecord.birthId?.trim() && !birthRecord.visitId?.trim()) {
      warnings.push({
        field: 'registrationNo',
        message: 'Registration number is missing. A temporary number will be generated.',
        severity: 'warning'
      });
    }

    if (!birthRecord.admittedDate?.trim()) {
      warnings.push({
        field: 'dateOfRegistration',
        message: 'Registration date is missing. Current date will be used.',
        severity: 'warning'
      });
    }

    // Validate parent data (warning only)
    if (!parentData) {
      warnings.push({
        field: 'parentData',
        message: 'Parent information is missing. Default values will be used.',
        severity: 'warning'
      });
    } else {
      if (!parentData.firstName?.trim() && !parentData.lastName?.trim()) {
        warnings.push({
          field: 'parentName',
          message: 'Parent name is missing. "Parent Name Not Provided" will be used.',
          severity: 'warning'
        });
      }

      if (!parentData.address?.trim() && !parentData.nationality?.trim()) {
        warnings.push({
          field: 'address',
          message: 'Address information is missing. "Address Not Provided" will be used.',
          severity: 'warning'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Map birth record and parent data to certificate format
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9
   */
  private mapDataToCertificate(birthRecord: BirthRecordData, parentData: ParentData): CertificateData {
    return {
      babyName: this.transformBabyName(birthRecord),
      gender: this.transformGender(birthRecord.gender),
      dateOfBirth: this.transformBirthDate(birthRecord.dateOfBirth),
      placeOfBirth: this.getDefaultPlaceOfBirth(),
      registrationNo: this.transformRegistrationNumber(birthRecord),
      dateOfRegistration: this.transformRegistrationDate(birthRecord.admittedDate),
      parentName: this.transformParentName(parentData),
      address: this.transformAddress(parentData),
      nationality: this.getDefaultNationality(),
      issueDate: this.getCurrentDate(),
      issuingAuthority: "HODO Hospital"
    };
  }

  /**
   * Initialize A4 document with proper margins and professional layout (with error handling)
   * Requirements: 3.3, 4.1, 4.6 - Official document appearance with clean background and A4 paper size
   */
  private initializeDocumentSafely(): void {
    try {
      this.initializeDocument();
    } catch (error) {
      console.warn('Error during document initialization, using fallback:', error);
      // Fallback: Create a basic document without advanced features
      this.initializeBasicDocument();
    }
  }

  /**
   * Initialize A4 document with proper margins and professional layout
   * Requirements: 3.3, 4.1, 4.6 - Official document appearance with clean background and A4 paper size
   */
  private initializeDocument(): void {
    // Set document metadata for official document properties
    this.doc.setProperties({
      title: 'Birth Certificate - HODO Hospital',
      subject: 'Official Birth Certificate',
      author: 'HODO Hospital, Kazhakoottam',
      creator: 'HODO Hospital Birth Registration System'
    });

    // Set white background for professional appearance
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, 210, 297, 'F');

    // Add main border with 20mm margins as per design specification
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(1);
    this.doc.rect(20, 20, 170, 257, 'S');

    // Add inner decorative border for professional appearance
    this.doc.setDrawColor(100, 100, 100);
    this.doc.setLineWidth(0.3);
    this.doc.rect(25, 25, 160, 247, 'S');

    // Add document security elements
    this.addDocumentSecurityElements();
  }

  /**
   * Add security elements to the document for authenticity
   * Requirements: 3.3 - Official document appearance with security features
   */
  private addDocumentSecurityElements(): void {
    // Add small security marks in corners
    this.doc.setFontSize(6);
    this.doc.setTextColor(200, 200, 200);
    this.doc.setFont('helvetica', 'normal');

    // Top corners
    this.doc.text('HODO', 22, 24);
    this.doc.text(this.getCurrentDateTime(), 160, 24);

    // Bottom corners
    this.doc.text('OFFICIAL', 22, 274);
    this.doc.text('AUTHENTIC', 160, 274);
  }

  /**
   * Add HODO Hospital logo with proper positioning and sizing
   * Requirements: 1.2, 4.2 - Logo positioned at top left with proper sizing and hospital branding
   */
  private addLogo(): void {
    // Logo position: Top left (30mm from left, 30mm from top) as per design specification
    const logoX = 30;
    const logoY = 30;
    const logoWidth = 35;
    const logoHeight = 23;

    try {
      // Attempt to add the main HODO Hospital logo
      this.addLogoImage(HODO_LOGO_BASE64, logoX, logoY, logoWidth, logoHeight);
    } catch (primaryError) {
      console.warn('Primary logo failed to load, attempting fallback:', primaryError);

      try {
        // Attempt fallback logo
        this.addLogoImage(HODO_LOGO_FALLBACK, logoX, logoY, logoWidth, logoHeight);
      } catch (fallbackError) {
        console.warn('Fallback logo failed to load, using text-based logo:', fallbackError);

        // Final fallback: text-based logo with hospital colors
        this.addTextBasedLogo(logoX, logoY, logoWidth, logoHeight);
      }
    }
  }

  /**
   * Add logo image with proper error handling
   * Requirements: 1.2 - HODO Hospital logo with appropriate color theme
   */
  private addLogoImage(logoData: string, x: number, y: number, width: number, height: number): void {
    // Add logo with proper sizing and positioning
    this.doc.addImage(logoData, 'SVG', x, y, width, height);

    // Add subtle border around logo for professional appearance
    this.doc.setDrawColor(HOSPITAL_COLORS.primary);
    this.doc.setLineWidth(0.3);
    this.doc.rect(x - 1, y - 1, width + 2, height + 2, 'S');
  }

  /**
   * Fallback text-based logo when image loading fails
   * Requirements: 1.2, 4.2 - Hospital branding with proper color theme integration
   */
  private addTextBasedLogo(x: number, y: number, width: number, height: number): void {
    // Professional logo container with hospital colors
    this.doc.setFillColor(HOSPITAL_COLORS.primary);
    this.doc.setDrawColor(HOSPITAL_COLORS.primary);
    this.doc.setLineWidth(2);
    this.doc.rect(x, y, width, height, 'S');

    // Add subtle inner border
    this.doc.setDrawColor(HOSPITAL_COLORS.secondary);
    this.doc.setLineWidth(0.5);
    this.doc.rect(x + 2, y + 2, width - 4, height - 4, 'S');

    // Hospital name with proper branding colors
    this.doc.setFontSize(16);
    this.doc.setTextColor(HOSPITAL_COLORS.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('HODO', x + width / 2, y + height / 2 - 2, { align: 'center' });

    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('HOSPITAL', x + width / 2, y + height / 2 + 6, { align: 'center' });

    // Add medical cross symbol with proper medical red color
    const crossX = x + width / 2;
    const crossY = y + 5;

    this.doc.setDrawColor(HOSPITAL_COLORS.accent);
    this.doc.setLineWidth(3);
    // Horizontal line of cross
    this.doc.line(crossX - 6, crossY, crossX + 6, crossY);
    // Vertical line of cross
    this.doc.line(crossX, crossY - 4, crossX, crossY + 4);

    // Add small decorative elements
    this.doc.setFillColor(HOSPITAL_COLORS.secondary);
    this.doc.circle(x + 5, y + height - 5, 1.5, 'F');
    this.doc.circle(x + width - 5, y + height - 5, 1.5, 'F');
  }

  /**
   * Add header section with title and hospital name formatting
   * Requirements: 4.1, 4.4, 4.5 - Professional typography with proper font sizing, text alignment and spacing
   */
  private addHeader(): void {
    // Main title with consistent text formatting
    this.setTextFormat('title');
    this.doc.text('CERTIFICATE OF BIRTH', 105, 60, { align: 'center' });

    // Hospital name with proper text alignment and consistent formatting
    this.setTextFormat('subtitle');
    this.doc.text('HODO HOSPITAL, KAZHAKOOTTAM', 105, 72, { align: 'center' });

    // Subtitle with appropriate font sizing for text hierarchy
    this.doc.setFontSize(9);
    this.doc.setTextColor(HOSPITAL_COLORS.text);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Official Birth Certificate', 105, 80, { align: 'center' });

    // Decorative lines with proper spacing for readability
    this.doc.setDrawColor(HOSPITAL_COLORS.primary);
    this.doc.setLineWidth(0.8);
    this.doc.line(35, 86, 175, 86);

    // Secondary decorative line with consistent spacing
    this.doc.setDrawColor(HOSPITAL_COLORS.secondary);
    this.doc.setLineWidth(0.3);
    this.doc.line(35, 88, 175, 88);
  }

  /**
   * Add certification statement text with proper formatting
   * Requirements: 1.5, 4.1, 4.4, 4.5 - Standard certification text with professional typography and proper spacing
   */
  private addCertificationText(): void {
    // Set consistent font formatting for certification text
    this.doc.setFontSize(11);
    this.doc.setTextColor(HOSPITAL_COLORS.text);
    this.doc.setFont('helvetica', 'normal');

    // Standard certification text as per requirement 1.5
    const certificationText = 'This is to certify that the following information has been taken from the original record of birth which is in the register of HODO Hospital, Kazhakoottam.';

    // Split text for proper wrapping with precise margins for readability
    const lines = this.doc.splitTextToSize(certificationText, 140);

    // Add text with proper alignment and spacing
    this.doc.text(lines, 35, 100);

    // Add subtle emphasis box around certification text for professional appearance
    const textHeight = lines.length * 4.5;
    this.doc.setDrawColor(HOSPITAL_COLORS.light);
    this.doc.setLineWidth(0.3);
    this.doc.rect(32, 95, 146, textHeight + 8, 'S');
  }

  /**
   * Add structured layout for certificate fields with proper positioning
   * Requirements: 4.1, 4.4, 4.5 - Professional typography, proper margins, spacing, field labels and alignment
   */
  private addDataFields(data: CertificateData): void {
    const startY = 120;
    const lineHeight = 13;
    const sectionSpacing = 6;
    const labelX = 35;
    const valueX = 100;
    let currentY = startY;

    // Helper function to add a field with consistent formatting and proper font sizing
    const addField = (label: string, value: string, isImportant: boolean = false) => {
      // Field label with consistent text formatting
      this.setTextFormat('label');
      this.doc.text(`${label}:`, labelX, currentY);

      // Field value with proper font sizing and weight for different text elements
      if (isImportant) {
        this.setTextFormat('important');
      } else {
        this.setTextFormat('value');
      }

      // Ensure proper text alignment for values
      this.doc.text(value, valueX, currentY);

      // Add subtle underline for data fields with consistent spacing
      this.doc.setDrawColor(HOSPITAL_COLORS.light);
      this.doc.setLineWidth(0.2);
      this.doc.line(valueX, currentY + 1.5, 170, currentY + 1.5);

      currentY += lineHeight;
    };

    // Helper function to add section headers with consistent formatting
    const addSectionHeader = (title: string) => {
      // Add section spacing for proper readability
      currentY += sectionSpacing;

      // Section header with consistent text formatting
      this.setTextFormat('header');
      this.doc.text(title, labelX, currentY);

      // Add decorative underline for section headers
      this.doc.setDrawColor(HOSPITAL_COLORS.secondary);
      this.doc.setLineWidth(0.5);
      this.doc.line(labelX, currentY + 2, labelX + this.doc.getTextWidth(title), currentY + 2);

      currentY += 10;
    };

    // Birth Details Section with proper text alignment and spacing
    addSectionHeader('BIRTH DETAILS');
    addField('Name of Child', data.babyName, true);
    addField('Gender', data.gender);
    addField('Date of Birth', data.dateOfBirth, true);
    addField('Place of Birth', data.placeOfBirth);

    // Registration Details Section with enhanced official formatting
    // Requirements: 3.1, 3.2 - Registration number and date fields as official elements
    addSectionHeader('OFFICIAL REGISTRATION DETAILS');
    addField('Registration No', data.registrationNo, true);
    addField('Date of Registration', data.dateOfRegistration, true);

    // Add registration authority
    addField('Registering Authority', 'HODO Hospital, Kazhakoottam');

    // Parent Details Section with proper spacing
    addSectionHeader('PARENT DETAILS');
    addField('Name of Mother/Father', data.parentName);
    addField('Address', data.address);
    addField('Nationality', data.nationality);
  }

  /**
   * Add footer section with authentication and official elements
   * Requirements: 3.1, 3.2, 3.3 - Current system date, issuing authority signature, official document formatting
   */
  private addFooter(data: CertificateData): void {
    const footerStartY = 240;

    // Add separator line before footer with proper spacing
    this.doc.setDrawColor(HOSPITAL_COLORS.primary);
    this.doc.setLineWidth(0.5);
    this.doc.line(35, footerStartY - 5, 175, footerStartY - 5);

    // Authentication section header
    this.setTextFormat('header');
    this.doc.setFontSize(10);
    this.doc.text('AUTHENTICATION', 35, footerStartY + 2);

    // Issue date with consistent text formatting and proper alignment
    // Requirement 3.1: Include current system date as issue date
    this.setTextFormat('label');
    this.doc.setFontSize(9);
    this.doc.text('Date of Issue:', 35, footerStartY + 10);
    this.setTextFormat('value');
    this.doc.setFontSize(9);
    this.doc.text(data.issueDate, 68, footerStartY + 10);

    // Certificate number for official tracking
    this.setTextFormat('label');
    this.doc.setFontSize(9);
    this.doc.text('Certificate No:', 35, footerStartY + 20);
    this.setTextFormat('value');
    this.doc.setFontSize(9);
    const certificateNo = this.generateCertificateNumber(data.registrationNo);
    this.doc.text(certificateNo, 68, footerStartY + 20);

    // Signature section with consistent text formatting and proper spacing
    // Requirement 3.2: Include "HODO Hospital" as signature of issuing authority
    this.setTextFormat('label');
    this.doc.setFontSize(9);
    this.doc.text('Signature of Issuing Authority:', 35, footerStartY + 32);

    // Signature line with proper positioning and spacing
    this.doc.setDrawColor(HOSPITAL_COLORS.text);
    this.doc.setLineWidth(0.5);
    this.doc.line(35, footerStartY + 46, 110, footerStartY + 46);

    // Issuing authority name with consistent text formatting
    this.setTextFormat('header');
    this.doc.setFontSize(10);
    this.doc.text(data.issuingAuthority, 35, footerStartY + 52);

    // Official designation
    this.setTextFormat('value');
    this.doc.setFontSize(8);
    this.doc.text('Registrar of Births', 35, footerStartY + 58);

    // Official seal with proper sizing and text alignment
    // Requirement 3.3: Appropriate spacing and layout for official document appearance
    const sealX = 140;
    const sealY = footerStartY + 35;

    // Outer circle for official seal
    this.doc.setDrawColor(HOSPITAL_COLORS.primary);
    this.doc.setLineWidth(1.5);
    this.doc.circle(sealX, sealY, 18, 'S');

    // Inner circle with consistent spacing
    this.doc.setDrawColor(HOSPITAL_COLORS.secondary);
    this.doc.setLineWidth(0.5);
    this.doc.circle(sealX, sealY, 15, 'S');

    // Seal text with proper font sizing and weight
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(HOSPITAL_COLORS.primary);
    this.doc.text('OFFICIAL', sealX, sealY - 3, { align: 'center' });
    this.doc.text('SEAL', sealX, sealY + 3, { align: 'center' });
    this.doc.setFontSize(6);
    this.doc.setTextColor(HOSPITAL_COLORS.secondary);
    this.doc.text('HODO HOSPITAL', sealX, sealY + 9, { align: 'center' });

    // Add date stamp within seal
    this.doc.setFontSize(5);
    this.doc.setTextColor(HOSPITAL_COLORS.text);
    const currentYear = new Date().getFullYear().toString();
    this.doc.text(currentYear, sealX, sealY + 14, { align: 'center' });

    // Certificate validity note with consistent text formatting and proper alignment
    this.setTextFormat('note');
    this.doc.text('This certificate is valid only with official seal and signature', 105, footerStartY + 65, { align: 'center' });

    // Security watermark text
    this.addSecurityWatermark();
  }

  /**
   * Generate unique certificate number for official tracking
   * Requirements: 3.1, 3.2 - Official document elements with proper authentication
   */
  private generateCertificateNumber(registrationNo: string): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    // Format: HODO-YYYY-MM-REGNUM
    const cleanRegNo = registrationNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `HODO-${year}-${month}-${cleanRegNo}`;
  }

  /**
   * Add security watermark for document authenticity
   * Requirements: 3.3 - Official document appearance with security elements
   */
  private addSecurityWatermark(): void {
    // Save current graphics state
    const currentFontSize = this.doc.getFontSize();
    const currentTextColor = this.doc.getTextColor();

    // Set watermark properties
    this.doc.setFontSize(60);
    this.doc.setTextColor(240, 240, 240); // Very light gray
    this.doc.setFont('helvetica', 'bold');

    // Add diagonal watermark text
    this.doc.text('HODO HOSPITAL', 105, 150, {
      align: 'center',
      angle: 45
    });

    // Add smaller watermark elements
    this.doc.setFontSize(20);
    this.doc.setTextColor(250, 250, 250); // Even lighter gray
    this.doc.text('OFFICIAL DOCUMENT', 105, 180, {
      align: 'center',
      angle: 45
    });

    // Restore graphics state
    this.doc.setFontSize(currentFontSize);
    this.doc.setTextColor(currentTextColor);
  }

  /**
   * Save the document with proper filename and error handling
   * Requirements: 3.5 - Filename format that includes baby's name
   */
  private saveDocumentSafely(babyName: string): void {
    try {
      this.saveDocument(babyName);
    } catch (error) {
      console.error('Error saving document:', error);
      // Fallback: Try with a simpler filename
      try {
        const fallbackName = `Birth_Certificate_${Date.now()}`;
        this.doc.save(`${fallbackName}.pdf`);
        console.log('Document saved with fallback filename');
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError);
        throw new Error('Unable to save the certificate. Please try again or contact support.');
      }
    }
  }

  /**
   * Save the document with proper filename
   * Requirements: 3.5 - Filename format that includes baby's name
   */
  private saveDocument(babyName: string): void {
    const sanitizedName = babyName.replace(/[^a-zA-Z0-9]/g, '_') || 'Birth_Certificate';
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    this.doc.save(`${sanitizedName}_Birth_Certificate_${timestamp}.pdf`);
  }

  /**
   * Get default place of birth
   * Requirement 2.4: Show "HODO HOSPITAL, KAZHAKOOTTAM" as place of birth
   */
  private getDefaultPlaceOfBirth(): string {
    return "HODO HOSPITAL, KAZHAKOOTTAM";
  }

  /**
   * Get default nationality
   * Requirement 2.9: Display "Indian" as default nationality
   */
  private getDefaultNationality(): string {
    return "Indian";
  }

  /**
   * Get current system date in proper format for official documents
   * Requirements: 3.1 - Include current system date as issue date
   */
  private getCurrentDate(): string {
    try {
      const now = new Date();
      return now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting current date:', error);
      // Fallback to basic date formatting
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  /**
   * Get current date and time for detailed timestamp
   * Requirements: 3.1 - Current system date as authentication element
   */
  private getCurrentDateTime(): string {
    const now = new Date();
    return now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  /**
   * Initialize basic document without advanced features (fallback)
   * Requirements: 3.3 - Graceful handling of PDF generation failures
   */
  private initializeBasicDocument(): void {
    try {
      // Set basic document metadata
      this.doc.setProperties({
        title: 'Birth Certificate - HODO Hospital',
        subject: 'Official Birth Certificate',
        author: 'HODO Hospital, Kazhakoottam'
      });

      // Add basic border
      this.doc.setDrawColor(0, 0, 0);
      this.doc.setLineWidth(1);
      this.doc.rect(20, 20, 170, 257, 'S');

    } catch (error) {
      console.warn('Even basic document initialization failed:', error);
      // Continue without borders if even basic initialization fails
    }
  }

  /**
   * Enhanced data transformation with better error handling and fallback options
   * Requirements: 3.4 - Provide fallback options for missing optional data
   */

  /**
   * Transform baby name with enhanced error handling
   * Requirement 2.1: Populate baby name from birth record data
   */
  private transformBabyName(birthRecord: BirthRecordData): string {
    try {
      // Try different possible field combinations for baby name
      const firstName = birthRecord.firstName?.trim() || '';
      const lastName = birthRecord.lastName?.trim() || '';

      // Handle various name formats
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }

      // Fallback for missing name data
      return 'Baby (Name Not Provided)';
    } catch (error) {
      console.warn('Error transforming baby name:', error);
      return 'Baby (Name Processing Error)';
    }
  }

  /**
   * Transform gender with enhanced validation and error handling
   * Requirement 2.2: Convert gender from birth record (1/2 to Male/Female)
   */
  private transformGender(gender?: string | number): string {
    try {
      // Handle null/undefined
      if (gender === null || gender === undefined) {
        return 'Not Specified';
      }

      // Handle numeric gender codes (1 = Male, 2 = Female)
      if (gender === 1 || gender === '1' ||
        (typeof gender === 'string' && gender.toLowerCase() === 'male')) {
        return 'Male';
      }

      if (gender === 2 || gender === '2' ||
        (typeof gender === 'string' && gender.toLowerCase() === 'female')) {
        return 'Female';
      }

      // Handle other string formats
      if (typeof gender === 'string') {
        const normalizedGender = gender.trim().toLowerCase();
        if (normalizedGender === 'm' || normalizedGender.startsWith('mal')) {
          return 'Male';
        }
        if (normalizedGender === 'f' || normalizedGender.startsWith('fem')) {
          return 'Female';
        }
      }

      // Fallback for unrecognized gender data
      return 'Not Specified';
    } catch (error) {
      console.warn('Error transforming gender:', error);
      return 'Not Specified';
    }
  }

  /**
   * Transform birth date with enhanced validation and error handling
   * Requirement 2.3: Format date of birth from birth record
   */
  private transformBirthDate(dateOfBirth?: string): string {
    try {
      if (!dateOfBirth?.trim()) {
        return 'Date Not Provided';
      }

      const date = new Date(dateOfBirth);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try alternative date parsing
        const alternativeDate = this.parseAlternativeDateFormats(dateOfBirth);
        if (alternativeDate) {
          return alternativeDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        return `${dateOfBirth} (Invalid Format)`;
      }

      // Format as DD/MM/YYYY for official documents
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting birth date:', error);
      return dateOfBirth || 'Date Processing Error';
    }
  }

  /**
   * Parse alternative date formats as fallback
   * Requirements: 3.4 - Provide fallback options for missing optional data
   */
  private parseAlternativeDateFormats(dateString: string): Date | null {
    try {
      // Common date formats to try
      const formats = [
        // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // DD-MM-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        // YYYY-MM-DD
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
        // MM/DD/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          // Try different interpretations based on format
          const [, part1, part2, part3] = match;

          // Try YYYY-MM-DD format first
          if (part1.length === 4) {
            const date = new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
            if (!isNaN(date.getTime())) return date;
          }

          // Try DD/MM/YYYY format
          const date = new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
          if (!isNaN(date.getTime())) return date;
        }
      }

      return null;
    } catch (error) {
      console.warn('Error parsing alternative date formats:', error);
      return null;
    }
  }

  /**
   * Transform registration number with enhanced error handling
   * Requirement 2.5: Use Visit ID from birth record as registration number
   */
  private transformRegistrationNumber(birthRecord: BirthRecordData): string {
    try {
      // Priority order: birthId, visitId, then fallback
      if (birthRecord.birthId?.trim()) {
        return birthRecord.birthId.trim();
      }

      if (birthRecord.visitId?.trim()) {
        return birthRecord.visitId.trim();
      }

      // Generate a more meaningful temporary registration number
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      return `HODO-TEMP-${timestamp}-${randomSuffix}`;
    } catch (error) {
      console.warn('Error transforming registration number:', error);
      return `HODO-ERROR-${Date.now().toString().slice(-6)}`;
    }
  }

  /**
   * Transform registration date with enhanced error handling
   * Requirement 2.6: Use admitted date from birth record as registration date
   */
  private transformRegistrationDate(admittedDate?: string): string {
    try {
      if (!admittedDate?.trim()) {
        // Use current date as fallback for registration date
        return this.getCurrentDate();
      }

      const date = new Date(admittedDate);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Try alternative parsing
        const alternativeDate = this.parseAlternativeDateFormats(admittedDate);
        if (alternativeDate) {
          return alternativeDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        return this.getCurrentDate(); // Use current date if invalid
      }

      // Format as DD/MM/YYYY for official documents
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting registration date:', error);
      return this.getCurrentDate();
    }
  }

  /**
   * Transform parent name with enhanced error handling
   * Requirement 2.7: Display mother's name from parent data
   */
  private transformParentName(parentData: ParentData): string {
    try {
      if (!parentData) {
        return 'Parent Name Not Provided';
      }

      const firstName = parentData.firstName?.trim() || '';
      const lastName = parentData.lastName?.trim() || '';

      // Handle various name combinations
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }

      // Fallback for missing parent name
      return 'Parent Name Not Provided';
    } catch (error) {
      console.warn('Error transforming parent name:', error);
      return 'Parent Name Processing Error';
    }
  }

  /**
   * Transform address with enhanced error handling
   * Requirement 2.8: Use address information from parent data
   */
  private transformAddress(parentData: ParentData): string {
    try {
      if (!parentData) {
        return 'Address Not Provided';
      }

      // Priority: address field, then nationality as fallback, then default
      if (parentData.address?.trim()) {
        return parentData.address.trim();
      }

      if (parentData.nationality?.trim()) {
        return parentData.nationality.trim();
      }

      // Fallback address
      return 'Address Not Provided';
    } catch (error) {
      console.warn('Error transforming address:', error);
      return 'Address Processing Error';
    }
  }

}

/**
 * Utility function to format validation errors for user display
 * Requirements: 3.4 - User-friendly error messages for missing critical data
 */
export function formatValidationErrors(result: CertificateGenerationResult): string {
  if (result.success) {
    return result.message;
  }

  let message = result.message + '\n\n';

  if (result.errors.length > 0) {
    message += 'Critical Issues:\n';
    result.errors.forEach((error, index) => {
      message += `${index + 1}. ${error.message}\n`;
    });
  }

  if (result.warnings.length > 0) {
    message += '\nWarnings:\n';
    result.warnings.forEach((warning, index) => {
      message += `${index + 1}. ${warning.message}\n`;
    });
  }

  return message.trim();
}

/**
 * Utility function to check if certificate generation is possible
 * Requirements: 3.3 - Data validation before certificate generation
 */
export function canGenerateCertificate(birthRecord: BirthRecordData, parentData: ParentData): boolean {
  // Quick validation without full error details
  if (!birthRecord) return false;
  if (!birthRecord.firstName?.trim() && !birthRecord.lastName?.trim()) return false;
  if (!birthRecord.dateOfBirth?.trim()) return false;

  // Check if date is valid
  const birthDate = new Date(birthRecord.dateOfBirth);
  if (isNaN(birthDate.getTime())) return false;

  // Check if birth date is not in the future
  const today = new Date();
  if (birthDate > today) return false;

  return true;
}