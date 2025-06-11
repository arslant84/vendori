// src/lib/database.ts
'use client';

import initSqlJs, { type Database, type SqlValue } from 'sql.js';
import type { VendorInputFields } from '@/components/vendor/vendor-processor';
import { initialInputState } from '@/components/vendor/vendor-processor';


let dbPromise: Promise<Database> | null = null;
const DB_STORAGE_KEY = 'vendorSqliteDatabase'; // New key for SQLite data

const VENDOR_COLUMNS = Object.keys(initialInputState) as Array<keyof VendorInputFields>;

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
      persistDb(db); // Persist empty table structure
    }
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Attempt to clear potentially corrupted DB and re-initialize
    localStorage.removeItem(DB_STORAGE_KEY);
    if (error instanceof Error && error.message.includes("No such file or directory") && error.message.includes("sql-wasm.wasm")) {
        alert("Critical Error: sql-wasm.wasm not found. Please ensure it's in the public folder. The app may not function correctly.");
    } else {
        alert("Database initialization failed. Data might be lost or inaccessible. Attempting to reset. Error: " + (error instanceof Error ? error.message : String(error)));
    }
    // Fallback: re-throw or return a dummy DB to prevent app crash
    throw new Error("Database initialization failed critically.");
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
    params[`$${col}`] = vendorData[col] !== undefined ? String(vendorData[col]) : null;
  });
  
  if (existingVendor.length > 0 && existingVendor[0].values && existingVendor[0].values.length > 0) {
    // Update
    const setClauses = VENDOR_COLUMNS.filter(col => col !== 'vendorName').map(col => `${col} = $${col}`).join(', ');
    const stmt = db.prepare(`UPDATE vendors SET ${setClauses} WHERE vendorName = $vendorName`);
    stmt.run(params);
    stmt.free();
  } else {
    // Insert
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
