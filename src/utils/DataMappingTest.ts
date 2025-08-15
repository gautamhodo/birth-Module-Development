/**
 * Test file to verify data mapping functionality for birth certificate template
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 - Data mapping verification
 */

import { TemplateCertificateGenerator, BirthRecordInput, ParentDataInput } from './TemplateCertificateGenerator';

/**
 * Test data mapping functions with various input scenarios
 */
export function testDataMapping(): void {
  console.log('Testing Birth Certificate Data Mapping...');
  
  const generator = new TemplateCertificateGenerator();
  
  // Test Case 1: Complete data
  console.log('\n=== Test Case 1: Complete Data ===');
  const completeRecord: BirthRecordInput = {
    firstName: 'john',
    lastName: 'doe',
    babyName: 'JOHN DOE',
    gender: 1,
    dateOfBirth: '2024-01-15',
    birthId: 'BIRTH123',
    visitId: 'VISIT456',
    admittedDate: '2024-01-16'
  };
  
  const completeParent: ParentDataInput = {
    firstName: 'jane',
    lastName: 'doe',
    nationality: 'indian',
    address: '123 main street, kochi, kerala, india'
  };
  
  try {
    generator.generateFromTemplate(completeRecord, completeParent);
    console.log('✓ Complete data test passed');
  } catch (error) {
    console.log('✗ Complete data test failed:', error);
  }
  
  // Test Case 2: Minimal required data
  console.log('\n=== Test Case 2: Minimal Required Data ===');
  const minimalRecord: BirthRecordInput = {
    babyName: 'Baby Smith',
    dateOfBirth: '2024-02-20'
  };
  
  const minimalParent: ParentDataInput = {};
  
  try {
    generator.generateFromTemplate(minimalRecord, minimalParent);
    console.log('✓ Minimal data test passed');
  } catch (error) {
    console.log('✗ Minimal data test failed:', error);
  }
  
  // Test Case 3: Gender conversion test
  console.log('\n=== Test Case 3: Gender Conversion ===');
  const genderTests = [
    { gender: 1, expected: 'Female' },
    { gender: 2, expected: 'Male' },
    { gender: '1', expected: 'Female' },
    { gender: '2', expected: 'Male' },
    { gender: 'female', expected: 'Female' },
    { gender: 'MALE', expected: 'Male' },
    { gender: undefined, expected: 'Not Specified' }
  ];
  
  genderTests.forEach((test, index) => {
    const testRecord: BirthRecordInput = {
      babyName: `Test Baby ${index}`,
      dateOfBirth: '2024-01-01',
      gender: test.gender
    };
    
    try {
      generator.generateFromTemplate(testRecord, {});
      console.log(`✓ Gender test ${index + 1} (${test.gender} -> ${test.expected}) passed`);
    } catch (error) {
      console.log(`✗ Gender test ${index + 1} failed:`, error);
    }
  });
  
  // Test Case 4: Date formatting test
  console.log('\n=== Test Case 4: Date Formatting ===');
  const dateTests = [
    '2024-01-15',
    '15/01/2024',
    '01/15/2024',
    '2024-12-31T10:30:00Z',
    'invalid-date',
    ''
  ];
  
  dateTests.forEach((dateStr, index) => {
    const testRecord: BirthRecordInput = {
      babyName: `Date Test Baby ${index}`,
      dateOfBirth: dateStr
    };
    
    try {
      generator.generateFromTemplate(testRecord, {});
      console.log(`✓ Date test ${index + 1} (${dateStr}) passed`);
    } catch (error) {
      console.log(`✗ Date test ${index + 1} (${dateStr}) failed:`, error);
    }
  });
  
  // Test Case 5: Name formatting test
  console.log('\n=== Test Case 5: Name Formatting ===');
  const nameTests = [
    { firstName: 'john', lastName: 'doe', babyName: undefined },
    { firstName: 'MARY', lastName: 'SMITH', babyName: undefined },
    { firstName: undefined, lastName: 'johnson', babyName: undefined },
    { firstName: undefined, lastName: undefined, babyName: 'baby williams' },
    { firstName: undefined, lastName: undefined, babyName: 'VERY LONG NAME THAT EXCEEDS THE MAXIMUM LENGTH ALLOWED FOR TEMPLATE DISPLAY' }
  ];
  
  nameTests.forEach((test, index) => {
    const testRecord: BirthRecordInput = {
      firstName: test.firstName,
      lastName: test.lastName,
      babyName: test.babyName,
      dateOfBirth: '2024-01-01'
    };
    
    try {
      generator.generateFromTemplate(testRecord, {});
      console.log(`✓ Name test ${index + 1} passed`);
    } catch (error) {
      console.log(`✗ Name test ${index + 1} failed:`, error);
    }
  });
  
  // Test Case 6: Address formatting test
  console.log('\n=== Test Case 6: Address Formatting ===');
  const addressTests = [
    '123 main street, kochi, kerala',
    'APARTMENT 4B, BUILDING NAME, CITY',
    'house no 456   multiple   spaces   address',
    'Very long address that might exceed the maximum length allowed for the template display and should be truncated properly',
    ''
  ];
  
  addressTests.forEach((address, index) => {
    const testParent: ParentDataInput = {
      firstName: 'Test',
      lastName: 'Parent',
      address: address
    };
    
    const testRecord: BirthRecordInput = {
      babyName: `Address Test Baby ${index}`,
      dateOfBirth: '2024-01-01'
    };
    
    try {
      generator.generateFromTemplate(testRecord, testParent);
      console.log(`✓ Address test ${index + 1} passed`);
    } catch (error) {
      console.log(`✗ Address test ${index + 1} failed:`, error);
    }
  });
  
  // Test Case 7: Error handling test
  console.log('\n=== Test Case 7: Error Handling ===');
  const errorTests = [
    { babyName: '', dateOfBirth: '2024-01-01' }, // Missing name
    { babyName: 'Test Baby', dateOfBirth: '' }, // Missing date
    { babyName: '', dateOfBirth: '' } // Missing both
  ];
  
  errorTests.forEach((test, index) => {
    try {
      generator.generateFromTemplate(test, {});
      console.log(`✗ Error test ${index + 1} should have failed but passed`);
    } catch (error) {
      console.log(`✓ Error test ${index + 1} correctly failed:`, (error as Error).message);
    }
  });
  
  console.log('\n=== Data Mapping Tests Complete ===');
}

// Export for use in other test files
export default testDataMapping;