/**
 * Unit Tests for ExtractionTracker
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExtractionTracker } from '@modules/extraction/ExtractionTracker';

describe('ExtractionTracker', () => {
  let tracker: ExtractionTracker;

  beforeEach(() => {
    localStorage.clear();
    tracker = ExtractionTracker.getInstance();
    tracker.clearAll();
  });

  it('should add extraction successfully', () => {
    const data = {
      fieldName: 'citation',
      text: 'Test citation text',
      page: 1,
      coordinates: { x: 10, y: 20, width: 100, height: 50 },
      method: 'manual' as const,
      documentName: 'test.pdf'
    };

    const extraction = tracker.addExtraction(data);

    expect(extraction).toBeTruthy();
    expect(extraction?.fieldName).toBe('citation');
    expect(extraction?.text).toBe('Test citation text');
    expect(extraction?.id).toMatch(/^ext_/);
  });

  it('should sanitize extraction text', () => {
    const data = {
      fieldName: 'test',
      text: '<script>alert("xss")</script>Clean text',
      page: 1,
      coordinates: { x: 10, y: 20, width: 100, height: 50 },
      method: 'manual' as const,
      documentName: 'test.pdf'
    };

    const extraction = tracker.addExtraction(data);

    expect(extraction?.text).not.toContain('<script>');
  });

  it('should reject invalid extractions', () => {
    const invalidData = {
      fieldName: 'test',
      text: 'text',
      page: -1, // Invalid page
      coordinates: { x: 10, y: 20, width: 100, height: 50 },
      method: 'manual' as const,
      documentName: 'test.pdf'
    };

    const extraction = tracker.addExtraction(invalidData);

    expect(extraction).toBeNull();
  });

  it('should persist to localStorage', () => {
    const data = {
      fieldName: 'test',
      text: 'test text',
      page: 1,
      coordinates: { x: 10, y: 20, width: 100, height: 50 },
      method: 'manual' as const,
      documentName: 'test.pdf'
    };

    tracker.addExtraction(data);

    const stored = localStorage.getItem('clinical_extractions_secure');
    expect(stored).toBeTruthy();
  });

  it('should load from localStorage', () => {
    // Add extraction
    const data = {
      fieldName: 'citation',
      text: 'Persisted text',
      page: 1,
      coordinates: { x: 10, y: 20, width: 100, height: 50 },
      method: 'manual' as const,
      documentName: 'test.pdf'
    };

    tracker.addExtraction(data);

    // Create new instance (simulates page reload)
    const newTracker = ExtractionTracker.getInstance();
    const extractions = newTracker.getExtractions();

    expect(extractions.length).toBeGreaterThan(0);
    expect(extractions[0].text).toBe('Persisted text');
  });

  it('should clear all extractions', () => {
    tracker.addExtraction({
      fieldName: 'test',
      text: 'text',
      page: 1,
      coordinates: { x: 10, y: 20, width: 100, height: 50 },
      method: 'manual' as const,
      documentName: 'test.pdf'
    });

    tracker.clearAll();

    expect(tracker.getExtractions()).toHaveLength(0);
    expect(localStorage.getItem('clinical_extractions_secure')).toBeNull();
  });
});
