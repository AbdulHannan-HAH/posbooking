import { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Printer, Download, Utensils } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SaleDetails {
    id: string;
    saleNumber: string;
    customerName: string;
    customerPhone?: string;
    tableNumber?: string;
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    taxTotal: number;
    discountTotal: number;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: 'paid' | 'pending' | 'cancelled' | 'refunded';
    orderType: string;
    createdAt: string;
    servedBy?: string;
}

interface RestaurantInvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    sale: SaleDetails;
}

export function RestaurantInvoiceDialog({ open, onClose, sale }: RestaurantInvoiceDialogProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = invoiceRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Thermal printer optimized styles
        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.saleNumber}</title>
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
              <div class="company-name">🍽️ RESTAURANT & BAR</div>
              <div class="company-sub">Fine Dining Experience</div>
            </div>

            <div class="receipt-title">TAX INVOICE</div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Invoice #:</span>
                <span class="value">${sale.saleNumber}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">${new Date(sale.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">${new Date(sale.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
              <div class="info-row">
                <span class="label">Customer:</span>
                <span class="value">${sale.customerName}</span>
              </div>
              ${sale.customerPhone ? `
              <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value">${sale.customerPhone}</span>
              </div>
              ` : ''}
              ${sale.tableNumber ? `
              <div class="info-row">
                <span class="label">Table:</span>
                <span class="value">${sale.tableNumber}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="label">Order Type:</span>
                <span class="value">${sale.orderType.replace('_', ' ')}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="item-section">
              <div class="item-header">
                <span>ITEM</span>
                <span>AMOUNT</span>
              </div>
              ${sale.items.map(item => `
              <div class="item-row">
                <div class="item-name">
                  ${item.name}
                  <div class="item-details">x${item.quantity} @ $${item.unitPrice.toFixed(2)}</div>
                </div>
                <span>$${item.total.toFixed(2)}</span>
              </div>
              `).join('')}
            </div>

            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>$${sale.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Tax:</span>
                <span>$${sale.taxTotal.toFixed(2)}</span>
              </div>
              ${sale.discountTotal > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-$${sale.discountTotal.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-row grand-total">
                <span>TOTAL:</span>
                <span>$${sale.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div class="status-section">
              <span class="status-badge status-${sale.paymentStatus}">
                ${sale.paymentStatus.toUpperCase()}
              </span>
            </div>

            <div class="footer">
              <p>Thank you for dining with us!</p>
              <p>${sale.servedBy ? `Served by: ${sale.servedBy}` : ''}</p>
              <p style="margin-top: 6px; font-size: 9px;">
                --------------------------------
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
        handlePrint();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Sale Receipt</span>
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

                {/* Preview */}
                <div ref={invoiceRef} className="bg-background p-4 rounded-lg border font-mono text-sm">
                    {/* Header */}
                    <div className="text-center border-b border-dashed pb-3 mb-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                                <Utensils className="h-4 w-4 text-white" />
                            </div>
                            <h2 className="text-lg font-bold text-orange-600">RESTAURANT & BAR</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">Fine Dining Experience</p>
                    </div>

                    {/* Title */}
                    <div className="text-center py-2 border-y border-dashed mb-3">
                        <h3 className="font-bold">TAX INVOICE</h3>
                    </div>

                    {/* Info */}
                    <div className="space-y-1 mb-3 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice #:</span>
                            <span className="font-medium">{sale.saleNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <Separator className="border-dashed mb-3" />

                    {/* Customer Info */}
                    <div className="space-y-1 mb-3 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-medium">{sale.customerName}</span>
                        </div>
                        {sale.customerPhone && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span>{sale.customerPhone}</span>
                            </div>
                        )}
                        {sale.tableNumber && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Table:</span>
                                <span>{sale.tableNumber}</span>
                            </div>
                        )}
                    </div>

                    <Separator className="border-dashed mb-3" />

                    {/* Items */}
                    <div className="mb-3">
                        <div className="flex justify-between text-xs font-bold border-b pb-1 mb-2">
                            <span>ITEM</span>
                            <span>AMOUNT</span>
                        </div>
                        {sale.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs mb-2">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">
                                        {item.quantity} x ${item.unitPrice.toFixed(2)}
                                    </p>
                                </div>
                                <span className="font-medium">${item.total.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dashed pt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span>${sale.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax:</span>
                            <span>${sale.taxTotal.toFixed(2)}</span>
                        </div>
                        {sale.discountTotal > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount:</span>
                                <span>-${sale.discountTotal.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                            <span>TOTAL:</span>
                            <span className="text-orange-600">${sale.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="text-center my-3">
                        <StatusBadge status={sale.paymentStatus} />
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-muted-foreground border-t border-dashed pt-3">
                        <p>Thank you for dining with us!</p>
                        {sale.servedBy && <p>Served by: {sale.servedBy}</p>}
                        <p className="mt-2 text-[10px]">--------------------------------</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}