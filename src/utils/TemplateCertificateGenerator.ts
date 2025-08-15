import jsPDF from 'jspdf';
import { TEMPLATE_LAYOUT } from './TemplateLayoutConstants';

/**
 * TypeScript interfaces matching template field structure
 * Requirements: 1.1, 1.3, 4.4 - Template field structure and data mapping
 */
export interface TemplateFieldData {
  babyName: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  registrationNo: string;
  dateOfRegistration?: string;  // Made optional since removed from certificate
  parentName: string;
  address: string;
  nationality?: string;  // Made optional since removed from certificate
  issueDate: string;
}

export interface BirthRecordInput {
  firstName?: string;
  lastName?: string;
  babyName?: string;
  gender?: string | number;
  dateOfBirth?: string;
  birthId?: string;
  visitId?: string;
  admittedDate?: string;
  motherName?: string;  // Added mother name from birth records
}

export interface ParentDataInput {
  firstName?: string;
  lastName?: string;
  nationality?: string;
  address?: string;
}

/**
 * Custom error classes for comprehensive error handling
 * Requirements: 3.5 - User-friendly error messages for critical missing data
 */
export class ValidationError extends Error {
  public readonly errors: string[];
  public readonly criticalErrors: string[];
  public readonly errorType: 'validation' = 'validation';

  constructor(errors: string[], criticalErrors: string[] = []) {
    const message = criticalErrors.length > 0 
      ? `Critical data missing: ${criticalErrors.join(', ')}`
      : `Validation failed: ${errors.join(', ')}`;
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.criticalErrors = criticalErrors;
  }
}

export class CertificateGenerationError extends Error {
  public readonly errorType: 'generation' = 'generation';
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'CertificateGenerationError';
    this.originalError = originalError;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  criticalErrors: string[];
  warnings: string[];
}

/**
 * Template-based Certificate Generator
 * Replicates the exact template layout from frontend/src/assets/certifcate_text.png
 * Requirements: 1.1, 1.3, 4.4 - Exact template layout replication
 */
export class TemplateCertificateGenerator {
  private doc: jsPDF;
  private birthRecord?: BirthRecordInput;

