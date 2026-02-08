// components/hotel/InvoiceDialog.tsx - UPDATED (NO TAX)
import { useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Printer, Download, Hotel } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ServiceItem {
    name: string;
    price: number;
    quantity: number;
    total: number;
}

interface InvoiceDialogProps {
    open: boolean;
    onClose: () => void;
    reservation: {
        id: string;
        guestName: string;
        email: string;
        phone: string;
        checkIn: string;
        checkOut: string;
        roomNumber: string;
        roomType: string;
        adults: number;
        children: number;
        nights: number;
        roomRate: number;
        totalAmount: number;
        paymentStatus: 'paid' | 'pending' | 'partial';
    };
    services?: ServiceItem[];
}

export function InvoiceDialog({ open, onClose, reservation, services = [] }: InvoiceDialogProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const roomTotal = reservation.roomRate * reservation.nights;
    const servicesTotal = services.reduce((sum, service) => sum + service.total, 0);
    const subtotal = roomTotal + servicesTotal;
    const total = subtotal; // No tax

    const handlePrint = () => {
        const printContent = invoiceRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const servicesHTML = services.length > 0 ? `
            <div class="item-section">
                <div class="item-header">
                    <span>ADDITIONAL SERVICES</span>
                    <span>AMOUNT</span>
                </div>
                ${services.map(service => `
                    <div class="item-row">
                        <div>
                            <p>${service.name}</p>
                            <p class="item-details">${service.quantity} × $${service.price}</p>
                        </div>
                        <span>$${service.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Hotel Invoice - ${reservation.id}</title>
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
                        .invoice { width: 100%; }
                        .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
                        .company-name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
                        .invoice-title { text-align: center; font-size: 14px; font-weight: bold; margin: 8px 0; padding: 4px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
                        .info-section { margin-bottom: 8px; }
                        .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; }
                        .info-row .label { color: #333; }
                        .info-row .value { font-weight: bold; text-align: right; max-width: 55%; }
                        .divider { border-top: 1px dashed #000; margin: 8px 0; }
                        .item-section { margin-bottom: 8px; }
                        .item-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
                        .item-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
                        .item-details { font-size: 10px; color: #666; margin-top: 1px; }
                        .totals-section { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
                        .total-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
                        .total-row.grand-total { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
                        .status-section { text-align: center; margin: 10px 0; }
                        .status-badge { display: inline-block; padding: 4px 12px; font-size: 12px; font-weight: bold; border: 2px solid #000; border-radius: 4px; }
                        .footer { text-align: center; border-top: 1px dashed #000; padding-top: 8px; margin-top: 10px; font-size: 10px; }
                        .footer p { margin-bottom: 2px; }
                        @media print {
                            @page { size: 80mm auto; margin: 0; }
                            body { width: 80mm; padding: 2mm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice">
                        <div class="header">
                            <div class="company-name">🏨 GRAND HOTEL</div>
                            <div class="company-sub">Premium Accommodation</div>
                        </div>

                        <div class="invoice-title">HOTEL INVOICE</div>

                        <div class="info-section">
                            <div class="info-row">
                                <span class="label">Invoice #:</span>
                                <span class="value">${reservation.id}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Date:</span>
                                <span class="value">${new Date().toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="info-section">
                            <div class="info-row">
                                <span class="label">Guest:</span>
                                <span class="value">${reservation.guestName}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Phone:</span>
                                <span class="value">${reservation.phone}</span>
                            </div>
                            ${reservation.email ? `
                            <div class="info-row">
                                <span class="label">Email:</span>
                                <span class="value">${reservation.email}</span>
                            </div>
                            ` : ''}
                        </div>

                        <div class="divider"></div>

                        <div class="info-section">
                            <div class="info-row">
                                <span class="label">Check-in:</span>
                                <span class="value">${reservation.checkIn}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Check-out:</span>
                                <span class="value">${reservation.checkOut}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Room:</span>
                                <span class="value">${reservation.roomNumber} (${reservation.roomType})</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Guests:</span>
                                <span class="value">${reservation.adults} adults, ${reservation.children} children</span>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="item-section">
                            <div class="item-header">
                                <span>DESCRIPTION</span>
                                <span>AMOUNT</span>
                            </div>
                            <div class="item-row">
                                <div>
                                    <p>Room ${reservation.roomNumber}</p>
                                    <p class="item-details">${reservation.nights} nights × $${reservation.roomRate}/night</p>
                                </div>
                                <span>$${roomTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        ${servicesHTML}

                        <div class="totals-section">
                            <div class="total-row">
                                <span>Room Total:</span>
                                <span>$${roomTotal.toFixed(2)}</span>
                            </div>
                            ${services.length > 0 ? `
                            <div class="total-row">
                                <span>Services Total:</span>
                                <span>$${servicesTotal.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            <div class="total-row grand-total">
                                <span>TOTAL:</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div class="status-section">
                            <span class="status-badge">
                                ${reservation.paymentStatus.toUpperCase()}
                            </span>
                        </div>

                        <div class="footer">
                            <p>Thank you for staying with us!</p>
                            <p>contact@grandhotel.com</p>
                            <p style="margin-top: 6px; font-size: 9px;">
                                --------------------------------
                            </p>
                            <p style="font-size: 9px;">
                                ${reservation.id}
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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Hotel Invoice</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div ref={invoiceRef} className="bg-background p-4 rounded-lg border font-mono text-sm">
                    <div className="text-center border-b border-dashed pb-3 mb-3">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg gradient-hotel flex items-center justify-center">
                                <Hotel className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <h2 className="text-lg font-bold text-hotel">GRAND HOTEL</h2>
                        </div>
                        <p className="text-xs text-muted-foreground">Premium Accommodation</p>
                    </div>

                    <div className="text-center py-2 border-y border-dashed mb-3">
                        <h3 className="font-bold">HOTEL INVOICE</h3>
                    </div>

                    <div className="space-y-1 mb-3 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice #:</span>
                            <span className="font-medium">{reservation.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <Separator className="border-dashed mb-3" />

                    <div className="space-y-1 mb-3 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Guest:</span>
                            <span className="font-medium">{reservation.guestName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{reservation.phone}</span>
                        </div>
                        {reservation.email && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span>{reservation.email}</span>
                            </div>
                        )}
                    </div>

                    <Separator className="border-dashed mb-3" />

                    <div className="space-y-1 mb-3 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Check-in:</span>
                            <span>{reservation.checkIn}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Check-out:</span>
                            <span>{reservation.checkOut}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Room:</span>
                            <span>{reservation.roomNumber} ({reservation.roomType})</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Guests:</span>
                            <span>{reservation.adults} adults, {reservation.children} children</span>
                        </div>
                    </div>

                    <Separator className="border-dashed mb-3" />

                    <div className="mb-3">
                        <div className="flex justify-between text-xs font-bold border-b pb-1 mb-2">
                            <span>DESCRIPTION</span>
                            <span>AMOUNT</span>
                        </div>

                        {/* Room Charges */}
                        <div className="flex justify-between text-xs mb-2">
                            <div>
                                <p className="font-medium">Room {reservation.roomNumber}</p>
                                <p className="text-muted-foreground">{reservation.nights} nights × ${reservation.roomRate}/night</p>
                            </div>
                            <span className="font-medium">${roomTotal.toFixed(2)}</span>
                        </div>

                        {/* Additional Services */}
                        {services.length > 0 && (
                            <>
                                <div className="flex justify-between text-xs font-bold border-b pb-1 mb-2 mt-4">
                                    <span>ADDITIONAL SERVICES</span>
                                    <span>AMOUNT</span>
                                </div>
                                {services.map((service, index) => (
                                    <div key={index} className="flex justify-between text-xs mb-2">
                                        <div>
                                            <p className="font-medium">{service.name}</p>
                                            <p className="text-muted-foreground">{service.quantity} × ${service.price}</p>
                                        </div>
                                        <span className="font-medium">${service.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    <div className="border-t border-dashed pt-2 space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Room Total:</span>
                            <span>${roomTotal.toFixed(2)}</span>
                        </div>
                        {services.length > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Services Total:</span>
                                <span>${servicesTotal.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                            <span>TOTAL:</span>
                            <span className="text-hotel">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="text-center my-3">
                        <StatusBadge status={reservation.paymentStatus} />
                    </div>

                    <div className="text-center text-xs text-muted-foreground border-t border-dashed pt-3">
                        <p>Thank you for staying with us!</p>
                        <p>contact@grandhotel.com</p>
                        <p className="mt-2 text-[10px]">--------------------------------</p>
                        <p className="text-[10px]">{reservation.id}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}