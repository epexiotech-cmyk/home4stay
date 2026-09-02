import { resolveStateCode } from "./taxValidator";

export interface GstBreakdown {
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export class GstEngine {
  /**
   * Resolves whether a transaction is interstate or intrastate based on supplier and customer states.
   */
  static isInterstateTransaction(supplierState: string | null, customerState: string | null): boolean {
    if (!supplierState || !customerState) return false;
    const sCode = resolveStateCode(supplierState);
    const cCode = resolveStateCode(customerState);
    if (!sCode || !cCode) return false;
    return sCode !== cCode;
  }

  /**
   * Re-calculates subtotal and tax values from a gross total amount paid.
   * CGST & SGST are split evenly for intrastate, whereas IGST takes full tax for interstate.
   * Rounding is applied to 2 decimal places to ensure accounting safety.
   */
  static calculateTaxBreakdown(
    totalPaid: number,
    gstRatePercent: number,
    isInterstate: boolean
  ): GstBreakdown {
    // subtotal = totalPaid / (1 + (gstRatePercent / 100))
    const subtotal = totalPaid / (1 + gstRatePercent / 100);
    const gstAmount = totalPaid - subtotal;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterstate) {
      igst = gstAmount;
    } else {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }

    // Force strict 2-decimal rounding to prevent floating point drift
    const roundedSubtotal = Number(subtotal.toFixed(2));
    const roundedGstAmount = Number(gstAmount.toFixed(2));
    const roundedCgst = Number(cgst.toFixed(2));
    const roundedSgst = Number(sgst.toFixed(2));
    const roundedIgst = Number(igst.toFixed(2));
    const roundedTotal = Number(totalPaid.toFixed(2));

    // Re-verify mathematical integrity: subtotal + gstAmount should match totalPaid
    // If minor rounding drift exists, adjust subtotal slightly to reconcile
    const diff = Number((roundedTotal - (roundedSubtotal + roundedGstAmount)).toFixed(2));
    const adjustedSubtotal = Number((roundedSubtotal + diff).toFixed(2));

    return {
      subtotal: adjustedSubtotal,
      gstPercent: Number(gstRatePercent.toFixed(2)),
      gstAmount: roundedGstAmount,
      cgst: roundedCgst,
      sgst: roundedSgst,
      igst: roundedIgst,
      total: roundedTotal,
    };
  }

  /**
   * Re-calculates subtotal and tax values dynamically resolving place-of-supply.
   */
  static calculateTaxForTransaction(
    totalPaid: number,
    gstRatePercent: number,
    supplierState: string | null,
    customerState: string | null
  ): GstBreakdown {
    const isInterstate = this.isInterstateTransaction(supplierState, customerState);
    return this.calculateTaxBreakdown(totalPaid, gstRatePercent, isInterstate);
  }
}

