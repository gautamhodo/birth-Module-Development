import jsPDF from 'jspdf';

/**
 * TypeScript interfaces for death certificate data structure
 */
export interface DeathCertificateData {
  fullName: string;
  gender: string;
  dateOfDeath: string;
  placeOfDeath: string;
  registrationNo: string;
  causeOfDeath: string;
  age: string;
  address: string;
  issueDate: string;
}

export interface DeathRecordInput {
  fullName?: string;
  gender?: string | number;
  dateOfDeath?: string;
  deathId?: string;
  ipNo?: string;
  age?: string | number;
  causeOfDeath?: string;
  address?: string;
  dateOfBirth?: string;
}

/**
 * Custom error classes for death certificate generation
 */
export class DeathValidationError extends Error {
  public readonly errors: string[];
  public readonly criticalErrors: string[];

  constructor(errors: string[], criticalErrors: string[] = []) {
    const message = criticalErrors.length > 0 
      ? `Critical data missing: ${criticalErrors.join(', ')}`
      : `Validation failed: ${errors.join(', ')}`;
    super(message);
    this.name = 'DeathValidationError';
    this.errors = errors;
    this.criticalErrors = criticalErrors;
  }
}

export class DeathCertificateGenerationError extends Error {
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'DeathCertificateGenerationError';
  }
}

/**
 * Death Certificate Generator using the same theme as birth certificate
 */
