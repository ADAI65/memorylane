// @memorylane/api - Certificate PDF Generator
// Supports: certificate (archival certificate generation)
import type { AIProvider, AIRequest, AIPrediction, AIPredictionStatusResponse, AIResult } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import PDFDocument from 'pdfkit';

export class CertificateProvider implements AIProvider {
  readonly name = 'certificate';

  readonly supportedServices: ServiceType[] = [
    ServiceType.CERTIFICATE,
  ];

  constructor() {
    // No API key needed — pure local PDF generation
  }

  async createPrediction(request: AIRequest): Promise<AIPrediction> {
    const result = await this.generateCertificate(request);

    return {
      id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      progress: 100,
      outputs: result,
      metrics: {
        processingTimeMs: 0,
        computeUnits: 0,
      },
    } as AIPrediction & AIResult;
  }

  async getPredictionStatus(predictionId: string): Promise<AIPredictionStatusResponse> {
    return {
      id: predictionId,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      progress: 100,
    };
  }

  async getPredictionResult(predictionId: string): Promise<AIResult> {
    return {
      id: predictionId,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      outputs: {
        textResult: 'Certificate generated successfully',
      },
    };
  }

  async cancelPrediction(_predictionId: string): Promise<void> {
    // Synchronous — nothing to cancel
  }

  /**
   * Generate a professional archival certificate as PDF buffer
   */
  private async generateCertificate(request: AIRequest): Promise<AIResult['outputs']> {
    const params = request.input.params || {};

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        info: {
          Title: 'Archival Certificate of Authenticity',
          Author: 'MemoryLane AI',
          Subject: 'Photo Restoration Certificate',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBytes = Buffer.concat(buffers);
        resolve({
          pdfBytes: new Uint8Array(pdfBytes),
          textResult: `Certificate #${params.certificateNumber || 'ML-' + Date.now()}`,
        });
      });
      doc.on('error', reject);

      const pageWidth = doc.page.width - 80; // margins

      // ── Outer border ──
      doc
        .lineWidth(3)
        .strokeColor('#1a1a2e')
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke();

      // ── Inner decorative border ──
      doc
        .lineWidth(1)
        .strokeColor('#c9a84c')
        .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
        .stroke();

      // ── Corner ornaments ──
      const ornamentSize = 30;
      const corners = [
        { x: 35, y: 35 },
        { x: doc.page.width - 35, y: 35 },
        { x: 35, y: doc.page.height - 35 },
        { x: doc.page.width - 35, y: doc.page.height - 35 },
      ];

      for (const corner of corners) {
        doc
          .lineWidth(2)
          .strokeColor('#c9a84c')
          .moveTo(corner.x, corner.y)
          .lineTo(corner.x + ornamentSize * (corner.x < doc.page.width / 2 ? 1 : -1), corner.y)
          .moveTo(corner.x, corner.y)
          .lineTo(corner.x, corner.y + ornamentSize * (corner.y < doc.page.height / 2 ? 1 : -1))
          .stroke();
      }

      // ── Header ──
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#c9a84c')
        .text('MEMORYLANE AI', 0, 50, { align: 'center' });

      doc.moveDown(0.3);

      doc
        .lineWidth(0.5)
        .strokeColor('#c9a84c')
        .moveTo(pageWidth / 2 - 60, doc.y)
        .lineTo(pageWidth / 2 + 60, doc.y)
        .stroke();

      doc.moveDown(0.8);

      // ── Title ──
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#1a1a2e')
        .text('Certificate of Authenticity', 0, doc.y, { align: 'center' });

      doc.moveDown(0.3);

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#666666')
        .text('Archival Photo Restoration & Preservation', 0, doc.y, { align: 'center' });

      doc.moveDown(1.5);

      // ── Certificate body ──
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#333333')
        .text(
          'This certifies that the accompanying photograph has been professionally restored and enhanced using advanced AI technology by MemoryLane AI.',
          80, doc.y,
          { width: doc.page.width - 160, align: 'center' },
        );

      doc.moveDown(1);

      // ── Service details table ──
      const tableX = 80;
      const tableWidth = doc.page.width - 160;
      let tableY = doc.y;

      const details = [
        { label: 'Certificate No.', value: params.certificateNumber || `ML-${Date.now()}` },
        { label: 'Date Issued', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
        { label: 'Service Performed', value: params.serviceType || 'Photo Restoration' },
        { label: 'AI Model', value: params.aiModel || 'GFPGAN v1.3' },
        { label: 'Original Condition', value: params.originalCondition || 'Vintage photograph — deteriorated' },
        { label: 'Resolution', value: params.resolution || 'Enhanced to 4K (3840 x 2160)' },
      ];

      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1a1a2e');

      for (const detail of details) {
        // Label
        doc.text(detail.label, tableX, tableY, { continued: true, width: tableWidth * 0.35 });
        doc.font('Helvetica').fillColor('#555555');
        doc.text(`:  ${detail.value}`);
        tableY = doc.y + 4;
        doc.font('Helvetica-Bold').fillColor('#1a1a2e');
      }

      doc.moveDown(1.5);

      // ── Disclaimer ──
      doc
        .font('Helvetica-Oblique')
        .fontSize(8)
        .fillColor('#888888')
        .text(
          'This certificate verifies that the digital restoration process has been performed using state-of-the-art AI models. ' +
          'The restoration enhances visual quality while preserving the historical integrity of the original photograph. ' +
          'This certificate is digitally generated and is valid for the referenced restoration job only.',
          80, doc.y,
          { width: doc.page.width - 160, align: 'center' },
        );

      doc.moveDown(1.5);

      // ── Footer with signatures ──
      const footerY = doc.page.height - 80;

      // Left signature
      doc
        .lineWidth(0.5)
        .strokeColor('#1a1a2e')
        .moveTo(100, footerY)
        .lineTo(250, footerY)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#333333')
        .text('MemoryLane AI System', 100, footerY + 5, { width: 150, align: 'center' });

      // Right signature
      doc
        .lineWidth(0.5)
        .strokeColor('#1a1a2e')
        .moveTo(doc.page.width - 250, footerY)
        .lineTo(doc.page.width - 100, footerY)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#333333')
        .text('Date of Issue', doc.page.width - 250, footerY + 5, { width: 150, align: 'center' });

      // ── Bottom text ──
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#aaaaaa')
        .text(
          `Generated on ${new Date().toISOString()} | MemoryLane AI — Preserving Memories, Restoring History`,
          0, doc.page.height - 30,
          { align: 'center' },
        );

      doc.end();
    });
  }
}
