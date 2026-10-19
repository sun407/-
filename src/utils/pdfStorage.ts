/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { get, set } from 'idb-keyval';
import { PictureInterestPDF } from '../types';

const IDB_KEY = 'rehab_picture_interest_pdfs_v2';
const LS_KEY = 'rehab_picture_interest_pdfs';

export async function loadPictureInterestPdfs(): Promise<PictureInterestPDF[]> {
  try {
    // 1. Try to load from IndexedDB
    const fromIdb = await get<PictureInterestPDF[]>(IDB_KEY);
    if (fromIdb && Array.isArray(fromIdb) && fromIdb.length > 0) {
      return fromIdb;
    }

    // 2. Fallback to localStorage if migrating
    const fromLs = localStorage.getItem(LS_KEY);
    if (fromLs) {
      const parsed: PictureInterestPDF[] = JSON.parse(fromLs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Save to IndexedDB
        await set(IDB_KEY, parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load picture interest PDFs from storage:', error);
  }
  return [];
}

export async function savePictureInterestPdfs(list: PictureInterestPDF[]): Promise<void> {
  try {
    // Save full data to IndexedDB
    await set(IDB_KEY, list);

    // Also attempt localStorage with try/catch in case quota allows
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {
      // LocalStorage exceeded is expected for large PDFs, IndexedDB has already persisted it
      console.warn('LocalStorage limit exceeded; safely persisted in IndexedDB.');
    }
  } catch (error) {
    console.error('Failed to save picture interest PDFs to IndexedDB:', error);
  }
}

/**
 * Converts a Base64 data URL to a Blob
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Converts a Base64 data URL to a Uint8Array
 */
export function dataURLtoUint8Array(dataurl: string): Uint8Array {
  const arr = dataurl.split(',');
  const bstr = atob(arr[1] || arr[0]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr;
}
