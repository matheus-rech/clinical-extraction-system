/**
 * Text Selection Module
 * Handles interactive text selection from PDF
 */

import AppStateManager from '@core/AppState';
import { SecurityUtils } from '@core/SecurityUtils';
import { StatusManager } from '@modules/ui/StatusManager';
import { ExtractionTracker } from '@modules/extraction/ExtractionTracker';
import type { TextLayerItem } from '../../types/pdf.types';
import type { Coordinates } from '../../types/extraction.types';
import { MemoryManager } from '@core/MemoryManager';

export class TextSelection {
  private tracker: ExtractionTracker;
  private memoryManager: MemoryManager;

  constructor() {
    this.tracker = ExtractionTracker.getInstance();
    this.memoryManager = MemoryManager.getInstance();
  }

  enable(textLayer: HTMLDivElement, textItems: TextLayerItem[], pageNum: number): void {
    let isSelecting = false;
    let startItem: TextLayerItem | null = null;
    let selectedItems: TextLayerItem[] = [];

    const handleMouseDown = (e: MouseEvent) => {
      const state = AppStateManager.getState();
      
      if (!state.activeField) {
        StatusManager.show('Please select a form field first', 'warning');
        return;
      }

      isSelecting = true;
      startItem = textItems.find(item => item.element === e.target) || null;
      selectedItems = startItem ? [startItem] : [];

      textLayer.classList.add('active-selection');
      textLayer.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    };

    const handleMouseMove = (e: MouseEvent) => {
      const state = AppStateManager.getState();
      
      if (!isSelecting || !state.activeField || !startItem) return;

      const currentItem = textItems.find(item => item.element === e.target);
      if (currentItem) {
        const startIndex = textItems.indexOf(startItem);
        const endIndex = textItems.indexOf(currentItem);

        selectedItems = textItems.slice(
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex) + 1
        );

        textItems.forEach(item => item.element.classList.remove('highlight'));
        selectedItems.forEach(item => item.element.classList.add('highlight'));
      }
    };

    const handleMouseUp = () => {
      const state = AppStateManager.getState();
      
      if (!isSelecting || !state.activeField) return;

      isSelecting = false;
      textLayer.classList.remove('active-selection');

      if (selectedItems.length > 0) {
        const extractedText = selectedItems.map(item => item.text).join(' ').trim();
        const sanitizedText = SecurityUtils.sanitizeText(extractedText);
        const bounds = this.calculateBoundingBox(selectedItems);

        const extraction = this.tracker.addExtraction({
          fieldName: state.activeField,
          text: sanitizedText,
          page: pageNum,
          coordinates: bounds,
          method: 'manual',
          documentName: state.documentName
        });

        if (extraction && state.activeFieldElement) {
          const element = state.activeFieldElement as HTMLInputElement | HTMLTextAreaElement;
          
          if (element.type === 'number') {
            const match = sanitizedText.match(/-?\d+(\.\d+)?/);
            if (match) {
              element.value = match[0];
            }
          } else {
            element.value = sanitizedText;
          }
          element.classList.add('has-extraction');
        }

        selectedItems.forEach(item => {
          item.element.classList.remove('highlight');
          item.element.classList.add('extracted');
        });

        if (extraction) {
          this.addExtractionMarker(extraction);
          StatusManager.show(`Extracted to ${state.activeField}`, 'success');
          this.autoAdvanceField();
        }
      }
    };

    this.memoryManager.registerEventListener(textLayer, 'mousedown', handleMouseDown as EventListener);
    this.memoryManager.registerEventListener(textLayer, 'mousemove', handleMouseMove as EventListener);
    this.memoryManager.registerEventListener(textLayer, 'mouseup', handleMouseUp as EventListener);
  }

  private calculateBoundingBox(items: TextLayerItem[]): Coordinates {
    if (!items || items.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    items.forEach(item => {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    });

    return {
      x: Math.max(0, Math.round(minX)),
      y: Math.max(0, Math.round(minY)),
      width: Math.max(0, Math.round(maxX - minX)),
      height: Math.max(0, Math.round(maxY - minY))
    };
  }

  private addExtractionMarker(extraction: any): void {
    const pageDiv = document.querySelector('.pdf-page');
    if (!pageDiv) return;

    const marker = document.createElement('div');
    marker.className = 'extraction-marker';
    marker.dataset.extractionId = extraction.id;
    marker.dataset.field = extraction.fieldName;

    marker.style.left = extraction.coordinates.x + 'px';
    marker.style.top = extraction.coordinates.y + 'px';
    marker.style.width = extraction.coordinates.width + 'px';
    marker.style.height = extraction.coordinates.height + 'px';

    pageDiv.appendChild(marker);
  }

  private autoAdvanceField(): void {
    const currentStep = document.querySelector('.step.active');
    if (!currentStep) return;

    const state = AppStateManager.getState();
    const inputs = currentStep.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '.linked-input:not([disabled])'
    );
    const currentIndex = Array.from(inputs).indexOf(
      state.activeFieldElement as HTMLInputElement | HTMLTextAreaElement
    );

    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
  }
}
