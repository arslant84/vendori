// src/lib/database.ts
'use client';

import initSqlJs, { type Database, type SqlValue } from 'sql.js';
import type { VendorInputFields } from '@/components/vendor/vendor-processor';

let dbPromise: Promise<Database> | null = null;
const DB_FILE_PATH = '/vendors.db'; // Path to the physical database file

// Statically define VENDOR_COLUMNS based on the VendorInputFields interface
const VENDOR_COLUMNS: Array<keyof VendorInputFields> = [
  'vendorName',
  // 'vendorIndustry', // Removed
  // 'companySize', // Removed
  'tenderNumber',
  'tenderTitle',
  'dateOfFinancialEvaluation',
  'evaluationValidityDate',
  'evaluatorNameDepartment',
  'overallResult',
  'quantitativeScore',
  'quantitativeBand',
  'quantitativeRiskCategory',
  'altmanZScore',
  'altmanZBand',
  'altmanZRiskCategory',
  'qualitativeScore',
  'qualitativeBand',
  'qualitativeRiskCategory',
  'overallFinancialEvaluationResult',
  // 'keyInformation', // Removed
];

const initialize = async (): Promise<Database> => {
  try {
    const SQL = await initSqlJs({ locateFile: file => `/sql-wasm.wasm` });
    let db: Database;

    try {
      // Try to load existing database file
      const response = await fetch(DB_FILE_PATH);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        db = new SQL.Database(uint8Array);
      } else {
        // Create new database if file doesn't exist
        db = new SQL.Database();
        const columnDefinitions = VENDOR_COLUMNS.map(colName =>
          `${colName} TEXT${colName === 'vendorName' ? ' PRIMARY KEY' : ''}`
        ).join(', ');
        const createTableQuery = `CREATE TABLE IF NOT EXISTS vendors (${columnDefinitions});`;
        db.run(createTableQuery);
        await saveDatabase(db);
      }
    } catch (error) {
      console.error("Error loading database file:", error);
      // Create new database if loading fails
      db = new SQL.Database();
      const columnDefinitions = VENDOR_COLUMNS.map(colName =>
        `${colName} TEXT${colName === 'vendorName' ? ' PRIMARY KEY' : ''}`
      ).join(', ');
      const createTableQuery = `CREATE TABLE IF NOT EXISTS vendors (${columnDefinitions});`;
      db.run(createTableQuery);
      await saveDatabase(db);
    }

    return db;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw new Error("Failed to initialize database. Please ensure sql-wasm.wasm is properly loaded.");
  }
};

export const getDb = (): Promise<Database> => {
  if (!dbPromise) {
    dbPromise = initialize();
  }
  return dbPromise;
};

// Function to save database to file
const saveDatabase = async (db: Database): Promise<void> => {
  try {
    const dbArray = db.export();
    const blob = new Blob([dbArray], { type: 'application/x-sqlite3' });
    
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('database', blob, 'vendors.db');

    // Send the database file to the server
    const response = await fetch('/api/save-database', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to save database file');
    }
  } catch (error) {
    console.error('Error saving database:', error);
    throw new Error('Failed to save database file');
  }
};

export const convertResultsToObjects = (results: any[]): VendorInputFields[] => {
  if (!results || results.length === 0 || !results[0].values || results[0].values.length === 0) return [];
  return results[0].values.map((row: any[]) => {
    const obj: any = {};
    results[0].columns.forEach((col: string, index: number) => {
      obj[col] = row[index];
    });
    return obj as VendorInputFields;
  });
};

export const getAllVendorsDb = async (): Promise<VendorInputFields[]> => {
  const db = await getDb();
  const results = db.exec("SELECT * FROM vendors ORDER BY vendorName ASC");
  return convertResultsToObjects(results);
};

export const saveVendorDb = async (vendorData: VendorInputFields): Promise<void> => {
  const db = await getDb();
  const existingVendor = db.exec("SELECT vendorName FROM vendors WHERE vendorName = ?", [vendorData.vendorName]);

  const columns = VENDOR_COLUMNS.join(', ');
  const placeholders = VENDOR_COLUMNS.map(col => `$${col}`).join(', ');
  const params: { [key: string]: SqlValue } = {};
  VENDOR_COLUMNS.forEach(col => {
    params[`$${col}`] = vendorData[col] !== undefined && vendorData[col] !== null ? String(vendorData[col]) : null;
  });

  if (existingVendor.length > 0 && existingVendor[0].values && existingVendor[0].values.length > 0) {
    const setClauses = VENDOR_COLUMNS.filter(col => col !== 'vendorName').map(col => `${col} = $${col}`).join(', ');
    const stmt = db.prepare(`UPDATE vendors SET ${setClauses} WHERE vendorName = $vendorName`);
    stmt.run(params);
    stmt.free();
  } else {
    const stmt = db.prepare(`INSERT INTO vendors (${columns}) VALUES (${placeholders})`);
    stmt.run(params);
    stmt.free();
  }
  
  // Save the database to file after modifications
  await saveDatabase(db);
};

export const removeVendorDb = async (vendorName: string): Promise<void> => {
  const db = await getDb();
  db.run("DELETE FROM vendors WHERE vendorName = ?", [vendorName]);
  
  // Save the database to file after modifications
  await saveDatabase(db);
};