export class DeathCertificateGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
  }

  /**
   * Generate and download death certificate
   */
  public async generateAndDownloadCertificate(deathRecord: DeathRecordInput): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.generateFromTemplate(deathRecord);
        setTimeout(() => {
          resolve();
        }, 100);
      } catch (error) {
        console.error('Death certificate generation failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate death certificate for preview (returns blob instead of downloading)
   */
  public async generateForPreview(deathRecord: DeathRecordInput): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Generate certificate without downloading
        this.generateFromTemplateForPreview(deathRecord);
        
        // Return the PDF as a blob
        const pdfBlob = this.doc.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Death certificate preview generation failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate death certificate using template layout
   */
  private generateFromTemplate(deathRecord: DeathRecordInput): void {
    try {
      // Validate data
      const validationResult = this.validateDeathData(deathRecord);
      if (!validationResult.isValid) {
        throw new DeathValidationError(validationResult.errors, validationResult.criticalErrors);
      }

      // Map data to template structure
      const templateData = this.mapToTemplateFields(deathRecord);

      // Initialize document
      this.initializeDocument();

      // Generate certificate layout
      this.generateCertificateLayout(templateData);

      // Download with descriptive filename
      this.downloadCertificate(templateData);

    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate death certificate for preview (without downloading)
   */
  private generateFromTemplateForPreview(deathRecord: DeathRecordInput): void {
    try {
      // Validate data
      const validationResult = this.validateDeathData(deathRecord);
      if (!validationResult.isValid) {
        throw new DeathValidationError(validationResult.errors, validationResult.criticalErrors);
      }

      // Map data to template structure
      const templateData = this.mapToTemplateFields(deathRecord);

      // Initialize document
      this.initializeDocument();

      // Generate certificate layout
      this.generateCertificateLayout(templateData);

      // Don't download - just generate for preview

    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate death record data
   */
  private validateDeathData(deathRecord: DeathRecordInput): { isValid: boolean; errors: string[]; criticalErrors: string[] } {
    const errors: string[] = [];
    const criticalErrors: string[] = [];

    if (!deathRecord) {
      criticalErrors.push('Death record data is missing');
      return { isValid: false, errors, criticalErrors };
    }

    // Critical validations
    if (!deathRecord.fullName?.trim()) {
      criticalErrors.push('Full name is required');
    }

    if (!deathRecord.dateOfDeath?.trim()) {
      criticalErrors.push('Date of death is required');
    }

    // Optional validations
    if (!deathRecord.gender) {
      errors.push('Gender information is missing');
    }

    if (!deathRecord.deathId && !deathRecord.ipNo) {
      errors.push('Registration number is missing');
    }

    return {
      isValid: criticalErrors.length === 0,
      errors,
      criticalErrors
    };
  }

  /**
   * Map death record to template fields
   */
  private mapToTemplateFields(deathRecord: DeathRecordInput): DeathCertificateData {
    console.log('Mapping death record data:', deathRecord);
    
    const mappedData = {
      fullName: deathRecord.fullName?.trim() || 'Not Provided',
      gender: this.formatGender(deathRecord.gender),
      dateOfDeath: this.formatDate(deathRecord.dateOfDeath),
      placeOfDeath: 'HODO Hospital, Kazhakoottam',
      registrationNo: deathRecord.deathId || deathRecord.ipNo || `DEATH-${Date.now()}`,
      causeOfDeath: deathRecord.causeOfDeath || 'As per medical records',
      age: this.calculateAndFormatAge(deathRecord),
      address: deathRecord.address || 'Not Provided',
      issueDate: this.getCurrentDate()
    };
    
    console.log('Mapped certificate data:', mappedData);
    return mappedData;
  }

  /**
   * Format gender for display (matching API data format)
   */
  private formatGender(gender: string | number | undefined): string {
    console.log('Formatting gender:', gender, 'type:', typeof gender);
    
    if (gender === undefined || gender === null || gender === '') {
      return 'Not Specified';
    }
    
    if (typeof gender === 'number') {
      // Based on API data: 1 = Female, 2 = Male
      const result = gender === 1 ? 'Female' : gender === 2 ? 'Male' : 'Not Specified';
      console.log('Gender mapping result:', gender, '->', result);
      return result;
    }
    
    if (typeof gender === 'string') {
      const normalizedGender = gender.toLowerCase().trim();
      if (normalizedGender === 'male' || normalizedGender === 'm' || normalizedGender === '2') return 'Male';
      if (normalizedGender === 'female' || normalizedGender === 'f' || normalizedGender === '1') return 'Female';
      return normalizedGender.charAt(0).toUpperCase() + normalizedGender.slice(1);
    }
    
    return 'Not Specified';
  }

  /**
   * Calculate and format age from birth and death dates, or use provided age
   */
  private calculateAndFormatAge(deathRecord: DeathRecordInput): string {
    console.log('Calculating age for record:', {
      age: deathRecord.age,
      dateOfBirth: deathRecord.dateOfBirth,
      dateOfDeath: deathRecord.dateOfDeath
    });

    // If age is already calculated and provided, use it
    if (deathRecord.age && deathRecord.age !== 'Not Provided') {
      const formattedAge = this.formatAge(deathRecord.age);
      console.log('Using provided age:', formattedAge);
      return formattedAge;
    }

    // Try to calculate age from dateOfBirth and dateOfDeath
    if (deathRecord.dateOfBirth && deathRecord.dateOfDeath) {
      try {
        const birthDate = new Date(deathRecord.dateOfBirth);
        const deathDate = new Date(deathRecord.dateOfDeath);
        
        console.log('Calculating age from dates:', {
          birthDate: birthDate.toISOString(),
          deathDate: deathDate.toISOString()
        });
        
        if (!isNaN(birthDate.getTime()) && !isNaN(deathDate.getTime())) {
          const ageInYears = Math.floor((deathDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          
          console.log('Calculated age in years:', ageInYears);
          
          if (ageInYears >= 0) {
            return `${ageInYears} years`;
          }
        }
      } catch (error) {
        console.warn('Error calculating age from dates:', error);
      }
    }

    console.log('Could not calculate age, returning Not Provided');
    return 'Not Provided';
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string | undefined): string {
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
   * Format age for display
   */
  private formatAge(age: string | number | undefined): string {
    if (!age || age === 'Not Provided') return 'Not Provided';
    
    if (typeof age === 'number') {
      return age >= 0 ? `${age} years` : 'Not Provided';
    }
    
    if (typeof age === 'string') {
      // If it already contains "years", return as is
      if (age.toLowerCase().includes('year')) {
        return age;
      }
      
      const numAge = parseInt(age);
      if (!isNaN(numAge) && numAge >= 0) {
        return `${numAge} years`;
      }
      
      // Return the string as is if it's not a number
      return age;
    }
    
    return 'Not Provided';
  }

  /**
   * Get current date formatted
   */
  private getCurrentDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Initialize document with same styling as birth certificate
   */
  private initializeDocument(): void {
    // Set document properties
    this.doc.setProperties({
      title: 'Death Certificate - HODO Hospital',
      subject: 'Official Death Certificate',
      author: 'HODO Hospital, Kazhakoottam',
      creator: 'HODO Hospital Death Registration System'
    });

    // Set background
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(0, 0, 210, 297, 'F');

    // Add borders (same as birth certificate)
    this.addBorders();
  }

  /**
   * Add borders matching birth certificate style
   */
  private addBorders(): void {
    // Main outer border
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(1.5);
    this.doc.rect(15, 20, 180, 250, 'S');

    // Inner decorative border
    this.doc.setDrawColor(102, 102, 102);
    this.doc.setLineWidth(0.5);
    this.doc.rect(18, 23, 174, 244, 'S');

    // Add corner accents
    this.addCornerAccents();
  }

  /**
   * Add corner accents matching birth certificate
   */
  private addCornerAccents(): void {
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(0.5);
    
    // Top-left corner
    this.doc.line(17, 22, 20, 22);
    this.doc.line(17, 22, 17, 25);
    
    // Top-right corner
    this.doc.line(190, 22, 193, 22);
    this.doc.line(193, 22, 193, 25);
    
    // Bottom-left corner
    this.doc.line(17, 265, 17, 268);
    this.doc.line(17, 268, 20, 268);
    
    // Bottom-right corner
    this.doc.line(190, 268, 193, 268);
    this.doc.line(193, 265, 193, 268);
  }

  /**
   * Generate the main certificate layout
   */
  private generateCertificateLayout(data: DeathCertificateData): void {
    this.addHeader();
    this.addCertificationText();
    this.addDataFields(data);
    this.addFooter(data);
    this.addSecurityElements();
  }

  /**
   * Add header section
   */
  private addHeader(): void {
    // Add logo placeholder
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(1);
    this.doc.rect(25, 30, 15, 15, 'S');
    
    // Logo text
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(8);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('HODO', 32.5, 38, { align: 'center' });

    // Main title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('DEATH CERTIFICATE', 105, 40, { align: 'center' });

    // Hospital name
    this.doc.setFontSize(14);
    this.doc.text('HODO Hospital', 105, 50, { align: 'center' });

    // Subtitle
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text('Kazhakoottam, Thiruvananthapuram', 105, 58, { align: 'center' });

    // Decorative lines
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(1.5);
    this.doc.line(30, 65, 180, 65);
    
    this.doc.setDrawColor(52, 73, 94);
    this.doc.setLineWidth(0.5);
    this.doc.line(30, 67, 180, 67);
  }

  /**
   * Add certification text
   */
  private addCertificationText(): void {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(44, 62, 80);
    
    const certText = 'This is to certify that the following particulars have been compiled from the original';
    const certText2 = 'record of death which is registered in this hospital.';
    
    this.doc.text(certText, 105, 80, { align: 'center' });
    this.doc.text(certText2, 105, 88, { align: 'center' });
  }

  /**
   * Add data fields section with better layout
   */
  private addDataFields(data: DeathCertificateData): void {
    const startY = 105;
    const lineHeight = 14;
    const labelX = 30;
    const valueX = 95;
    const colonX = 90;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(44, 62, 80);

    // Full Name
    this.doc.text('Full Name', labelX, startY);
    this.doc.text(':', colonX, startY);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.fullName, valueX, startY);

    // Gender and Age on same line
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Gender', labelX, startY + lineHeight);
    this.doc.text(':', colonX, startY + lineHeight);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.gender, valueX, startY + lineHeight);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Age', 130, startY + lineHeight);
    this.doc.text(':', 145, startY + lineHeight);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.age, 150, startY + lineHeight);

    // Date of Death
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Date of Death', labelX, startY + lineHeight * 2);
    this.doc.text(':', colonX, startY + lineHeight * 2);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.dateOfDeath, valueX, startY + lineHeight * 2);

    // Place of Death
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Place of Death', labelX, startY + lineHeight * 3);
    this.doc.text(':', colonX, startY + lineHeight * 3);
    this.doc.setFont('helvetica', 'bold');
    const placeLines = this.wrapText(data.placeOfDeath, 85);
    placeLines.forEach((line, index) => {
      this.doc.text(line, valueX, startY + lineHeight * 3 + (index * 6));
    });

    // Cause of Death
    const causeY = startY + lineHeight * 4 + (placeLines.length > 1 ? 6 : 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Cause of Death', labelX, causeY);
    this.doc.text(':', colonX, causeY);
    this.doc.setFont('helvetica', 'bold');
    const causeLines = this.wrapText(data.causeOfDeath, 85);
    causeLines.forEach((line, index) => {
      this.doc.text(line, valueX, causeY + (index * 6));
    });

    // Registration Number
    const regY = causeY + lineHeight + (causeLines.length > 1 ? 6 : 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Registration No', labelX, regY);
    this.doc.text(':', colonX, regY);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.registrationNo, valueX, regY);

    // Address
    const addressY = regY + lineHeight;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Address', labelX, addressY);
    this.doc.text(':', colonX, addressY);
    this.doc.setFont('helvetica', 'bold');
    
    // Handle long addresses by wrapping text
    const addressLines = this.wrapText(data.address, 85);
    addressLines.forEach((line, index) => {
      this.doc.text(line, valueX, addressY + (index * 6));
    });
  }

  /**
   * Wrap text to fit within specified width
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = this.doc.getTextWidth(testLine);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [text];
  }

  /**
   * Add footer section
   */
  private addFooter(data: DeathCertificateData): void {
    const footerY = 210;
    
    // Decorative line above footer
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(0.5);
    this.doc.line(30, footerY - 5, 180, footerY - 5);
    
    // Issue date
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text(`Date of Issue: ${data.issueDate}`, 30, footerY + 5);

    // Signature section
    this.doc.text('Authorized Signature:', 30, footerY + 25);
    this.doc.setDrawColor(44, 62, 80);
    this.doc.line(30, footerY + 35, 100, footerY + 35);
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(102, 102, 102);
    this.doc.text('Medical Officer', 30, footerY + 40);

    // Official seal
    this.doc.setFontSize(10);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('Official Seal:', 130, footerY + 25);
    
    // Seal box
    this.doc.setDrawColor(44, 62, 80);
    this.doc.setLineWidth(1);
    this.doc.rect(130, footerY + 30, 40, 20, 'S');
    
    this.doc.setFontSize(8);
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('HODO HOSPITAL', 150, footerY + 38, { align: 'center' });
    this.doc.text('OFFICIAL SEAL', 150, footerY + 43, { align: 'center' });
    
    // Certificate validity note
    this.doc.setFontSize(8);
    this.doc.setTextColor(102, 102, 102);
    this.doc.text('This certificate is valid for all official purposes.', 105, footerY + 55, { align: 'center' });
  }

  /**
   * Add security elements
   */
  private addSecurityElements(): void {
    // Subtle watermark
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(35);
    this.doc.setTextColor(248, 248, 248);
    this.doc.text('OFFICIAL', 105, 150, { 
      align: 'center',
      angle: 45
    });

    // Additional watermark
    this.doc.setFontSize(25);
    this.doc.setTextColor(250, 250, 250);
    this.doc.text('DEATH CERTIFICATE', 105, 180, { 
      align: 'center',
      angle: 45
    });

    // Security border pattern - very subtle
    this.doc.setDrawColor(245, 245, 245);
    this.doc.setLineWidth(0.1);
    
    // Add subtle pattern around borders
    for (let i = 25; i < 265; i += 8) {
      this.doc.line(16, i, 17, i);
      this.doc.line(193, i, 194, i);
    }
    
    for (let i = 25; i < 185; i += 8) {
      this.doc.line(i, 21, i, 22);
      this.doc.line(i, 268, i, 269);
    }

    // Security code (bottom right)
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(6);
    this.doc.setTextColor(200, 200, 200);
    const securityCode = `DC-${Date.now().toString().slice(-6)}`;
    this.doc.text(securityCode, 185, 275);
  }

  /**
   * Download certificate with descriptive filename
   */
  private downloadCertificate(data: DeathCertificateData): void {
    const filename = this.generateFilename(data);
    this.doc.save(filename);
  }

  /**
   * Generate descriptive filename
   */
  private generateFilename(data: DeathCertificateData): string {
    const name = data.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().slice(0, 10);
    return `Death_Certificate_${name}_${date}.pdf`;
  }
}