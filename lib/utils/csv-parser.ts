export interface CSVParseResult<T> {
  data: T[];
  errors: Array<{ row: number; field: string; message: string }>;
  totalRows: number;
  validRows: number;
}

export interface TeamMemberCSVRow {
  email: string;
  name: string;
  role: 'sales_staff' | 'center_staff' | 'center_manager';
}

export interface ClientCSVRow {
  email: string;
  name: string;
  phone?: string;
}

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

export function parseTeamMemberCSV(csvText: string): CSVParseResult<TeamMemberCSVRow> {
  const rows = parseCSV(csvText);
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const data: TeamMemberCSVRow[] = [];

  if (rows.length === 0) {
    return { data: [], errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }], totalRows: 0, validRows: 0 };
  }

  const header = rows[0].map(h => h.toLowerCase().trim());
  const requiredFields = ['email', 'name', 'role'];
  
  for (const field of requiredFields) {
    if (!header.includes(field)) {
      errors.push({ row: 0, field, message: `Missing required column: ${field}` });
    }
  }

  if (errors.length > 0) {
    return { data: [], errors, totalRows: rows.length, validRows: 0 };
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue;
    }

    const email = row[header.indexOf('email')]?.trim() || '';
    const name = row[header.indexOf('name')]?.trim() || '';
    const role = row[header.indexOf('role')]?.trim().toLowerCase() || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push({ row: i + 1, field: 'email', message: 'Invalid or missing email' });
      continue;
    }

    if (!name || name.length < 2) {
      errors.push({ row: i + 1, field: 'name', message: 'Name must be at least 2 characters' });
      continue;
    }

    const validRoles = ['sales_staff', 'center_staff', 'center_manager'];
    if (!validRoles.includes(role)) {
      errors.push({ 
        row: i + 1, 
        field: 'role', 
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
      continue;
    }

    data.push({
      email: email.toLowerCase(),
      name,
      role: role as TeamMemberCSVRow['role'],
    });
  }

  return {
    data,
    errors,
    totalRows: rows.length - 1,
    validRows: data.length,
  };
}

export function parseClientCSV(csvText: string): CSVParseResult<ClientCSVRow> {
  const rows = parseCSV(csvText);
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const data: ClientCSVRow[] = [];

  if (rows.length === 0) {
    return { data: [], errors: [{ row: 0, field: 'file', message: 'CSV file is empty' }], totalRows: 0, validRows: 0 };
  }

  const header = rows[0].map(h => h.toLowerCase().trim());
  const requiredFields = ['email', 'name'];
  
  for (const field of requiredFields) {
    if (!header.includes(field)) {
      errors.push({ row: 0, field, message: `Missing required column: ${field}` });
    }
  }

  if (errors.length > 0) {
    return { data: [], errors, totalRows: rows.length, validRows: 0 };
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue;
    }

    const email = row[header.indexOf('email')]?.trim() || '';
    const name = row[header.indexOf('name')]?.trim() || '';
    const phone = row[header.indexOf('phone')]?.trim() || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push({ row: i + 1, field: 'email', message: 'Invalid or missing email' });
      continue;
    }

    if (!name || name.length < 2) {
      errors.push({ row: i + 1, field: 'name', message: 'Name must be at least 2 characters' });
      continue;
    }

    data.push({
      email: email.toLowerCase(),
      name,
      phone: phone || undefined,
    });
  }

  return {
    data,
    errors,
    totalRows: rows.length - 1,
    validRows: data.length,
  };
}

export function generateCSVTemplate(type: 'team' | 'client'): string {
  if (type === 'team') {
    return 'email,name,role\nexample@center.com,John Doe,sales_staff\n';
  } else {
    return 'email,name,phone\nclient@example.com,Jane Smith,0812345678\n';
  }
}
