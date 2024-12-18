import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Filters an array of objects based on a list of IDs.
 *
 * @param data - Array of objects to filter.
 * @param ids - Array of IDs to match.
 * @param idKey - Key of the object that contains the ID.
 * @returns Array of objects with matching IDs.
 */
export function getObjectsByIds<T, K extends keyof T>(
  data: T[],
  ids: (string | number)[],
  idKey: K
): T[] {
  const idSet = new Set(ids);
  return data.filter((item) => idSet.has(item[idKey] as string | number));
}

export function toHashtagStyle(str: string): string {
  return `#${str.replace(/\s+/g, '&').toLowerCase()}`;
}
