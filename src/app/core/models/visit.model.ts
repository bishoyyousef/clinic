export interface PrescriptionItemDto {
  drug: string;
  dosage: string;
  duration: string;
}

export interface VisitDto {
  id: number;
  appointmentId: number;
  diagnosis: string;
  notes?: string;
  createdAt: string;
  editableUntil?: string;
  isEditable: boolean;
  prescription: PrescriptionItemDto[];
}

export interface CreateVisitRequest {
  diagnosis: string;
  notes?: string;
  prescription: PrescriptionItemDto[];
}
