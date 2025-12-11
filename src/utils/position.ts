// utils/position.ts
import type { Position } from "../types/types";

/**
 * Check if two positions are equal
 */
export const positionEquals = (a: Position, b: Position): boolean =>
  a.x === b.x && a.y === b.y;

/**
 * Remove an item at a specific position from an array
 */
export const removeAtPosition = <T extends Position>(
  items: T[],
  pos: Position
): T[] => items.filter((item) => !positionEquals(item, pos));

/**
 * Find an item at a specific position in an array
 */
export const findAtPosition = <T extends Position>(
  items: T[],
  pos: Position
): T | undefined => items.find((item) => positionEquals(item, pos));

/**
 * Check if a position exists in an array
 */
export const hasPosition = <T extends Position>(
  items: T[],
  pos: Position
): boolean => items.some((item) => positionEquals(item, pos));
