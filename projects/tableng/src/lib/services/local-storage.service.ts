import { Injectable } from '@angular/core';
import { TableConfig } from '../interfaces/table-config.interface';

/**
 * Interface representing the complete state of a table that can be persisted
 */
export interface TableState {
  config: TableConfig;
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  sortState?: { column: string; direction: 'asc' | 'desc' } | null;
  filterState?: Record<string, string>;
  scrollPosition?: { x: number; y: number };
  [key: string]: unknown; // Allow for additional custom state
}

/**
 * Service for persisting table state to localStorage
 * Handles saving/loading column arrangements, filters, sorting, and other table configurations
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly storagePrefix = 'tableng_';

  /**
   * Save complete table state to localStorage
   * @param tableId Unique identifier for the table
   * @param state Complete table state to persist
   */
  saveTableState(tableId: string, state: Partial<TableState>): void {
    try {
      const key = this.getStorageKey(tableId);
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);
    } catch (error) {
      // Silently handle storage errors (quota exceeded, etc.)
      console.warn('Failed to save table state:', error);
    }
  }

  /**
   * Load table state from localStorage
   * @param tableId Unique identifier for the table
   * @returns Parsed table state or null if not found or corrupted
   */
  loadTableState(tableId: string): TableState | null {
    try {
      const key = this.getStorageKey(tableId);
      const serializedState = localStorage.getItem(key);

      if (!serializedState) {
        return null;
      }

      return JSON.parse(serializedState) as TableState;
    } catch {
      // Return null for corrupted data
      return null;
    }
  }

  /**
   * Remove table state from localStorage
   * @param tableId Unique identifier for the table
   */
  removeTableState(tableId: string): void {
    const key = this.getStorageKey(tableId);
    localStorage.removeItem(key);
  }

  /**
   * Clear all table states while preserving other localStorage items
   */
  clearAllTableStates(): void {
    const keysToRemove: string[] = [];

    // Collect all tableng keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Get list of all stored table IDs
   * @returns Array of table IDs that have stored state
   */
  getAllTableIds(): string[] {
    const tableIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        const tableId = key.substring(this.storagePrefix.length);
        tableIds.push(tableId);
      }
    }

    return tableIds;
  }

  /**
   * Check if table state exists in localStorage
   * @param tableId Unique identifier for the table
   * @returns True if state exists, false otherwise
   */
  hasTableState(tableId: string): boolean {
    const key = this.getStorageKey(tableId);
    return localStorage.getItem(key) !== null;
  }

  /**
   * Calculate approximate storage size used by table states
   * @returns Size in bytes (approximate)
   */
  getStorageSize(): number {
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          // Approximate size: key length + value length
          totalSize += key.length + value.length;
        }
      }
    }

    return totalSize;
  }

  /**
   * Export all table states as JSON object
   * @returns Object containing all table states keyed by table ID
   */
  exportTableStates(): Record<string, TableState> {
    const states: Record<string, TableState> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storagePrefix)) {
        const tableId = key.substring(this.storagePrefix.length);
        const state = this.loadTableState(tableId);
        if (state) {
          states[tableId] = state;
        }
      }
    }

    return states;
  }

  /**
   * Import table states from JSON object
   * @param states Object containing table states keyed by table ID
   */
  importTableStates(states: Record<string, TableState>): void {
    try {
      Object.entries(states).forEach(([tableId, state]) => {
        this.saveTableState(tableId, state);
      });
    } catch (error) {
      console.warn('Failed to import table states:', error);
    }
  }

  /**
   * Generate storage key for table ID
   * @param tableId Unique identifier for the table
   * @returns Full localStorage key
   */
  private getStorageKey(tableId: string): string {
    return `${this.storagePrefix}${tableId}`;
  }
}
