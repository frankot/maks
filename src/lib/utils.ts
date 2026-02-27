export function formatPriceInPLN(priceInGrosz: number): string {
  return (priceInGrosz / 100).toFixed(2)
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