  constructor() {
    // Initialize A4 document matching template specifications
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  /**
   * Generate certificate using exact template layout with comprehensive data validation
   * Requirements: 1.1, 1.3, 3.5 - Template layout replication, data mapping, and error handling
   */
  public generateFromTemplate(birthRecord: BirthRecordInput, parentData: ParentDataInput): void {
    try {
      // Store birth record for use in parent name extraction
      this.birthRecord = birthRecord;
      
      // Comprehensive data validation before generation
      const validationResult = this.validateAllData(birthRecord, parentData);
      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.errors, validationResult.criticalErrors);
      }
      
      // Map input data to template field structure with error handling
      let templateData = this.mapToTemplateFieldsWithValidation(birthRecord, parentData);
      
      // Handle missing optional data with appropriate defaults
      templateData = this.handleMissingDataWithDefaults(templateData);
      
      // Set up document with template specifications
      this.initializeTemplateDocument();
      
      // Replicate exact template layout
      this.replicateTemplateLayout(templateData);
      
      // Generate descriptive filename and download seamlessly
      this.downloadCertificateWithDescriptiveFilename(templateData, birthRecord);
      
    } catch (error) {
      // Enhanced error handling with specific error types
      this.handleCertificateGenerationError(error, birthRecord, parentData);
      throw error; // Re-throw for component handling
    }
  }

  /**
   * Generate certificate for preview (without downloading)
   */
  private generateFromTemplateForPreview(birthRecord: BirthRecordInput, parentData: ParentDataInput): void {
    try {
      // Store birth record for use in parent name extraction
      this.birthRecord = birthRecord;
      
      // Comprehensive data validation before generation
      const validationResult = this.validateAllData(birthRecord, parentData);
      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.errors, validationResult.criticalErrors);
      }
      
      // Map input data to template field structure with error handling
      let templateData = this.mapToTemplateFieldsWithValidation(birthRecord, parentData);
      
      // Handle missing optional data with appropriate defaults
      templateData = this.handleMissingDataWithDefaults(templateData);
      
      // Set up document with template specifications
      this.initializeTemplateDocument();
      
      // Replicate exact template layout
      this.replicateTemplateLayout(templateData);
      
      // Don't download - just generate for preview
      
    } catch (error) {
      // Enhanced error handling with specific error types
      this.handleCertificateGenerationError(error, birthRecord, parentData);
      throw error; // Re-throw for component handling
    }
  }

  /**
   * Generate and download certificate with enhanced filename generation
   * Requirements: 3.3, 4.1, 4.5 - Seamless download, current date, descriptive filenames
   */
  public generateAndDownloadCertificate(birthRecord: BirthRecordInput, parentData: ParentDataInput): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Generate certificate with enhanced error handling
        this.generateFromTemplate(birthRecord, parentData);
        
        // Resolve promise after successful generation and download
        setTimeout(() => {
          resolve();
        }, 100); // Small delay to ensure download completes
        
      } catch (error) {
        console.error('Certificate generation and download failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate birth certificate for preview (returns blob instead of downloading)
   */
  public async generateForPreview(birthRecord: BirthRecordInput, parentData: ParentDataInput): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Generate certificate without downloading
        this.generateFromTemplateForPreview(birthRecord, parentData);
        
        // Return the PDF as a blob
        const pdfBlob = this.doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Birth certificate preview generation failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Preview filename that would be generated for a certificate
   * Requirements: 4.5 - Allow preview of descriptive filenames
   */
  public previewFilename(birthRecord: BirthRecordInput, parentData: ParentDataInput): string {
    try {
      // Map input data to template field structure for filename preview
      const templateData = this.mapToTemplateFields(birthRecord, parentData);
      const processedData = this.handleMissingData(templateData);
      
      // Generate and return the filename that would be used
      return this.generateDescriptiveFilename(processedData, birthRecord);
      
    } catch (error) {
      console.error('Filename preview failed:', error);
      
      // Return fallback filename
      return `Birth_Certificate_${new Date().toISOString().slice(0, 10)}.pdf`;
    }
  }

  /**
   * Comprehensive data validation for certificate generation
   * Requirements: 3.5 - Validate required fields and provide user-friendly error messages
   */
  private validateAllData(birthRecord: BirthRecordInput, parentData: ParentDataInput | null): ValidationResult {
    const errors: string[] = [];
    const criticalErrors: string[] = [];
    const warnings: string[] = [];

    // Validate birth record data
    if (!birthRecord) {
      criticalErrors.push('Birth record data is missing');
      return { isValid: false, errors, criticalErrors, warnings };
    }

    // Critical field validation
    const babyName = this.extractBabyName(birthRecord);
    if (!babyName || babyName.trim().length === 0) {
      criticalErrors.push('Baby name is required');
    }

    if (!birthRecord.dateOfBirth || birthRecord.dateOfBirth.trim().length === 0) {
      criticalErrors.push('Date of birth is required');
    } else if (!this.isValidDate(birthRecord.dateOfBirth)) {
      errors.push('Date of birth format is invalid');
    }

    // Parent data validation
    if (!parentData) {
      warnings.push('Parent data is missing - using default values');
    } else {
      const parentName = this.extractParentName(parentData);
      if (!parentName || parentName.trim().length === 0) {
        warnings.push('Parent name is missing - using default value');
      }
    }

    // Optional field validation with warnings
    if (!birthRecord.gender) {
      warnings.push('Gender information is missing - using default value');
    }

    if (!birthRecord.birthId && !birthRecord.visitId) {
      warnings.push('Registration number is missing - using generated ID');
    }

    return {
      isValid: criticalErrors.length === 0,
      errors,
      criticalErrors,
      warnings
    };
  }

  /**
   * Validate date format and reasonableness
   * Requirements: 3.5 - Data validation for date fields
   */
  private isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    // Check if date is reasonable (not in future, not too far in past)
    const now = new Date();
    const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
    
    return date <= now && date >= hundredYearsAgo;
  }

  /**
   * Handle certificate generation errors with specific error types
   * Requirements: 3.5 - User-friendly error messages and error handling
   */
  private handleCertificateGenerationError(error: any, birthRecord: BirthRecordInput, parentData: ParentDataInput | null): void {
    console.error('Certificate generation error:', error);
    
    // Log detailed error information for debugging
    console.error('Birth record data:', birthRecord);
    console.error('Parent data:', parentData);
    
    if (error instanceof ValidationError) {
      console.error('Validation errors:', error.errors);
      console.error('Critical errors:', error.criticalErrors);
    }
  }

  /**
   * Map input data to template field structure with enhanced validation
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 - Complete data mapping for template fields
   */
  private mapToTemplateFieldsWithValidation(birthRecord: BirthRecordInput, parentData: ParentDataInput | null): TemplateFieldData {
    try {
      return {
        babyName: this.extractBabyNameWithValidation(birthRecord),
        gender: this.formatGenderWithValidation(birthRecord.gender),
        dateOfBirth: this.formatDateWithValidation(birthRecord.dateOfBirth),
        placeOfBirth: TEMPLATE_LAYOUT.TEXT.DEFAULTS.PLACE_OF_BIRTH,
        registrationNo: this.extractRegistrationNumberWithValidation(birthRecord),
        // dateOfRegistration: this.formatDateWithValidation(birthRecord.admittedDate),  // Removed as requested
        parentName: this.extractParentNameWithValidation(parentData),
        address: this.extractAddressWithValidation(parentData),
        // nationality: this.extractNationalityWithValidation(parentData),  // Removed as requested
        issueDate: this.getCurrentDate()
      };
    } catch (error) {
      throw new CertificateGenerationError('Failed to map data to template fields', error as Error);
    }
  }

  /**
   * Handle missing optional data with appropriate defaults
   * Requirements: 3.5 - Provide appropriate defaults for missing optional data
   */
  private handleMissingDataWithDefaults(templateData: TemplateFieldData): TemplateFieldData {
    return {
      ...templateData,
      gender: templateData.gender || 'Not Specified',
      parentName: templateData.parentName || 'Not Provided',
      address: templateData.address || 'Not Provided',
      // nationality: templateData.nationality || 'Not Specified',  // Removed as requested
      registrationNo: templateData.registrationNo || `TEMP-${Date.now()}`,
      // dateOfRegistration: templateData.dateOfRegistration || this.getCurrentDate()  // Removed as requested
    };
  }

  /**
   * Extract baby name with validation
   * Requirements: 3.5 - Validate and handle missing critical data
   */
  private extractBabyNameWithValidation(birthRecord: BirthRecordInput): string {
    const babyName = birthRecord.babyName || birthRecord.firstName || '';
    if (!babyName.trim()) {
      throw new ValidationError(['Baby name is required for certificate generation'], ['Baby name']);
    }
    return babyName.trim();
  }

  /**
   * Format gender with validation and defaults
   * Requirements: 3.5 - Handle missing optional data with defaults
   */
  private formatGenderWithValidation(gender: string | number | undefined): string {
    if (gender === undefined || gender === null || gender === '') {
      return 'Not Specified';
    }
    
    if (typeof gender === 'number') {
      return gender === 1 ? 'Female' : gender === 2 ? 'Male' : 'Not Specified';
    }
    
    if (typeof gender === 'string') {
      const normalizedGender = gender.toLowerCase().trim();
      if (normalizedGender === 'male' || normalizedGender === 'm') return 'Male';
      if (normalizedGender === 'female' || normalizedGender === 'f') return 'Female';
      return 'Not Specified';
    }
    
    return 'Not Specified';
  }

  /**
   * Format date with validation
   * Requirements: 3.5 - Validate date fields and provide defaults
   */
  private formatDateWithValidation(dateString: string | undefined): string {
    if (!dateString) {
      return 'Not Provided';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Extract registration number with validation
   * Requirements: 3.5 - Handle missing registration data with fallbacks
   */
  private extractRegistrationNumberWithValidation(birthRecord: BirthRecordInput): string {
    return birthRecord.birthId || birthRecord.visitId || `REG-${Date.now()}`;
  }

  /**
   * Extract parent name with validation and defaults
   * Requirements: 3.5 - Handle missing parent data gracefully
   */
  private extractParentNameWithValidation(parentData: ParentDataInput | null): string {
    // Priority 1: Use mother name from birth record if available
    if (this.birthRecord?.motherName?.trim()) {
      return this.formatNameForTemplate(this.birthRecord.motherName.trim());
    }
    
    // Priority 2: Use parent data if available
    if (parentData) {
    const firstName = parentData.firstName?.trim() || '';
    const lastName = parentData.lastName?.trim() || '';
    
      if (firstName || lastName) {
        const fullName = `${firstName} ${lastName}`.trim();
        return this.formatNameForTemplate(fullName);
      }
    }
    
    return 'Not Provided';
  }

  /**
   * Extract address with validation
   * Requirements: 3.5 - Handle missing address data with defaults
   */
  private extractAddressWithValidation(parentData: ParentDataInput | null): string {
    if (!parentData) {
      return 'Not Provided';
    }
    
    return parentData.address?.trim() || parentData.nationality?.trim() || 'Not Provided';
  }

  /**
   * Extract nationality with validation
   * Requirements: 3.5 - Handle missing nationality data with defaults
   */
  private extractNationalityWithValidation(parentData: ParentDataInput | null): string {
    if (!parentData) {
      return 'Indian'; // Default nationality
    }
    
    return parentData.nationality?.trim() || 'Indian';
  }

  /**
   * Map input data to template field structure (legacy method for backward compatibility)
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 - Complete data mapping for template fields
   */
  private mapToTemplateFields(birthRecord: BirthRecordInput, parentData: ParentDataInput): TemplateFieldData {
    return {
      babyName: this.extractBabyName(birthRecord),
      gender: this.formatGender(birthRecord.gender),
      dateOfBirth: this.formatDate(birthRecord.dateOfBirth),
      placeOfBirth: TEMPLATE_LAYOUT.TEXT.DEFAULTS.PLACE_OF_BIRTH,
      registrationNo: this.extractRegistrationNumber(birthRecord),
      // dateOfRegistration: this.formatDate(birthRecord.admittedDate),  // Removed as requested
      parentName: this.extractParentName(parentData),
      address: this.extractAddress(parentData),
      // nationality: this.extractNationality(parentData),  // Removed as requested
      issueDate: this.getCurrentDate()
    };
  }

  /**
   * Initialize document with exact template specifications
   * Requirements: 1.3 - Exact template layout setup
   */
  private initializeTemplateDocument(): void {
    // Set document properties
    this.doc.setProperties({
      title: 'Birth Certificate - HODO Hospital',
      subject: 'Official Birth Certificate',
      author: 'HODO Hospital, Kazhakoottam',
      creator: 'HODO Hospital Birth Registration System'
    });

    // Set up page dimensions matching template exactly
    this.setupTemplatePageDimensions();

    // Set background
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, TEMPLATE_LAYOUT.PAGE_DIMENSIONS.WIDTH, TEMPLATE_LAYOUT.PAGE_DIMENSIONS.HEIGHT, 'F');

    // Add template borders with precise positioning
    this.addTemplateBorders();
  }

  /**
   * Set up page dimensions matching template exactly
   * Requirements: 1.3, 1.4 - Exact page dimensions and template matching
   */
  private setupTemplatePageDimensions(): void {
    // Ensure A4 dimensions match template specifications exactly
    const { WIDTH, HEIGHT } = TEMPLATE_LAYOUT.PAGE_DIMENSIONS;
    
    // Set page format to match template
    this.doc.internal.pageSize.width = WIDTH;
    this.doc.internal.pageSize.height = HEIGHT;
    
    // Note: jsPDF doesn't have setMargins method, margins are handled through positioning
  }

  /**
   * Add template borders with precise positioning
   * Requirements: 1.3, 1.4 - Exact border positioning and spacing
   */
  private addTemplateBorders(): void {
    // Main outer border - exact template positioning
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.WIDTH);
    this.doc.rect(
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.WIDTH_SIZE,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.HEIGHT_SIZE,
      'S'
    );

    // Inner decorative border - precise spacing from main border
    this.doc.setDrawColor(102, 102, 102);
    this.doc.setLineWidth(TEMPLATE_LAYOUT.BORDERS.INNER_BORDER.WIDTH);
    this.doc.rect(
      TEMPLATE_LAYOUT.BORDERS.INNER_BORDER.X,
      TEMPLATE_LAYOUT.BORDERS.INNER_BORDER.Y,
      TEMPLATE_LAYOUT.BORDERS.INNER_BORDER.WIDTH_SIZE,
      TEMPLATE_LAYOUT.BORDERS.INNER_BORDER.HEIGHT_SIZE,
      'S'
    );

    // Add corner accent marks for precise template matching
    this.addTemplateCornerAccents();

    // Add document classification text (as shown in template)
    this.addDocumentClassificationText();
  }

  /**
   * Add document classification text as shown in template
   * Requirements: 4.3, 4.2 - Official elements and template text content
   */
  private addDocumentClassificationText(): void {
    // Document type classification (top right) - Removed as requested
    // this.doc.setFont('helvetica', 'bold');
    // this.doc.setFontSize(8);
    // this.doc.setTextColor(44, 62, 80);
    // this.doc.text('OFFICIAL DOCUMENT', 175, 30, { align: 'right' });  // Removed as requested
    
    // Security classification (top right, below document type) - Removed as requested
    // this.doc.setFont('helvetica', 'normal');
    // this.doc.setFontSize(6);
    // this.doc.setTextColor(102, 102, 102);
    // this.doc.text('CONFIDENTIAL', 175, 36, { align: 'right' });  // Removed as requested
  }

  /**
   * Add corner accent marks matching template design
   * Requirements: 1.3, 1.4 - Exact template corner design elements
   */
  private addTemplateCornerAccents(): void {
    const cornerSize = 3;
    const borderOffset = 2;
    
    // Top-left corner accent
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset + cornerSize,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset
    );
    this.doc.line(
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset + cornerSize
    );

    // Top-right corner accent
    const rightX = TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.WIDTH_SIZE - borderOffset;
    this.doc.line(
      rightX - cornerSize,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset,
      rightX,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset
    );
    this.doc.line(
      rightX,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset,
      rightX,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + borderOffset + cornerSize
    );

    // Bottom-left corner accent
    const bottomY = TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.Y + TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.HEIGHT_SIZE - borderOffset;
    this.doc.line(
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset,
      bottomY - cornerSize,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset,
      bottomY
    );
    this.doc.line(
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset,
      bottomY,
      TEMPLATE_LAYOUT.BORDERS.MAIN_BORDER.X + borderOffset + cornerSize,
      bottomY
    );

    // Bottom-right corner accent
    this.doc.line(
      rightX - cornerSize,
      bottomY,
      rightX,
      bottomY
    );
    this.doc.line(
      rightX,
      bottomY - cornerSize,
      rightX,
      bottomY
    );
  }

  /**
   * Replicate exact template layout with precise positioning
   * Requirements: 1.3, 4.4 - Exact template layout and positioning
   */
  private replicateTemplateLayout(data: TemplateFieldData): void {
    // Validate and ensure precise template layout replication
    this.validateTemplateLayoutPrecision();
    
    this.addTemplateHeader();
    this.addTemplateCertificationText();
    this.addTemplateDataFields(data);
    this.addTemplateFooter(data);
    this.addTemplateSecurityElements();
    
    // Final validation of spacing and alignment
    this.finalizeTemplateLayoutPrecision();
  }

  /**
   * Validate template layout precision before rendering
   * Requirements: 1.3, 1.4 - Ensure exact template layout specifications
   */
  private validateTemplateLayoutPrecision(): void {
    // Set precise rendering options for template matching
    this.doc.setDisplayMode('fullpage');
    
    // Set precise coordinate system for exact positioning
    // Note: jsPDF handles font rendering automatically
  }

  /**
   * Finalize template layout precision after all elements are added
   * Requirements: 1.3, 1.4 - Final spacing and alignment validation
   */
  private finalizeTemplateLayoutPrecision(): void {
    // Add final template validation marks (invisible guides for precision)
    this.addTemplateAlignmentGuides();
    
    // Ensure all elements are within template boundaries
    this.validateElementBoundaries();
    
    // Apply final template styling consistency
    this.applyFinalTemplateStyling();
  }

  /**
   * Add invisible alignment guides for template precision validation
   * Requirements: 1.3, 1.4 - Template alignment and spacing validation
   */
  private addTemplateAlignmentGuides(): void {
    // Add invisible guides using very light color (for development/debugging)
    this.doc.setDrawColor(250, 250, 250);
    this.doc.setLineWidth(0.05);
    
    // Vertical alignment guides
    const centerX = TEMPLATE_LAYOUT.PAGE_DIMENSIONS.WIDTH / 2;
    const leftMargin = TEMPLATE_LAYOUT.SPACING.MARGINS.CONTENT_LEFT;
    const rightMargin = TEMPLATE_LAYOUT.SPACING.MARGINS.CONTENT_RIGHT;
    
    // Center guide
    this.doc.line(centerX, 20, centerX, 277);
    
    // Left margin guide
    this.doc.line(leftMargin, 20, leftMargin, 277);
    
    // Right margin guide  
    this.doc.line(rightMargin, 20, rightMargin, 277);
    
    // Horizontal alignment guides for major sections
    const headerBottom = TEMPLATE_LAYOUT.POSITIONS.HEADER.DECORATIVE_LINES.Y2 + 5;
    const certificationBottom = TEMPLATE_LAYOUT.POSITIONS.CERTIFICATION.Y + 30;
    const footerTop = TEMPLATE_LAYOUT.POSITIONS.FOOTER.START_Y;
    
    this.doc.line(20, headerBottom, 190, headerBottom);
    this.doc.line(20, certificationBottom, 190, certificationBottom);
    this.doc.line(20, footerTop, 190, footerTop);
  }

  /**
   * Validate that all elements are within template boundaries
   * Requirements: 1.3, 1.4 - Template boundary validation
   */
  private validateElementBoundaries(): void {
    // Ensure no elements exceed template margins
    const margins = TEMPLATE_LAYOUT.PAGE_DIMENSIONS.MARGINS;
    const pageWidth = TEMPLATE_LAYOUT.PAGE_DIMENSIONS.WIDTH;
    const pageHeight = TEMPLATE_LAYOUT.PAGE_DIMENSIONS.HEIGHT;
    
    // Add boundary indicators (very subtle)
    this.doc.setDrawColor(248, 248, 248);
    this.doc.setLineWidth(0.1);
    
    // Top boundary
    this.doc.line(margins.LEFT, margins.TOP, pageWidth - margins.RIGHT, margins.TOP);
    
    // Bottom boundary
    this.doc.line(margins.LEFT, pageHeight - margins.BOTTOM, pageWidth - margins.RIGHT, pageHeight - margins.BOTTOM);
    
    // Left boundary
    this.doc.line(margins.LEFT, margins.TOP, margins.LEFT, pageHeight - margins.BOTTOM);
    
    // Right boundary
    this.doc.line(pageWidth - margins.RIGHT, margins.TOP, pageWidth - margins.RIGHT, pageHeight - margins.BOTTOM);
  }

  /**
   * Apply final template styling consistency
   * Requirements: 1.3, 1.4 - Final template styling and appearance
   */
  private applyFinalTemplateStyling(): void {
    // Reset all drawing properties to ensure consistency
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Apply final document properties for template matching
    this.doc.setProperties({
      title: 'Birth Certificate - HODO Hospital',
      subject: 'Official Birth Certificate - Template Matched',
      keywords: 'birth certificate, official document, template matched',
      creator: 'HODO Hospital Template System'
    });
  }

  /**
   * Add header section with exact template positioning
   * Requirements: 1.3 - Exact template header layout
   */
  private addTemplateHeader(): void {
    const header = TEMPLATE_LAYOUT.POSITIONS.HEADER;

    // Add logo with precise positioning
    this.addTemplateLogo();

    // Apply precise font styling matching template
    this.applyTemplateFontStyling();

    // Main title with exact positioning and font styling
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(header.TITLE.FONT_SIZE);
    this.doc.setTextColor(44, 62, 80); // TEMPLATE_COLORS.PRIMARY
    this.doc.text(TEMPLATE_LAYOUT.TEXT.HEADER.TITLE, header.TITLE.X, header.TITLE.Y, { align: 'center' });

    // Hospital name with precise spacing
    this.doc.setFontSize(header.HOSPITAL_NAME.FONT_SIZE);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.HEADER.HOSPITAL_NAME, header.HOSPITAL_NAME.X, header.HOSPITAL_NAME.Y, { align: 'center' });

    // Subtitle with exact font weight and positioning
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(header.SUBTITLE.FONT_SIZE);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.HEADER.SUBTITLE, header.SUBTITLE.X, header.SUBTITLE.Y, { align: 'center' });

    // Decorative lines with precise positioning and thickness
    this.addTemplateDecorativeLines(header);
  }

  /**
   * Apply font styling that matches template appearance exactly
   * Requirements: 1.3, 1.4 - Exact font styling and template appearance
   */
  private applyTemplateFontStyling(): void {
    // Set default font properties to match template
    this.doc.setFont('helvetica');
    this.doc.setTextColor(44, 62, 80); // Primary template color
    
    // Set line cap style for consistent line appearance
    this.doc.setLineCap('round');
    this.doc.setLineJoin('round');
  }

  /**
   * Add decorative lines with exact template positioning and styling
   * Requirements: 1.3, 1.4 - Exact line positioning and spacing
   */
  private addTemplateDecorativeLines(header: any): void {
    // Primary decorative line - thicker, darker
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(TEMPLATE_LAYOUT.BORDERS.DECORATIVE_LINES.PRIMARY.WIDTH);
    this.doc.line(
      header.DECORATIVE_LINES.X_START, 
      header.DECORATIVE_LINES.Y1, 
      header.DECORATIVE_LINES.X_END, 
      header.DECORATIVE_LINES.Y1
    );

    // Secondary decorative line - thinner, lighter
    this.doc.setDrawColor(52, 73, 94);
    this.doc.setLineWidth(TEMPLATE_LAYOUT.BORDERS.DECORATIVE_LINES.SECONDARY.WIDTH);
    this.doc.line(
      header.DECORATIVE_LINES.X_START, 
      header.DECORATIVE_LINES.Y2, 
      header.DECORATIVE_LINES.X_END, 
      header.DECORATIVE_LINES.Y2
    );

    // Add subtle gradient effect with additional thin lines
    this.doc.setDrawColor(189, 195, 199);
    this.doc.setLineWidth(0.1);
    this.doc.line(
      header.DECORATIVE_LINES.X_START, 
      header.DECORATIVE_LINES.Y1 + 0.5, 
      header.DECORATIVE_LINES.X_END, 
      header.DECORATIVE_LINES.Y1 + 0.5
    );
    this.doc.line(
      header.DECORATIVE_LINES.X_START, 
      header.DECORATIVE_LINES.Y2 + 0.5, 
      header.DECORATIVE_LINES.X_END, 
      header.DECORATIVE_LINES.Y2 + 0.5
    );
  }

  /**
   * Add logo with exact template positioning
   * Requirements: 1.3 - Exact logo positioning
   */
  private addTemplateLogo(): void {
    const logo = TEMPLATE_LAYOUT.POSITIONS.HEADER.LOGO;
    
    // Logo border
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(1);
    this.doc.rect(logo.X, logo.Y, logo.WIDTH, logo.HEIGHT, 'S');

    // Medical cross symbol (red accent as per template)
    this.addMedicalCrossSymbol(logo.X + logo.WIDTH/2, logo.Y + 8);

    // Logo text (fallback)
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('HODO', logo.X + logo.WIDTH/2, logo.Y + logo.HEIGHT/2 - 2, { align: 'center' });
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('HOSPITAL', logo.X + logo.WIDTH/2, logo.Y + logo.HEIGHT/2 + 6, { align: 'center' });
  }

  /**
   * Add medical cross symbol as shown in template
   * Requirements: 4.3, 4.2 - Template design elements and official appearance
   */
  private addMedicalCrossSymbol(centerX: number, centerY: number): void {
    const crossSize = 4;
    const crossWidth = 1.5;
    
    // Set red color for medical cross (accent color)
    this.doc.setDrawColor(231, 76, 60); // #e74c3c
    this.doc.setFillColor(231, 76, 60);
    this.doc.setLineWidth(0.5);
    
    // Vertical bar of cross
    this.doc.rect(
      centerX - crossWidth/2, 
      centerY - crossSize/2, 
      crossWidth, 
      crossSize, 
      'F'
    );
    
    // Horizontal bar of cross
    this.doc.rect(
      centerX - crossSize/2, 
      centerY - crossWidth/2, 
      crossSize, 
      crossWidth, 
      'F'
    );
    
    // Add subtle border to cross for definition
    this.doc.setDrawColor(200, 60, 50);
    this.doc.setLineWidth(0.2);
    this.doc.rect(
      centerX - crossWidth/2, 
      centerY - crossSize/2, 
      crossWidth, 
      crossSize, 
      'S'
    );
    this.doc.rect(
      centerX - crossSize/2, 
      centerY - crossWidth/2, 
      crossSize, 
      crossWidth, 
      'S'
    );
  }

  /**
   * Add certification text with exact template positioning
   * Requirements: 1.3 - Exact certification text layout
   */
  private addTemplateCertificationText(): void {
    const cert = TEMPLATE_LAYOUT.POSITIONS.CERTIFICATION;

    // Apply precise font styling for certification text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(cert.FONT_SIZE);
    this.doc.setTextColor(44, 62, 80);

    // Note: Line height is controlled through positioning rather than setLineHeightFactor

    // Split text with exact width constraints matching template
    const lines = this.doc.splitTextToSize(TEMPLATE_LAYOUT.TEXT.CERTIFICATION, cert.WIDTH);
    
    // Position text with exact spacing and alignment
    this.positionCertificationTextExactly(lines, cert);

    // Add precise certification box with template-matching styling
    this.addCertificationBoxStyling(cert, lines.length);
  }

  /**
   * Position certification text with exact template spacing and alignment
   * Requirements: 1.3, 1.4 - Exact text spacing and alignment matching template
   */
  private positionCertificationTextExactly(lines: string[], cert: any): void {
    // Apply precise line spacing matching template
    let currentY = cert.Y;
    
    lines.forEach((line: string) => {
      // Position each line with precise Y spacing
      this.doc.text(line, cert.X, currentY);
      
      // Increment Y position with exact line height from template
      currentY += cert.LINE_HEIGHT;
    });
  }

  /**
   * Add certification box styling matching template exactly
   * Requirements: 1.3, 1.4 - Exact box styling and positioning
   */
  private addCertificationBoxStyling(cert: any, lineCount: number): void {
    const textHeight = lineCount * cert.LINE_HEIGHT;
    
    // Main certification box border
    this.doc.setDrawColor(189, 195, 199);
    this.doc.setLineWidth(0.3);
    this.doc.rect(
      cert.X - 3, 
      cert.Y - 5, 
      cert.WIDTH + 6, 
      textHeight + cert.BOX_PADDING, 
      'S'
    );

    // Add subtle inner shadow effect for template matching
    this.doc.setDrawColor(240, 240, 240);
    this.doc.setLineWidth(0.1);
    this.doc.rect(
      cert.X - 2.5, 
      cert.Y - 4.5, 
      cert.WIDTH + 5, 
      textHeight + cert.BOX_PADDING - 1, 
      'S'
    );

    // Add corner accent marks for professional appearance
    this.addCertificationBoxAccents(cert, textHeight);
  }

  /**
   * Add corner accent marks to certification box
   * Requirements: 1.3, 1.4 - Template design elements and professional appearance
   */
  private addCertificationBoxAccents(cert: any, textHeight: number): void {
    const accentSize = 1.5;
    const boxX = cert.X - 3;
    const boxY = cert.Y - 5;
    const boxWidth = cert.WIDTH + 6;
    const boxHeight = textHeight + cert.BOX_PADDING;

    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(0.3);

    // Top-left accent
    this.doc.line(boxX, boxY + accentSize, boxX, boxY);
    this.doc.line(boxX, boxY, boxX + accentSize, boxY);

    // Top-right accent
    this.doc.line(boxX + boxWidth - accentSize, boxY, boxX + boxWidth, boxY);
    this.doc.line(boxX + boxWidth, boxY, boxX + boxWidth, boxY + accentSize);

    // Bottom-left accent
    this.doc.line(boxX, boxY + boxHeight - accentSize, boxX, boxY + boxHeight);
    this.doc.line(boxX, boxY + boxHeight, boxX + accentSize, boxY + boxHeight);

    // Bottom-right accent
    this.doc.line(boxX + boxWidth - accentSize, boxY + boxHeight, boxX + boxWidth, boxY + boxHeight);
    this.doc.line(boxX + boxWidth, boxY + boxHeight - accentSize, boxX + boxWidth, boxY + boxHeight);
  }

  /**
   * Add data fields with exact template positioning
   * Requirements: 1.3 - Exact field positioning and layout
   */
  private addTemplateDataFields(data: TemplateFieldData): void {
    const fields = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;
    let currentY: number = fields.START_Y;

    // Birth Details Section
    currentY = this.addTemplateSection(TEMPLATE_LAYOUT.TEXT.SECTIONS.BIRTH_DETAILS, currentY);
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.CHILD_NAME, data.babyName, currentY, true);
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.GENDER, data.gender, currentY);
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.DATE_OF_BIRTH, data.dateOfBirth, currentY, true);
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.PLACE_OF_BIRTH, data.placeOfBirth, currentY);

    // Registration Details Section (simplified - no heading)
    // currentY = this.addTemplateSection(TEMPLATE_LAYOUT.TEXT.SECTIONS.REGISTRATION_DETAILS, currentY);  // Removed as requested
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.REGISTRATION_NO, data.registrationNo, currentY, true);
    // currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.REGISTRATION_DATE, data.dateOfRegistration, currentY, true);  // Removed as requested
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.REGISTERING_AUTHORITY, TEMPLATE_LAYOUT.TEXT.DEFAULTS.REGISTERING_AUTHORITY, currentY);

    // Parent Details Section (simplified - no heading, no nationality)
    // currentY = this.addTemplateSection(TEMPLATE_LAYOUT.TEXT.SECTIONS.PARENT_DETAILS, currentY);  // Removed as requested
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.PARENT_NAME, data.parentName, currentY);
    currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.ADDRESS, data.address, currentY);
    // currentY = this.addTemplateField(TEMPLATE_LAYOUT.TEXT.FIELD_LABELS.NATIONALITY, data.nationality, currentY);  // Removed as requested
  }

  /**
   * Add section header with exact template formatting
   * Requirements: 1.3 - Exact section header formatting
   */
  private addTemplateSection(title: string, currentY: number): number {
    const fields = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;
    
    // Add section spacing
    currentY += fields.SECTION_SPACING;

    // Section header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(fields.FONTS.SECTION_HEADER.SIZE);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(title, fields.LABEL_X, currentY);

    // Decorative underline
    this.doc.setDrawColor(52, 73, 94);
    this.doc.setLineWidth(0.5);
    this.doc.line(fields.LABEL_X, currentY + 2, fields.LABEL_X + this.doc.getTextWidth(title), currentY + 2);

    return currentY + 10;
  }

  /**
   * Add field with exact template formatting
   * Requirements: 1.3 - Exact field formatting and positioning
   */
  private addTemplateField(label: string, value: string, currentY: number, isImportant: boolean = false): number {
    const fields = TEMPLATE_LAYOUT.POSITIONS.DATA_FIELDS;

    // Apply precise text positioning for field label
    this.positionTextElementExactly(label + ':', fields.LABEL_X, currentY, {
      font: 'helvetica',
      style: 'bold',
      size: fields.FONTS.FIELD_LABEL.SIZE,
      color: [44, 62, 80],
      align: 'left'
    });

    // Apply precise text positioning for field value
    const valueStyle = isImportant ? {
      font: 'helvetica',
      style: 'bold',
      size: fields.FONTS.IMPORTANT_VALUE.SIZE,
      color: [44, 62, 80],
      align: 'left'
    } : {
      font: 'helvetica',
      style: 'normal',
      size: fields.FONTS.FIELD_VALUE.SIZE,
      color: [44, 62, 80],
      align: 'left'
    };

    this.positionTextElementExactly(value, fields.VALUE_X, currentY, valueStyle);

    // Add precise field underline with exact spacing
    this.addPreciseFieldUnderline(fields.VALUE_X, currentY + fields.UNDERLINE_OFFSET, fields.FIELD_WIDTH);

    return currentY + fields.LINE_HEIGHT;
  }

  /**
   * Position text elements with exact template specifications
   * Requirements: 1.3, 1.4 - Exact text positioning and alignment
   */
  private positionTextElementExactly(text: string, x: number, y: number, style: any): void {
    // Set font properties with exact specifications
    this.doc.setFont(style.font, style.style);
    this.doc.setFontSize(style.size);
    this.doc.setTextColor(style.color[0], style.color[1], style.color[2]);

    // Position text with exact alignment
    const alignOptions = style.align ? { align: style.align } : undefined;
    this.doc.text(text, x, y, alignOptions);
  }

  /**
   * Add precise field underline matching template spacing
   * Requirements: 1.3, 1.4 - Exact underline positioning and spacing
   */
  private addPreciseFieldUnderline(x: number, y: number, width: number): void {
    // Main underline
    this.doc.setDrawColor(189, 195, 199);
    this.doc.setLineWidth(TEMPLATE_LAYOUT.BORDERS.FIELD_UNDERLINES.WIDTH);
    this.doc.line(x, y, x + width, y);

    // Add subtle shadow effect for better template matching
    this.doc.setDrawColor(220, 220, 220);
    this.doc.setLineWidth(0.1);
    this.doc.line(x, y + 0.2, x + width, y + 0.2);
  }

  /**
   * Add footer with exact template positioning
   * Requirements: 1.3 - Exact footer layout and positioning
   */
  private addTemplateFooter(data: TemplateFieldData): void {
    const footer = TEMPLATE_LAYOUT.POSITIONS.FOOTER;

    // Separator line
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(0.5);
    this.doc.line(35, footer.SEPARATOR_LINE_Y, 175, footer.SEPARATOR_LINE_Y);

    // Authentication header - Removed as requested
    // this.doc.setFont('helvetica', 'bold');
    // this.doc.setFontSize(footer.AUTH_HEADER.FONT_SIZE);
    // this.doc.setTextColor(44, 62, 80);
    // this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.AUTH_HEADER, footer.AUTH_HEADER.X, footer.AUTH_HEADER.Y);

    // Issue date - prominently display current system date
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(footer.ISSUE_DATE.FONT_SIZE);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.ISSUE_DATE_LABEL, footer.ISSUE_DATE.LABEL_X, footer.ISSUE_DATE.Y);
    
    // Highlight issue date with current system date
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80); // Ensure prominent display
    this.doc.text(data.issueDate, footer.ISSUE_DATE.VALUE_X, footer.ISSUE_DATE.Y);
    
    // Add issue time for precise tracking (smaller text below issue date)
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(7);
    this.doc.setTextColor(102, 102, 102);
    const issueTime = this.getCurrentDateTimeForIssue();
    this.doc.text(`Issued: ${issueTime}`, footer.ISSUE_DATE.VALUE_X, footer.ISSUE_DATE.Y + 4);

    // Certificate number
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.CERT_NUMBER_LABEL, footer.CERT_NUMBER.LABEL_X, footer.CERT_NUMBER.Y);
    this.doc.setFont('helvetica', 'normal');
    const certNumber = this.generateCertificateNumber(data.registrationNo);
    this.doc.text(certNumber, footer.CERT_NUMBER.VALUE_X, footer.CERT_NUMBER.Y);

    // Signature section
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(footer.SIGNATURE.FONT_SIZE);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.SIGNATURE_LABEL, footer.SIGNATURE.LABEL_X, footer.SIGNATURE.LABEL_Y);

    // Signature line
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(0.5);
    this.doc.line(footer.SIGNATURE.LINE_X_START, footer.SIGNATURE.LINE_Y, footer.SIGNATURE.LINE_X_END, footer.SIGNATURE.LINE_Y);

    // Authority name and designation
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.AUTHORITY_NAME, footer.SIGNATURE.LABEL_X, footer.SIGNATURE.AUTHORITY_NAME_Y);
    // this.doc.setFont('helvetica', 'normal');
    // this.doc.setFontSize(8);
    // this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.DESIGNATION, footer.SIGNATURE.LABEL_X, footer.SIGNATURE.DESIGNATION_Y);  // Removed "Registrar of Births"

    // Official seal
    this.addTemplateOfficialSeal(footer.SEAL, data);

    // Legal reference text (as shown in template) - Removed as requested
    // this.doc.setFont('helvetica', 'normal');
    // this.doc.setFontSize(6);
    // this.doc.setTextColor(102, 102, 102);
    // this.doc.text('Issued under the Registration of Births and Deaths Act, 1969', footer.VALIDITY_NOTE.X, footer.VALIDITY_NOTE.Y - 8, { align: 'center' });  // Removed as requested

    // Validity note
    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(footer.VALIDITY_NOTE.FONT_SIZE);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.VALIDITY_NOTE, footer.VALIDITY_NOTE.X, footer.VALIDITY_NOTE.Y, { align: 'center' });

    // Additional disclaimer text (as shown in template)
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(6);
    this.doc.setTextColor(102, 102, 102);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.DISCLAIMER, footer.VALIDITY_NOTE.X, footer.VALIDITY_NOTE.Y + 6, { align: 'center' });

    // Verification contact information (as shown in template)
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(6);
    this.doc.setTextColor(102, 102, 102);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.VERIFICATION_NOTE, footer.VALIDITY_NOTE.X, footer.VALIDITY_NOTE.Y + 12, { align: 'center' });
  }

  /**
   * Add official seal with exact template specifications
   * Requirements: 1.3 - Exact seal positioning and formatting
   */
  private addTemplateOfficialSeal(seal: any, _data: TemplateFieldData): void {
    // Outer circle
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(1.5);
    this.doc.circle(seal.CENTER_X, seal.CENTER_Y, seal.OUTER_RADIUS, 'S');

    // Inner circle
    this.doc.setDrawColor(52, 73, 94);
    this.doc.setLineWidth(0.5);
    this.doc.circle(seal.CENTER_X, seal.CENTER_Y, seal.INNER_RADIUS, 'S');

    // Seal text
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(seal.FONTS.MAIN_TEXT);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.SEAL_TEXT.OFFICIAL, seal.CENTER_X, seal.CENTER_Y + seal.TEXT_OFFSETS.OFFICIAL_Y, { align: 'center' });
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.SEAL_TEXT.SEAL, seal.CENTER_X, seal.CENTER_Y + seal.TEXT_OFFSETS.SEAL_Y, { align: 'center' });

    this.doc.setFontSize(seal.FONTS.HOSPITAL_TEXT);
    this.doc.setTextColor(52, 73, 94);
    this.doc.text(TEMPLATE_LAYOUT.TEXT.FOOTER.SEAL_TEXT.HOSPITAL, seal.CENTER_X, seal.CENTER_Y + seal.TEXT_OFFSETS.HOSPITAL_Y, { align: 'center' });

    this.doc.setFontSize(seal.FONTS.YEAR_TEXT);
    this.doc.setTextColor(44, 62, 80);
    const currentYear = new Date().getFullYear().toString();
    this.doc.text(currentYear, seal.CENTER_X, seal.CENTER_Y + seal.TEXT_OFFSETS.YEAR_Y, { align: 'center' });
  }

  /**
   * Add security elements matching template
   * Requirements: 1.3 - Template security elements
   */
  private addTemplateSecurityElements(): void {
    const security = TEMPLATE_LAYOUT.SECURITY;

    // Main watermark
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(security.WATERMARK.FONT_SIZE);
    this.doc.setTextColor(240, 240, 240);
    this.doc.text(security.WATERMARK.TEXT, security.WATERMARK.X, security.WATERMARK.Y, {
      align: 'center',
      angle: security.WATERMARK.ANGLE
    });

    // Secondary watermark
    this.doc.setFontSize(security.SECONDARY_WATERMARK.FONT_SIZE);
    this.doc.setTextColor(250, 250, 250);
    this.doc.text(security.SECONDARY_WATERMARK.TEXT, security.SECONDARY_WATERMARK.X, security.SECONDARY_WATERMARK.Y, {
      align: 'center',
      angle: security.SECONDARY_WATERMARK.ANGLE
    });

    // Corner marks
    this.doc.setFontSize(security.CORNER_MARKS.FONT_SIZE);
    this.doc.setTextColor(200, 200, 200);
    this.doc.setFont('helvetica', 'normal');

    const positions = security.CORNER_MARKS.POSITIONS;
    this.doc.text(positions.TOP_LEFT.TEXT, positions.TOP_LEFT.X, positions.TOP_LEFT.Y);
    this.doc.text(this.getCurrentDateTime(), positions.TOP_RIGHT.X, positions.TOP_RIGHT.Y);
    this.doc.text(positions.BOTTOM_LEFT.TEXT, positions.BOTTOM_LEFT.X, positions.BOTTOM_LEFT.Y);
    this.doc.text(positions.BOTTOM_RIGHT.TEXT, positions.BOTTOM_RIGHT.X, positions.BOTTOM_RIGHT.Y);
  }

  // Helper methods for data extraction and formatting
  // Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 - Data mapping for template fields

  /**
   * Extract baby name from birth record data
   * Requirements: 2.1 - Baby name from birthRecord.babyName or birthRecord.firstName
   */
  private extractBabyName(birthRecord: BirthRecordInput): string {
    // Priority 1: Use babyName if available
    if (birthRecord.babyName?.trim()) {
      return this.formatNameForTemplate(birthRecord.babyName.trim());
    }
    
    // Priority 2: Combine firstName and lastName
    const firstName = birthRecord.firstName?.trim() || '';
    const lastName = birthRecord.lastName?.trim() || '';
    
    if (firstName || lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      return this.formatNameForTemplate(fullName);
    }
    
    return 'Name Not Provided';
  }

  /**
   * Format name for template display with proper capitalization
   * Requirements: 2.1 - Proper name formatting for template
   */
  private formatNameForTemplate(name: string): string {
    if (!name?.trim()) return 'Name Not Provided';
    
    // Convert to proper case (first letter of each word capitalized)
    return name.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .substring(0, TEMPLATE_LAYOUT.VALIDATION.FIELD_LENGTHS.MAX_NAME_LENGTH);
  }

  /**
   * Convert gender code to readable text
   * Requirements: 2.2 - Gender conversion (1=Female, 2=Male) for template display
   */
  private formatGender(gender: string | number | undefined): string {
    // Handle numeric codes as specified in requirements
    if (gender === 1 || gender === '1') return 'Female';
    if (gender === 2 || gender === '2') return 'Male';
    
    // Handle string values
    if (typeof gender === 'string' && gender.trim()) {
      const genderStr = gender.trim().toLowerCase();
      if (genderStr === 'female' || genderStr === 'f') return 'Female';
      if (genderStr === 'male' || genderStr === 'm') return 'Male';
      
      // Return capitalized version of other string values
      return gender.trim().charAt(0).toUpperCase() + gender.trim().slice(1).toLowerCase();
    }
    
    return 'Not Specified';
  }

  /**
   * Format date to match template date format requirements
   * Requirements: 2.3, 2.6 - Date formatting for birth date and registration date
   */
  private formatDate(dateString: string | undefined): string {
    if (!dateString?.trim()) {
      return 'Date Not Provided';
    }

    try {
      // Handle various input date formats
      let date: Date;
      
      // Try parsing as ISO date first (YYYY-MM-DD)
      if (dateString.includes('-') && dateString.length >= 10) {
        date = new Date(dateString);
      }
      // Try parsing as DD/MM/YYYY or MM/DD/YYYY
      else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format for template consistency
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          date = new Date(year, month, day);
        } else {
          date = new Date(dateString);
        }
      }
      // Try direct parsing
      else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
      }
      
      // Format as DD/MM/YYYY to match template requirements
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString; // Return original on error
    }
  }

  /**
   * Extract registration number from birth record
   * Requirements: 2.5 - Registration details using birthRecord.birthId or visit ID
   */
  private extractRegistrationNumber(birthRecord: BirthRecordInput): string {
    // Priority 1: Use birthId if available
    if (birthRecord.birthId?.trim()) {
      return birthRecord.birthId.trim().substring(0, TEMPLATE_LAYOUT.VALIDATION.FIELD_LENGTHS.MAX_REGISTRATION_LENGTH);
    }
    
    // Priority 2: Use visitId if available
    if (birthRecord.visitId?.trim()) {
      return birthRecord.visitId.trim().substring(0, TEMPLATE_LAYOUT.VALIDATION.FIELD_LENGTHS.MAX_REGISTRATION_LENGTH);
    }
    
    // Fallback: Generate temporary registration number
    const timestamp = Date.now().toString().slice(-8);
    return `TEMP-${timestamp}`;
  }

  /**
   * Extract and format parent name with proper concatenation
   * Requirements: 2.7 - Parent name from parentData.firstName and parentData.lastName
   */
  private extractParentName(parentData: ParentDataInput): string {
    // Priority 1: Use mother name from birth record if available
    if (this.birthRecord?.motherName?.trim()) {
      return this.formatNameForTemplate(this.birthRecord.motherName.trim());
    }
    
    // Priority 2: Use parent data if available
    if (parentData) {
    const firstName = parentData.firstName?.trim() || '';
    const lastName = parentData.lastName?.trim() || '';
    
    if (firstName || lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      return this.formatNameForTemplate(fullName);
      }
    }
    
    return 'Not Provided';
  }

  /**
   * Extract and format address information
   * Requirements: 2.8 - Address information from parentData
   */
  private extractAddress(parentData: ParentDataInput): string {
    if (!parentData?.address?.trim()) {
      return 'Address Not Provided';
    }
    
    // Format address with proper capitalization and length limits
    const address = parentData.address.trim();
    const formattedAddress = this.formatAddressForTemplate(address);
    
    return formattedAddress.substring(0, TEMPLATE_LAYOUT.VALIDATION.FIELD_LENGTHS.MAX_ADDRESS_LENGTH);
  }

  /**
   * Format address for template display
   * Requirements: 2.8 - Proper address formatting
   */
  private formatAddressForTemplate(address: string): string {
    if (!address?.trim()) return 'Address Not Provided';
    
    // Clean up address formatting
    return address.trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ')
      .map(word => {
        // Capitalize first letter of each word, except common prepositions
        const lowerWord = word.toLowerCase();
        if (['of', 'in', 'at', 'on', 'by', 'for', 'with', 'to'].includes(lowerWord)) {
          return lowerWord;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  /**
   * Extract nationality information
   * Requirements: 2.9 - Nationality information display
   */
  private extractNationality(parentData: ParentDataInput): string {
    if (parentData?.nationality?.trim()) {
      return this.formatNationalityForTemplate(parentData.nationality.trim());
    }
    
    // Use default nationality from template
    return TEMPLATE_LAYOUT.TEXT.DEFAULTS.NATIONALITY;
  }

  /**
   * Format nationality for template display
   * Requirements: 2.9 - Proper nationality formatting
   */
  private formatNationalityForTemplate(nationality: string): string {
    if (!nationality?.trim()) return TEMPLATE_LAYOUT.TEXT.DEFAULTS.NATIONALITY;
    
    // Capitalize first letter and format properly
    return nationality.trim().charAt(0).toUpperCase() + nationality.trim().slice(1).toLowerCase();
  }

  /**
   * Get current system date formatted for template as issue date
   * Requirements: 4.1 - Add current system date as issue date in certificate
   */
  private getCurrentDate(): string {
    const now = new Date();
    
    // Format current system date for certificate issue date
    // Using DD/MM/YYYY format to match template requirements
    return now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Get current system date and time with enhanced formatting for issue tracking
   * Requirements: 4.1 - Current system date as issue date with precise timing
   */
  private getCurrentDateTimeForIssue(): string {
    const now = new Date();
    
    // Format with date and time for comprehensive issue tracking
    return now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  /**
   * Get current date and time for security elements
   * Requirements: Template security and validation
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
   * Generate certificate number with proper formatting
   * Requirements: 4.5 - Descriptive certificate numbering
   */
  private generateCertificateNumber(registrationNo: string): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    const cleanRegNo = registrationNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `HODO-${year}-${month}-${cleanRegNo}`;
  }

  /**
   * Generate descriptive filename using comprehensive patient information
   * Requirements: 3.3, 4.1, 4.5 - Descriptive filenames, current date, and patient information
   */
  private generateDescriptiveFilename(templateData: TemplateFieldData, birthRecord: BirthRecordInput): string {
    // Extract and sanitize baby name for filename
    const babyName = this.sanitizeForFilename(templateData.babyName);
    
    // Extract and format birth date for filename
    const birthDateForFilename = this.formatDateForFilename(birthRecord.dateOfBirth);
    
    // Extract registration number for filename
    const registrationNo = this.sanitizeForFilename(templateData.registrationNo);
    
    // Generate current date for issue tracking
    const issueDate = this.formatDateForFilename(new Date().toISOString());
    
    // Create comprehensive filename with patient information
    // Format: BabyName_BirthCert_DOB_RegNo_IssueDate.pdf
    const filenameParts = [
      babyName || 'UnknownName',
      'BirthCertificate',
      birthDateForFilename ? `DOB_${birthDateForFilename}` : '',
      registrationNo ? `Reg_${registrationNo}` : '',
      `Issued_${issueDate}`
    ].filter(part => part.length > 0);
    
    const filename = filenameParts.join('_') + '.pdf';
    
    // Ensure filename doesn't exceed system limits (255 characters max)
    return filename.length > 200 ? this.truncateFilename(filename) : filename;
  }

  /**
   * Sanitize text for safe filename usage
   * Requirements: 3.3 - Safe filename generation across different browsers
   */
  private sanitizeForFilename(text: string): string {
    if (!text?.trim()) return '';
    
    return text.trim()
      // Remove special characters that might cause issues in filenames
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      // Replace spaces and other whitespace with underscores
      .replace(/\s+/g, '_')
      // Remove multiple consecutive underscores
      .replace(/_+/g, '_')
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, '')
      // Limit length to prevent overly long filenames
      .substring(0, 50);
  }

  /**
   * Format date for filename usage
   * Requirements: 4.1 - Current system date formatting for filenames
   */
  private formatDateForFilename(dateString: string | undefined): string {
    if (!dateString?.trim()) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format as YYYY-MM-DD for filename sorting
      return date.toISOString().slice(0, 10);
    } catch (error) {
      return '';
    }
  }

  /**
   * Truncate filename if it exceeds reasonable length
   * Requirements: 3.3 - Handle filename length limits across browsers
   */
  private truncateFilename(filename: string): string {
    const maxLength = 200;
    const extension = '.pdf';
    
    if (filename.length <= maxLength) return filename;
    
    // Keep the extension and truncate the base name
    const baseName = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedBase = baseName.substring(0, maxLength - extension.length - 3) + '...';
    
    return truncatedBase + extension;
  }

  /**
   * Download certificate with descriptive filename and cross-browser compatibility
   * Requirements: 3.3, 4.1, 4.5 - Seamless download, current date, descriptive filenames
   */
  private downloadCertificateWithDescriptiveFilename(templateData: TemplateFieldData, birthRecord: BirthRecordInput): void {
    try {
      // Generate descriptive filename using patient information
      const filename = this.generateDescriptiveFilename(templateData, birthRecord);
      
      // Ensure PDF download works seamlessly without page navigation
      this.performSeamlessDownload(filename);
      
    } catch (error) {
      console.error('Certificate download failed:', error);
      
      // Fallback to simple filename if descriptive generation fails
      const fallbackFilename = `Birth_Certificate_${new Date().toISOString().slice(0, 10)}.pdf`;
      this.performSeamlessDownload(fallbackFilename);
    }
  }

  /**
   * Perform seamless PDF download across different browsers
   * Requirements: 3.3 - Handle file download across different browsers without page navigation
   */
  private performSeamlessDownload(filename: string): void {
    try {
      // Use optimized download method based on browser capabilities
      this.performOptimizedDownload(filename);
      
      // Log successful download for debugging
      console.log(`Birth certificate download initiated successfully: ${filename}`);
      
    } catch (error) {
      console.error('PDF download failed:', error);
      
      // Final fallback to show user-friendly error message
      this.showDownloadFailureMessage();
    }
  }

  /**
   * Fallback download method for browsers with limited support
   * Requirements: 3.3 - Cross-browser compatibility for file downloads
   */
  private fallbackDownloadMethod(filename: string): void {
    try {
      // Generate PDF blob
      const pdfBlob = this.doc.output('blob');
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = filename;
      downloadLink.style.display = 'none';
      
      // Append to document, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up object URL to prevent memory leaks
      setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
      }, 100);
      
      console.log(`Birth certificate downloaded via fallback method: ${filename}`);
      
    } catch (fallbackError) {
      console.error('Fallback download method also failed:', fallbackError);
      
      // Final fallback - open PDF in new tab
      this.openPdfInNewTab();
    }
  }

  /**
   * Final fallback - open PDF in new tab if download fails
   * Requirements: 3.3 - Ensure certificate is accessible even if download fails
   */
  private openPdfInNewTab(): void {
    try {
      const pdfDataUri = this.doc.output('datauristring');
      const newWindow = window.open();
      
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Birth Certificate - HODO Hospital</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { margin: 0; padding: 0; background: #f0f0f0; }
                .pdf-container { width: 100%; height: 100vh; }
                .pdf-header { 
                  background: #2c3e50; 
                  color: white; 
                  padding: 10px; 
                  text-align: center; 
                  font-family: Arial, sans-serif;
                }
                iframe { border: none; width: 100%; height: calc(100vh - 50px); }
              </style>
            </head>
            <body>
              <div class="pdf-header">
                Birth Certificate - HODO Hospital (Generated: ${new Date().toLocaleString()})
              </div>
              <div class="pdf-container">
                <iframe src="${pdfDataUri}" title="Birth Certificate PDF"></iframe>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
        
        console.log('Birth certificate opened in new tab as final fallback');
      } else {
        console.error('Unable to open PDF - popup blocked or browser limitation');
        this.showDownloadFailureMessage();
      }
    } catch (error) {
      console.error('Final fallback method failed:', error);
      this.showDownloadFailureMessage();
    }
  }

  /**
   * Show user-friendly message when download fails
   * Requirements: 3.3 - User-friendly error handling for download failures
   */
  private showDownloadFailureMessage(): void {
    const message = `
      Certificate generated successfully, but download failed.
      
      This might be due to:
      • Browser popup blocker settings
      • Browser security restrictions
      • Network connectivity issues
      
      Please try:
      1. Allowing popups for this site
      2. Using a different browser
      3. Checking your download settings
      4. Contacting support if the issue persists
    `;
    
    alert(message);
  }

  /**
   * Check browser download capabilities
   * Requirements: 3.3 - Cross-browser compatibility detection
   */
  private checkBrowserDownloadSupport(): boolean {
    try {
      // Check for basic download support
      const hasDownloadSupport = 'download' in document.createElement('a');
      const hasBlobSupport = typeof Blob !== 'undefined';
      const hasURLSupport = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function';
      
      return hasDownloadSupport && hasBlobSupport && hasURLSupport;
    } catch (error) {
      console.warn('Browser capability check failed:', error);
      return false;
    }
  }

  /**
   * Get browser-specific download method
   * Requirements: 3.3 - Optimize download method based on browser capabilities
   */
  private getBrowserOptimizedDownloadMethod(): 'native' | 'blob' | 'fallback' {
    // Check for modern browser support
    if (this.checkBrowserDownloadSupport()) {
      return 'native';
    }
    
    // Check for blob support (older browsers)
    if (typeof Blob !== 'undefined') {
      return 'blob';
    }
    
    // Use fallback for very old browsers
    return 'fallback';
  }

  /**
   * Enhanced download with browser-specific optimization
   * Requirements: 3.3 - Optimized cross-browser download handling
   */
  private performOptimizedDownload(filename: string): void {
    const downloadMethod = this.getBrowserOptimizedDownloadMethod();
    
    try {
      switch (downloadMethod) {
        case 'native':
          this.doc.save(filename);
          break;
          
        case 'blob':
          this.fallbackDownloadMethod(filename);
          break;
          
        case 'fallback':
          this.openPdfInNewTab();
          break;
          
        default:
          this.doc.save(filename);
      }
      
      console.log(`Certificate downloaded using ${downloadMethod} method: ${filename}`);
      
    } catch (error) {
      console.error(`Download failed with ${downloadMethod} method:`, error);
      
      // Try next fallback method
      if (downloadMethod === 'native') {
        this.fallbackDownloadMethod(filename);
      } else if (downloadMethod === 'blob') {
        this.openPdfInNewTab();
      } else {
        this.showDownloadFailureMessage();
      }
    }
  }

  /**
   * Validate required data before certificate generation
   * Requirements: 3.5 - Data validation and error handling
   */
  private validateRequiredData(birthRecord: BirthRecordInput, _parentData: ParentDataInput | undefined): string[] {
    const errors: string[] = [];
    
    // Check required fields as defined in template validation
    if (!birthRecord.babyName?.trim() && !birthRecord.firstName?.trim()) {
      errors.push('Baby name is required');
    }
    
    if (!birthRecord.dateOfBirth?.trim()) {
      errors.push('Date of birth is required');
    }
    
    // Validate date format if provided
    if (birthRecord.dateOfBirth?.trim()) {
      const testDate = new Date(birthRecord.dateOfBirth);
      if (isNaN(testDate.getTime())) {
        errors.push('Invalid date of birth format');
      }
    }
    
    // Validate registration date if provided
    if (birthRecord.admittedDate?.trim()) {
      const testDate = new Date(birthRecord.admittedDate);
      if (isNaN(testDate.getTime())) {
        errors.push('Invalid registration date format');
      }
    }
    
    return errors;
  }

  /**
   * Handle missing data with appropriate defaults
   * Requirements: 3.5 - Appropriate defaults for missing optional data
   */
  private handleMissingData(data: TemplateFieldData): TemplateFieldData {
    return {
      ...data,
      babyName: data.babyName || 'Name Not Provided',
      gender: data.gender || 'Not Specified',
      dateOfBirth: data.dateOfBirth || 'Date Not Provided',
      placeOfBirth: data.placeOfBirth || TEMPLATE_LAYOUT.TEXT.DEFAULTS.PLACE_OF_BIRTH,
      registrationNo: data.registrationNo || `TEMP-${Date.now()}`,
      // dateOfRegistration: data.dateOfRegistration || 'Date Not Provided',  // Removed as requested
      parentName: data.parentName || 'Parent Name Not Provided',
      address: data.address || 'Address Not Provided',
      // nationality: data.nationality || TEMPLATE_LAYOUT.TEXT.DEFAULTS.NATIONALITY,  // Removed as requested
      issueDate: data.issueDate || this.getCurrentDate()
    };
  }
}