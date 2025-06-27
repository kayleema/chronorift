import { describe, it, expect } from 'vitest'
import { convertDaysToRanges, convertRangesToDays, dateToLocalString } from './vacation'

describe('Vacation Utilities', () => {
  describe('dateToLocalString', () => {
    it('converts date to local string format', () => {
      const date = new Date(2024, 6, 15) // July 15, 2024 (month is 0-indexed)
      const result = dateToLocalString(date)
      expect(result).toBe('2024-07-15')
    })

    it('handles single digit months and days', () => {
      const date = new Date(2024, 0, 5) // January 5, 2024
      const result = dateToLocalString(date)
      expect(result).toBe('2024-01-05')
    })
  })

  describe('convertDaysToRanges', () => {
    it('converts single day to single-day range', () => {
      const vacationDays = new Set(['2024-07-15'])
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([
        { startDate: '2024-07-15', endDate: '2024-07-15' }
      ])
    })

    it('converts consecutive days to single range', () => {
      const vacationDays = new Set(['2024-07-15', '2024-07-16', '2024-07-17'])
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([
        { startDate: '2024-07-15', endDate: '2024-07-17' }
      ])
    })

    it('converts non-consecutive days to multiple ranges', () => {
      const vacationDays = new Set(['2024-07-15', '2024-07-16', '2024-07-20', '2024-07-25'])
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([
        { startDate: '2024-07-15', endDate: '2024-07-16' },
        { startDate: '2024-07-20', endDate: '2024-07-20' },
        { startDate: '2024-07-25', endDate: '2024-07-25' }
      ])
    })

    it('handles unordered input dates', () => {
      const vacationDays = new Set(['2024-07-17', '2024-07-15', '2024-07-16'])
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([
        { startDate: '2024-07-15', endDate: '2024-07-17' }
      ])
    })

    it('returns empty array for empty input', () => {
      const vacationDays = new Set<string>()
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([])
    })

    it('handles complex pattern with multiple gaps', () => {
      const vacationDays = new Set([
        '2024-07-01', '2024-07-02', '2024-07-03', // First range
        '2024-07-10',                           // Single day
        '2024-07-15', '2024-07-16',            // Second range
        '2024-07-25', '2024-07-26', '2024-07-27', '2024-07-28' // Third range
      ])
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([
        { startDate: '2024-07-01', endDate: '2024-07-03' },
        { startDate: '2024-07-10', endDate: '2024-07-10' },
        { startDate: '2024-07-15', endDate: '2024-07-16' },
        { startDate: '2024-07-25', endDate: '2024-07-28' }
      ])
    })

    it('handles dates across month boundaries', () => {
      const vacationDays = new Set(['2024-07-30', '2024-07-31', '2024-08-01', '2024-08-02'])
      const result = convertDaysToRanges(vacationDays)
      
      expect(result).toEqual([
        { startDate: '2024-07-30', endDate: '2024-08-02' }
      ])
    })
  })

  describe('convertRangesToDays', () => {
    it('converts single-day range to single day', () => {
      const ranges = [{ startDate: '2024-07-15', endDate: '2024-07-15' }]
      const result = convertRangesToDays(ranges)
      
      expect(result).toEqual(new Set(['2024-07-15']))
    })

    it('converts multi-day range to individual days', () => {
      const ranges = [{ startDate: '2024-07-15', endDate: '2024-07-17' }]
      const result = convertRangesToDays(ranges)
      
      expect(result).toEqual(new Set(['2024-07-15', '2024-07-16', '2024-07-17']))
    })

    it('converts multiple ranges to combined set of days', () => {
      const ranges = [
        { startDate: '2024-07-15', endDate: '2024-07-16' },
        { startDate: '2024-07-20', endDate: '2024-07-20' },
        { startDate: '2024-07-25', endDate: '2024-07-27' }
      ]
      const result = convertRangesToDays(ranges)
      
      expect(result).toEqual(new Set([
        '2024-07-15', '2024-07-16', 
        '2024-07-20', 
        '2024-07-25', '2024-07-26', '2024-07-27'
      ]))
    })

    it('returns empty set for empty input', () => {
      const ranges: any[] = []
      const result = convertRangesToDays(ranges)
      
      expect(result).toEqual(new Set())
    })
  })

  describe('round-trip conversion', () => {
    it('maintains data integrity through round-trip conversion', () => {
      const originalDays = new Set([
        '2024-07-01', '2024-07-02', '2024-07-03',
        '2024-07-10',
        '2024-07-15', '2024-07-16'
      ])
      
      const ranges = convertDaysToRanges(originalDays)
      const convertedBack = convertRangesToDays(ranges)
      
      expect(convertedBack).toEqual(originalDays)
    })
  })
})