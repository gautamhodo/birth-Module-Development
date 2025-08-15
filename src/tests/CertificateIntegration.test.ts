/**
 * Certificate Integration Tests
 * 
 * Tests certificate generation from both PatientProfile and BirthRecords components
 * Requirements: 3.1, 3.2 - Integration testing from both entry points
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TemplateCertificateGenerator } from '../utils/TemplateCertificateGenerator';

// Mock the certificate generator
jest.mock('../utils/TemplateCertificateGenerator');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Certificate Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('PatientProfile Integration', () => {
    const mockBirthRecord = {
      id: 1,
      babyName: 'Test Baby',
      firstName: 'Test',
      lastName: 'Baby',
      gender: 1,
      dateOfBirth: '2024-01-15',
      birthId: 'BR001',
      admittedDate: '2024-01-15',
      placeOfBirth: 'HODO Hospital'
    };

    const mockParentData = {
      id: 1,
      firstName: 'Test',
      lastName: 'Parent',
      nationality: 'Indian',
      address: '123 Test Street, Kazhakoottam'
    };

    beforeEach(() => {
      // Mock API responses
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBirthRecord)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockParentData)
        });
    });

    it('should integrate with Print Birth Report button in PatientProfile', async () => {
      // Requirements: 3.1 - PatientProfile component integration
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      // Import PatientProfile component dynamically to avoid module loading issues
      const PatientProfile = (await import('../pages/PatientProfile')).default;

      render(
        <MemoryRouter initialEntries={['/patient/1']}>
          <PatientProfile />
        </MemoryRouter>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('http://192.168.50.171:5000/birthRecords/1');
      });

      // Find and click the Print Birth Report button
      const printButton = await screen.findByText('Print Birth Report');
      expect(printButton).toBeInTheDocument();

      fireEvent.click(printButton);

      // Verify certificate generator was called with correct data
      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalledWith(
          expect.objectContaining({
            babyName: 'Test Baby',
            firstName: 'Test Baby',
            gender: 1,
            dateOfBirth: '2024-01-15',
            birthId: 'BR001'
          }),
          expect.objectContaining({
            firstName: 'Test',
            lastName: 'Parent',
            nationality: 'Indian',
            address: '123 Test Street, Kazhakoottam'
          })
        );
      });
    });

    it('should handle missing parent data gracefully in PatientProfile', async () => {
      // Requirements: 3.5 - Handle cases where parentData might be null or incomplete
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      // Mock API to return null parent data
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockBirthRecord)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(null)
        });

      const PatientProfile = (await import('../pages/PatientProfile')).default;

      render(
        <MemoryRouter initialEntries={['/patient/1']}>
          <PatientProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      const printButton = await screen.findByText('Print Birth Report');
      fireEvent.click(printButton);

      // Should still call generator with null parent data
      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalledWith(
          expect.objectContaining({
            babyName: 'Test Baby'
          }),
          null
        );
      });
    });

    it('should validate critical data before generation in PatientProfile', async () => {
      // Requirements: 3.5 - Validate required fields before certificate generation
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      // Mock birth record with missing critical data
      const incompleteBirthRecord = {
        ...mockBirthRecord,
        babyName: '',
        firstName: '',
        dateOfBirth: ''
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(incompleteBirthRecord)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockParentData)
        });

      // Mock window.alert
      window.alert = jest.fn();

      const PatientProfile = (await import('../pages/PatientProfile')).default;

      render(
        <MemoryRouter initialEntries={['/patient/1']}>
          <PatientProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      const printButton = await screen.findByText('Print Birth Report');
      fireEvent.click(printButton);

      // Should show error and not call generator
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Cannot Generate Certificate')
        );
        expect(mockGenerator.generateAndDownloadCertificate).not.toHaveBeenCalled();
      });
    });
  });

  describe('BirthRecords Integration', () => {
    const mockRecords = [
      {
        id: 1,
        firstName: 'Record',
        lastName: 'One',
        babyName: 'Record One',
        gender: 1,
        dateOfBirth: '2024-01-15',
        birthId: 'BR001',
        admittedDate: '2024-01-15'
      },
      {
        id: 2,
        firstName: 'Record',
        lastName: 'Two',
        babyName: 'Record Two',
        gender: 2,
        dateOfBirth: '2024-01-16',
        birthId: 'BR002',
        admittedDate: '2024-01-16'
      }
    ];

    beforeEach(() => {
      // Mock API response for birth records
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRecords)
      });
    });

    it('should integrate with print icon in BirthRecords page', async () => {
      // Requirements: 3.2 - BirthRecords page print icon functionality
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      const BirthRecords = (await import('../pages/BirthRecords')).default;

      render(
        <MemoryRouter>
          <BirthRecords sidebarCollapsed={false} toggleSidebar={() => {}} />
        </MemoryRouter>
      );

      // Wait for records to load
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('birthRecords')
        );
      });

      // Find print buttons (should be one for each record)
      const printButtons = await screen.findAllByTitle('Print PDF');
      expect(printButtons).toHaveLength(2);

      // Click first print button
      fireEvent.click(printButtons[0]);

      // Verify certificate generator was called with correct record data
      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Record One',
            babyName: 'Record One',
            gender: 1,
            dateOfBirth: '2024-01-15',
            birthId: 'BR001'
          }),
          null // Parent data not available in BirthRecords view
        );
      });
    });

    it('should handle individual record certificate generation', async () => {
      // Requirements: 3.2 - Individual record certificate generation
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      const BirthRecords = (await import('../pages/BirthRecords')).default;

      render(
        <MemoryRouter>
          <BirthRecords sidebarCollapsed={false} toggleSidebar={() => {}} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const printButtons = await screen.findAllByTitle('Print PDF');
      
      // Click second print button
      fireEvent.click(printButtons[1]);

      // Verify correct record was used
      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Record Two',
            babyName: 'Record Two',
            gender: 2,
            dateOfBirth: '2024-01-16',
            birthId: 'BR002'
          }),
          null
        );
      });
    });

    it('should validate record data before generation in BirthRecords', async () => {
      // Requirements: 3.5 - Data validation in BirthRecords
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockRejectedValue(
          new Error('ValidationError: Baby name is required')
        )
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      // Mock records with incomplete data
      const incompleteRecords = [
        {
          id: 1,
          firstName: '',
          babyName: '',
          dateOfBirth: '',
          gender: null
        }
      ];

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(incompleteRecords)
      });

      window.alert = jest.fn();

      const BirthRecords = (await import('../pages/BirthRecords')).default;

      render(
        <MemoryRouter>
          <BirthRecords sidebarCollapsed={false} toggleSidebar={() => {}} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const printButtons = await screen.findAllByTitle('Print PDF');
      fireEvent.click(printButtons[0]);

      // Should handle validation error
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Certificate Validation Failed')
        );
      });
    });
  });

  describe('Cross-Component Consistency', () => {
    it('should generate consistent certificates from both components', async () => {
      // Requirements: 3.1, 3.2 - Consistent certificate format across both entry points
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      const testData = {
        babyName: 'Consistency Test',
        firstName: 'Consistency Test',
        dateOfBirth: '2024-01-15',
        gender: 1,
        birthId: 'BR123'
      };

      const parentData = {
        firstName: 'Test',
        lastName: 'Parent'
      };

      // Test from PatientProfile
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(testData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(parentData)
        });

      const PatientProfile = (await import('../pages/PatientProfile')).default;

      const { unmount } = render(
        <MemoryRouter initialEntries={['/patient/1']}>
          <PatientProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      const printButton = await screen.findByText('Print Birth Report');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalledWith(
          expect.objectContaining({
            babyName: 'Consistency Test',
            dateOfBirth: '2024-01-15'
          }),
          expect.objectContaining({
            firstName: 'Test',
            lastName: 'Parent'
          })
        );
      });

      const patientProfileCall = mockGenerator.generateAndDownloadCertificate.mock.calls[0];
      unmount();

      // Reset mocks for BirthRecords test
      jest.clearAllMocks();
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      // Test from BirthRecords
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([testData])
      });

      const BirthRecords = (await import('../pages/BirthRecords')).default;

      render(
        <MemoryRouter>
          <BirthRecords sidebarCollapsed={false} toggleSidebar={() => {}} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const printButtons = await screen.findAllByTitle('Print PDF');
      fireEvent.click(printButtons[0]);

      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Consistency Test',
            dateOfBirth: '2024-01-15'
          }),
          null
        );
      });

      const birthRecordsCall = mockGenerator.generateAndDownloadCertificate.mock.calls[0];

      // Both calls should use the same core data structure
      expect(patientProfileCall[0].dateOfBirth).toBe(birthRecordsCall[0].dateOfBirth);
      expect(patientProfileCall[0].gender).toBe(birthRecordsCall[0].gender);
    });

    it('should handle errors consistently across both components', async () => {
      // Requirements: 3.5 - Consistent error handling
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockRejectedValue(
          new Error('CertificateGenerationError: PDF generation failed')
        )
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      window.alert = jest.fn();

      const testData = {
        babyName: 'Error Test',
        dateOfBirth: '2024-01-15'
      };

      // Test error handling in PatientProfile
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(testData)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(null)
        });

      const PatientProfile = (await import('../pages/PatientProfile')).default;

      const { unmount } = render(
        <MemoryRouter initialEntries={['/patient/1']}>
          <PatientProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      const printButton = await screen.findByText('Print Birth Report');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Certificate Generation Failed')
        );
      });

      const patientProfileError = (window.alert as jest.Mock).mock.calls[0][0];
      unmount();

      // Reset for BirthRecords test
      jest.clearAllMocks();
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);
      window.alert = jest.fn();

      // Test error handling in BirthRecords
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([testData])
      });

      const BirthRecords = (await import('../pages/BirthRecords')).default;

      render(
        <MemoryRouter>
          <BirthRecords sidebarCollapsed={false} toggleSidebar={() => {}} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const printButtons = await screen.findAllByTitle('Print PDF');
      fireEvent.click(printButtons[0]);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Certificate Generation Failed')
        );
      });

      const birthRecordsError = (window.alert as jest.Mock).mock.calls[0][0];

      // Both components should show similar error messages
      expect(patientProfileError).toContain('Certificate Generation Failed');
      expect(birthRecordsError).toContain('Certificate Generation Failed');
    });
  });

  describe('Data Retrieval and Mapping Consistency', () => {
    it('should maintain consistent data mapping between components', async () => {
      // Requirements: 3.1, 3.2 - Consistent data retrieval and mapping
      const mockGenerator = {
        generateAndDownloadCertificate: jest.fn().mockResolvedValue(undefined)
      };
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      const birthRecord = {
        id: 1,
        babyName: 'Data Mapping Test',
        firstName: 'Data Mapping',
        lastName: 'Test',
        gender: 2,
        dateOfBirth: '2024-01-15',
        birthId: 'BR999',
        visitId: 'V999',
        admittedDate: '2024-01-15'
      };

      const parentData = {
        firstName: 'Parent',
        lastName: 'Name',
        nationality: 'Indian',
        address: '123 Test Address'
      };

      // Test PatientProfile data mapping
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(birthRecord)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(parentData)
        });

      const PatientProfile = (await import('../pages/PatientProfile')).default;

      const { unmount } = render(
        <MemoryRouter initialEntries={['/patient/1']}>
          <PatientProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      const printButton = await screen.findByText('Print Birth Report');
      fireEvent.click(printButton);

      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalled();
      });

      const patientProfileData = mockGenerator.generateAndDownloadCertificate.mock.calls[0];
      unmount();

      // Reset for BirthRecords test
      jest.clearAllMocks();
      (TemplateCertificateGenerator as jest.Mock).mockImplementation(() => mockGenerator);

      // Test BirthRecords data mapping
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([birthRecord])
      });

      const BirthRecords = (await import('../pages/BirthRecords')).default;

      render(
        <MemoryRouter>
          <BirthRecords sidebarCollapsed={false} toggleSidebar={() => {}} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      const printButtons = await screen.findAllByTitle('Print PDF');
      fireEvent.click(printButtons[0]);

      await waitFor(() => {
        expect(mockGenerator.generateAndDownloadCertificate).toHaveBeenCalled();
      });

      const birthRecordsData = mockGenerator.generateAndDownloadCertificate.mock.calls[0];

      // Verify consistent data mapping
      expect(patientProfileData[0].babyName).toBe('Data Mapping Test');
      expect(birthRecordsData[0].firstName).toBe('Data Mapping');
      expect(patientProfileData[0].gender).toBe(birthRecordsData[0].gender);
      expect(patientProfileData[0].dateOfBirth).toBe(birthRecordsData[0].dateOfBirth);
      expect(patientProfileData[0].birthId).toBe(birthRecordsData[0].birthId);
    });
  });
});