import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Printer, Download, Waves, Percent } from 'lucide-react';
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
  subtotal?: number;
  discount?: number;
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

    // Thermal printer optimized styles (80mm width = ~302px at 96dpi)
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${booking.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              width: 80mm;
              max-width: 80mm;
              margin: 0 auto;
              padding: 2mm;
            }
            .receipt {
              width: 100%;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .company-sub {
              font-size: 10px;
            }
            .receipt-title {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin: 8px 0;
              padding: 4px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .info-section {
              margin-bottom: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 11px;
            }
            .info-row .label {
              color: #333;
            }
            .info-row .value {
              font-weight: bold;
              text-align: right;
              max-width: 55%;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .item-section {
              margin-bottom: 8px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 11px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
              margin-bottom: 4px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin-bottom: 4px;
            }
            .item-name {
              max-width: 60%;
            }
            .item-details {
              font-size: 10px;
              color: #333;
              margin-left: 8px;
            }
            .discount-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #4a6cf7;
              margin-top: 4px;
            }
            .totals-section {
              border-top: 1px dashed #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin-bottom: 2px;
            }
            .total-row.grand-total {
              font-size: 14px;
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 6px;
              margin-top: 6px;
            }
            .status-section {
              text-align: center;
              margin: 10px 0;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              font-size: 12px;
              font-weight: bold;
              border: 2px solid #000;
              border-radius: 4px;
            }
            .status-paid {
              background: #fff;
            }
            .status-pending {
              background: #fff;
            }
            .footer {
              text-align: center;
              border-top: 1px dashed #000;
              padding-top: 8px;
              margin-top: 10px;
              font-size: 10px;
            }
            .footer p {
              margin-bottom: 2px;
            }
            .barcode {
              text-align: center;
              font-family: 'Libre Barcode 39', cursive;
              font-size: 32px;
              margin: 8px 0;
              letter-spacing: 4px;
            }
            .qr-placeholder {
              text-align: center;
              margin: 8px 0;
              font-size: 10px;
            }
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                width: 80mm;
                padding: 2mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="company-name">🏊 POOL MANAGEMENT</div>
              <div class="company-sub">Premium Pool Services</div>
            </div>

            <div class="receipt-title">RECEIPT</div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Receipt #:</span>
                <span class="value">${booking.id}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">${new Date().toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">${new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Customer:</span>
                <span class="value">${booking.customerName}</span>
              </div>
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${booking.phone}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Booking Date:</span>
                <span class="value">${booking.date}</span>
              </div>
              <div class="info-row">
                <span class="label">Time Slot:</span>
                <span class="value">${booking.timeSlot}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="item-section">
              <div class="item-header">
                <span>ITEM</span>
                <span>AMOUNT</span>
              </div>
              <div class="item-row">
                <div class="item-name">
                  ${booking.passType}
                  <div class="item-details">${booking.persons} person(s)</div>
                </div>
                <span>$${booking.subtotal?.toFixed(2) || booking.amount.toFixed(2)}</span>
              </div>
              ${booking.discount && booking.discount > 0 ? `
              <div class="discount-row">
                <span>Discount</span>
                <span>-$${booking.discount.toFixed(2)}</span>
              </div>
              ` : ''}
            </div>

            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${booking.subtotal?.toFixed(2) || booking.amount.toFixed(2)}</span>
              </div>
              ${booking.discount && booking.discount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-$${booking.discount.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-row">
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div class="total-row grand-total">
                <span>TOTAL:</span>
                <span>$${booking.amount.toFixed(2)}</span>
              </div>
            </div>

            <div class="status-section">
              <span class="status-badge status-${booking.paymentStatus}">
                ${booking.paymentStatus.toUpperCase()}
              </span>
            </div>

            <div class="footer">
              <p>Thank you for your visit!</p>
              <p>support@poolmanagement.com</p>
              <p style="margin-top: 6px; font-size: 9px;">
                --------------------------------
              </p>
              <p style="font-size: 9px;">
                ${booking.id}
              </p>
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Receipt</span>
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

        {/* Preview - styled like thermal receipt */}
        <div ref={invoiceRef} className="bg-background p-4 rounded-lg border font-mono text-sm">
          {/* Receipt Header */}
          <div className="text-center border-b border-dashed pb-3 mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-lg gradient-pool flex items-center justify-center">
                <Waves className="h-4 w-4 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-pool">POOL MANAGEMENT</h2>
            </div>
            <p className="text-xs text-muted-foreground">Premium Pool Services</p>
          </div>

          {/* Receipt Title */}
          <div className="text-center py-2 border-y border-dashed mb-3">
            <h3 className="font-bold">RECEIPT</h3>
          </div>

          {/* Receipt Info */}
          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Receipt #:</span>
              <span className="font-medium">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <Separator className="border-dashed mb-3" />

          {/* Customer Info */}
          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium truncate ml-2">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{booking.phone}</span>
            </div>
          </div>

          <Separator className="border-dashed mb-3" />

          {/* Booking Details */}
          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking Date:</span>
              <span>{booking.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Slot:</span>
              <span>{booking.timeSlot}</span>
            </div>
          </div>

          <Separator className="border-dashed mb-3" />

          {/* Items */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-bold border-b pb-1 mb-2">
              <span>ITEM</span>
              <span>AMOUNT</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <div>
                <p className="font-medium">{booking.passType}</p>
                <p className="text-muted-foreground">{booking.persons} person(s)</p>
              </div>
              <span className="font-medium">${booking.subtotal?.toFixed(2) || booking.amount.toFixed(2)}</span>
            </div>
            {booking.discount && booking.discount > 0 && (
              <div className="flex justify-between text-xs text-pool border-t border-dashed pt-1 mt-1">
                <span>Discount</span>
                <span>-${booking.discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed pt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>$${booking.subtotal?.toFixed(2) || booking.amount.toFixed(2)}</span>
            </div>
            {booking.discount && booking.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <span>-${booking.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (0%):</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
              <span>TOTAL:</span>
              <span className="text-pool">${booking.amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="text-center my-3">
            <StatusBadge status={booking.paymentStatus} />
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t border-dashed pt-3">
            <p>Thank you for your visit!</p>
            <p>support@poolmanagement.com</p>
            <p className="mt-2 text-[10px]">--------------------------------</p>
            <p className="text-[10px]">{booking.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}