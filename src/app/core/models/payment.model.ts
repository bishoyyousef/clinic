export interface PaymentDto {
  id: number;
  amount: number;
  method: string;
  status: string;
  transactionRef?: string;
  paidAt?: string;
}

export interface PaymentInitDto {
  id: number;
  checkoutUrl: string;
}
