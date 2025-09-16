/**
 * CSV Import/Export Service
 * 
 * Handles CSV import and export functionality for team members
 * with validation, error handling, and progress tracking.
 */

import { StreamlinedTeamMember } from './UnifiedDataService';

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: CSVImportError[];
  importedMembers: StreamlinedTeamMember[];
}

export interface CSVImportError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface CSVExportOptions {
  includeInactive?: boolean;
  includePassword?: boolean;
  includeAuditInfo?: boolean;
  customFields?: string[];
}

export class CSVService {
  private static instance: CSVService;

  public static getInstance(): CSVService {
    if (!CSVService.instance) {
      CSVService.instance = new CSVService();
    }
    return CSVService.instance;
  }

  /**
   * Export team members to CSV
   */
  async exportTeamMembers(
    teamMembers: StreamlinedTeamMember[], 
    options: CSVExportOptions = {}
  ): Promise<string> {
    const {
      includeInactive = false,
      includePassword = false,
      includeAuditInfo = false,
      customFields = []
    } = options;

    // Filter team members based on options
    let filteredMembers = teamMembers;
    if (!includeInactive) {
      filteredMembers = teamMembers.filter(member => member.status === 'active');
    }

    // Define CSV headers
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'Role',
      'Status',
      'Department',
      'Position',
      'Phone',
      'License Type',
      'Organization ID',
      'Created At',
      'Last Active'
    ];

    if (includePassword) {
      headers.splice(4, 0, 'Password');
    }

    if (includeAuditInfo) {
      headers.push('Created By', 'Updated At', 'Updated By');
    }

    // Add custom fields
    customFields.forEach(field => {
      if (!headers.includes(field)) {
        headers.push(field);
      }
    });

    // Convert team members to CSV rows
    const csvRows = filteredMembers.map(member => {
      const row = [
        member.email || '',
        member.firstName || '',
        member.lastName || '',
        member.role || '',
        member.status || '',
        member.department || '',
        member.position || '',
        member.phone || '',
        member.licenseType || '',
        member.organizationId || '',
        member.createdAt ? new Date(member.createdAt).toISOString() : '',
        member.lastActive ? new Date(member.lastActive).toISOString() : ''
      ];

      if (includePassword) {
        row.splice(4, 0, member.password || '');
      }

      if (includeAuditInfo) {
        row.push(
          member.createdBy || '',
          member.updatedAt ? new Date(member.updatedAt).toISOString() : '',
          member.updatedBy || ''
        );
      }

      // Add custom field values
      customFields.forEach(field => {
        const value = member[field as keyof StreamlinedTeamMember];
        row.push(typeof value === 'string' ? value : (value ? String(value) : ''));
      });

      return row;
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  /**
   * Import team members from CSV
   */
  async importTeamMembers(
    csvContent: string,
    organizationId: string,
    onProgress?: (progress: number) => void
  ): Promise<CSVImportResult> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return {
        success: false,
        totalRows: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [{ row: 0, field: 'general', value: '', error: 'CSV file is empty or invalid' }],
        importedMembers: []
      };
    }

    const headers = this.parseCSVLine(lines[0]);
    const dataRows = lines.slice(1);
    const errors: CSVImportError[] = [];
    const importedMembers: StreamlinedTeamMember[] = [];

    // Validate headers
    const requiredHeaders = ['Email', 'First Name', 'Last Name', 'Role'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        totalRows: dataRows.length,
        successfulImports: 0,
        failedImports: dataRows.length,
        errors: [{
          row: 0,
          field: 'headers',
          value: missingHeaders.join(', '),
          error: `Missing required headers: ${missingHeaders.join(', ')}`
        }],
        importedMembers: []
      };
    }

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowData = this.parseCSVLine(row);
      
      if (onProgress) {
        onProgress(Math.round(((i + 1) / dataRows.length) * 100));
      }

      try {
        const member = this.validateAndCreateTeamMember(rowData, headers, organizationId, i + 2);
        if (member) {
          importedMembers.push(member);
        }
      } catch (error) {
        errors.push({
          row: i + 2,
          field: 'general',
          value: row,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: errors.length === 0,
      totalRows: dataRows.length,
      successfulImports: importedMembers.length,
      failedImports: errors.length,
      errors,
      importedMembers
    };
  }

  /**
   * Parse a CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Validate and create team member from CSV row data
   */
  private validateAndCreateTeamMember(
    rowData: string[],
    headers: string[],
    organizationId: string,
    rowNumber: number
  ): StreamlinedTeamMember | null {
    const errors: CSVImportError[] = [];
    
    // Create field mapping
    const fieldMap: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      fieldMap[header.toLowerCase()] = rowData[index] || '';
    });

    // Validate required fields
    const email = fieldMap['email']?.trim();
    const firstName = fieldMap['first name']?.trim();
    const lastName = fieldMap['last name']?.trim();
    const role = fieldMap['role']?.trim();

    if (!email) {
      errors.push({ row: rowNumber, field: 'email', value: '', error: 'Email is required' });
    } else if (!this.isValidEmail(email)) {
      errors.push({ row: rowNumber, field: 'email', value: email, error: 'Invalid email format' });
    }

    if (!firstName) {
      errors.push({ row: rowNumber, field: 'first name', value: '', error: 'First name is required' });
    }

    if (!lastName) {
      errors.push({ row: rowNumber, field: 'last name', value: '', error: 'Last name is required' });
    }

    if (!role) {
      errors.push({ row: rowNumber, field: 'role', value: '', error: 'Role is required' });
    } else if (!['admin', 'member', 'viewer', 'owner'].includes(role.toLowerCase())) {
      errors.push({ row: rowNumber, field: 'role', value: role, error: 'Invalid role. Must be admin, member, viewer, or owner' });
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.map(e => e.error).join(', ')}`);
    }

    // Create team member object
    const teamMember: StreamlinedTeamMember = {
      id: '', // Will be generated by the service
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: role.toLowerCase() as 'admin' | 'member' | 'viewer' | 'owner',
      status: 'pending',
      organization: {
        id: organizationId,
        name: '',
        tier: 'BASIC'
      },
      organizationId,
      department: fieldMap['department']?.trim() || '',
      position: fieldMap['position']?.trim() || '',
      phone: fieldMap['phone']?.trim() || '',
      licenseType: fieldMap['license type']?.trim() || 'BASIC',
      assignedProjects: [],
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: fieldMap['last active'] ? new Date(fieldMap['last active']) : undefined
    };

    return teamMember;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Download CSV file
   */
  downloadCSV(csvContent: string, filename: string = 'team-members.csv'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate CSV template
   */
  generateTemplate(): string {
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'Role',
      'Status',
      'Department',
      'Position',
      'Phone',
      'License Type'
    ];

    const sampleData = [
      'john.doe@example.com',
      'John',
      'Doe',
      'member',
      'active',
      'Engineering',
      'Software Developer',
      '+1-555-0123',
      'PROFESSIONAL'
    ];

    return [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
  }
}

export const csvService = CSVService.getInstance();
