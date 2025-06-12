
// src/lib/database.ts
'use client';

import initSqlJs, { type Database, type SqlValue } from 'sql.js';
import type { VendorInputFields } from '@/components/vendor/vendor-processor';

let dbPromise: Promise<Database> | null = null;
const DB_STORAGE_KEY = 'vendorSqliteDatabase';

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
    const storedDbRaw = localStorage.getItem(DB_STORAGE_KEY);
    let db: Database;

    if (storedDbRaw) {
      const dbArray = Uint8Array.from(JSON.parse(storedDbRaw));
      db = new SQL.Database(dbArray);
    } else {
      db = new SQL.Database();
      const columnDefinitions = VENDOR_COLUMNS.map(colName =>
        `${colName} TEXT${colName === 'vendorName' ? ' PRIMARY KEY' : ''}`
      ).join(', ');
      const createTableQuery = `CREATE TABLE IF NOT EXISTS vendors (${columnDefinitions});`;
      db.run(createTableQuery);
      persistDb(db);
    }
    return db;
  } catch (error) {
    console.error("Database initialization encountered an error:", error); // Log the raw error

    let specificMessage = "A critical error occurred during database initialization.";
    if (error instanceof Error) {
      const lowerCaseErrorMessage = error.message.toLowerCase();
      // More robust check for WASM loading issues
      if (
        lowerCaseErrorMessage.includes("failed to execute 'compile' on 'webassembly'") ||
        lowerCaseErrorMessage.includes("http status code is not ok") ||
        lowerCaseErrorMessage.includes("networkerror when attempting to fetch resource") || // Firefox
        lowerCaseErrorMessage.includes("failed to fetch") || // Generic fetch failure
        lowerCaseErrorMessage.includes("both async and sync fetching of the wasm failed") ||
        lowerCaseErrorMessage.includes("could not load sql-wasm.wasm") // A general check
      ) {
        specificMessage = "CRITICAL DATABASE ERROR: Could not load 'sql-wasm.wasm'. " +
                          "This file is essential for database operations. " +
                          "Please ensure 'sql-wasm.wasm' (copied from 'node_modules/sql.js/dist/sql-wasm.wasm') " +
                          "is placed in the 'public' directory of your Next.js project. " +
                          "The application expects to fetch it from the URL '/sql-wasm.wasm'. " +
                          "Verify the file exists at 'public/sql-wasm.wasm' and the server can access it.";
        console.error(specificMessage); // Log the detailed guidance
      } else {
        specificMessage = `Database initialization failed. Data might be lost or inaccessible. Error: ${error.message}`;
        console.error(specificMessage);
      }
    } else {
      // Handle cases where the error is not an Error instance
      specificMessage = `An unknown error occurred during database initialization: ${String(error)}`;
      console.error(specificMessage);
    }
    // Attempt to clear potentially corrupted DB from localStorage to allow a fresh start on next attempt
    localStorage.removeItem(DB_STORAGE_KEY);
    console.warn(`Attempted to clear potentially corrupted database from localStorage ('${DB_STORAGE_KEY}'). Please refresh the page after ensuring sql-wasm.wasm is correctly placed.`);

    throw new Error(specificMessage); // Re-throw with a more informative message
  }
};

export const getDb = (): Promise<Database> => {
  if (!dbPromise) {
    dbPromise = initialize();
  }
  return dbPromise;
};

export const persistDb = (db: Database) => {
  const dbArray = db.export();
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(Array.from(dbArray)));
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
  persistDb(db);
};

export const removeVendorDb = async (vendorName: string): Promise<void> => {
  const db = await getDb();
  db.run("DELETE FROM vendors WHERE vendorName = ?", [vendorName]);
  persistDb(db);
};

