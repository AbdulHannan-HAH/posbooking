import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Printer, Download, X, Waves } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface BookingDetails {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  passType: string;
  persons: number;
  amount: number;
  paymentStatus: 'paid' | 'pending';
}

interface InvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingDetails;
}

export function InvoiceDialog({ open, onClose, booking }: InvoiceDialogProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${booking.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 40px;
              color: #1a1a1a;
            }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #0ea5e9;
            }
            .logo { 
              display: flex; 
              align-items: center; 
              gap: 12px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background: linear-gradient(135deg, #0ea5e9, #0284c7);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: 700;
              color: #0ea5e9;
            }
            .invoice-title { text-align: right; }
            .invoice-title h2 { 
              font-size: 32px; 
              color: #0ea5e9;
              margin-bottom: 8px;
            }
            .invoice-id { 
              font-size: 14px; 
              color: #666;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .detail-section h3 {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #666;
              margin-bottom: 12px;
            }
            .detail-section p {
              font-size: 14px;
              line-height: 1.8;
            }
            .detail-section .name {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table th {
              background: #f8fafc;
              padding: 14px 16px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #666;
              border-bottom: 2px solid #e2e8f0;
            }
            .items-table td {
              padding: 16px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            .items-table .amount { text-align: right; }
            .totals {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 40px;
            }
            .totals-box {
              width: 280px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
            }
            .totals-row.total {
              border-top: 2px solid #0ea5e9;
              margin-top: 8px;
              padding-top: 16px;
              font-size: 20px;
              font-weight: 700;
              color: #0ea5e9;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-paid {
              background: #dcfce7;
              color: #166534;
            }
            .status-pending {
              background: #fef3c7;
              color: #92400e;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              border-top: 1px solid #e2e8f0;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">🏊</div>
                <div>
                  <div class="company-name">POOL Management</div>
                  <div style="font-size: 12px; color: #666;">Premium Pool Services</div>
                </div>
              </div>
              <div class="invoice-title">
                <h2>INVOICE</h2>
                <div class="invoice-id">${booking.id}</div>
                <div style="margin-top: 8px;">
                  <span class="status-badge status-${booking.paymentStatus}">
                    ${booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div class="details-grid">
              <div class="detail-section">
                <h3>Bill To</h3>
                <p class="name">${booking.customerName}</p>
                <p>${booking.email}</p>
                <p>${booking.phone}</p>
              </div>
              <div class="detail-section" style="text-align: right;">
                <h3>Booking Details</h3>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.timeSlot}</p>
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${booking.passType}</strong>
                    <div style="color: #666; font-size: 12px;">Pool Access - ${booking.timeSlot}</div>
                  </td>
                  <td>${booking.persons} person(s)</td>
                  <td>$${(booking.amount / booking.persons).toFixed(2)}</td>
                  <td class="amount">$${booking.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-box">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <span>$${booking.amount.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div class="totals-row total">
                  <span>Total</span>
                  <span>$${booking.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for choosing POOL Management!</p>
              <p style="margin-top: 8px;">For questions, contact us at support@poolmanagement.com</p>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    // In production, this would generate a proper PDF
    handlePrint();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Invoice</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={invoiceRef} className="bg-background p-6 rounded-lg border">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-pool flex items-center justify-center">
                <Waves className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-pool">POOL Management</h2>
                <p className="text-sm text-muted-foreground">Premium Pool Services</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-pool">INVOICE</h3>
              <p className="text-sm text-muted-foreground">{booking.id}</p>
              <div className="mt-2">
                <StatusBadge status={booking.paymentStatus} />
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Customer & Booking Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Bill To</h4>
              <p className="font-semibold">{booking.customerName}</p>
              <p className="text-sm text-muted-foreground">{booking.email}</p>
              <p className="text-sm text-muted-foreground">{booking.phone}</p>
            </div>
            <div className="text-right">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Booking Details</h4>
              <p className="text-sm"><span className="text-muted-foreground">Date:</span> {booking.date}</p>
              <p className="text-sm"><span className="text-muted-foreground">Time:</span> {booking.timeSlot}</p>
              <p className="text-sm"><span className="text-muted-foreground">Generated:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground">Qty</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground">Rate</th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-4 px-4">
                    <p className="font-medium">{booking.passType}</p>
                    <p className="text-sm text-muted-foreground">Pool Access - {booking.timeSlot}</p>
                  </td>
                  <td className="py-4 px-4">{booking.persons}</td>
                  <td className="py-4 px-4">${(booking.amount / booking.persons).toFixed(2)}</td>
                  <td className="py-4 px-4 text-right font-medium">${booking.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${booking.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-pool">${booking.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-6">
            <p>Thank you for choosing POOL Management!</p>
            <p className="mt-1">For questions, contact us at support@poolmanagement.com</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
