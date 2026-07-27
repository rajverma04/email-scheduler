import api from './axios';

export interface ScheduleEmailPayload {
  senderId: string;
  recipients: { email: string }[];
  subject: string;
  body: string;
  scheduleTime?: string; // ISO date string
  delayBetweenEmails: number;
  hourlyLimit: number;
}

export const scheduleEmail = async (payload: ScheduleEmailPayload) => {
  const formattedPayload = {
    senderId: payload.senderId,
    subject: payload.subject,
    body: payload.body,
    scheduledAt: payload.scheduleTime && payload.scheduleTime.trim() !== '' 
      ? new Date(payload.scheduleTime).toISOString() 
      : new Date(Date.now() + 2000).toISOString(), // 2s in future for immediate
    delayBetweenEmails: payload.delayBetweenEmails,
    hourlyLimit: payload.hourlyLimit,
    recipients: payload.recipients.map((r) => r.email),
  };
  const { data } = await api.post('/emails/schedule', formattedPayload);
  return data;
};

export interface Email {
  id: string;
  senderId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'PENDING' | 'QUEUED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';
  scheduledAt: string;
  sentAt?: string | null;
  scheduleTime?: string;
  createdAt: string;
  sender: {
    senderName: string;
    senderEmail: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getEmails = async (params: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResponse<Email>> => {
  const { data } = await api.get('/emails', { params });
  return data;
};

export const getEmailById = async (id: string): Promise<Email> => {
  const { data } = await api.get(`/emails/${id}`);
  return data;
};

export const retryEmail = async (id: string) => {
  const { data } = await api.post(`/emails/${id}/retry`);
  return data;
};

export const cancelEmail = async (id: string) => {
  const { data } = await api.post(`/emails/${id}/cancel`);
  return data;
};
