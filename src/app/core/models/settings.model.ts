export interface ClinicSettings {
  clinicName: string;
  supportEmail: string;
  hotline: string;
  address: string;
  defaultConsultationFee: number;
  bufferTime: string;
  slotDuration: string;
  enableSmsReminders: boolean;
  enableEmailReceipts: boolean;
  enableAutoCancel: boolean;
  language: string;
  weekStartDay: string;
}
