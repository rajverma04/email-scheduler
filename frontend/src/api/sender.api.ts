import api from './axios';

export interface Sender {
  id: string;
  senderName: string;
  senderEmail: string;
  hourlyLimit: number;
  isActive: boolean;
}

export interface CreateSenderPayload {
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  hourlyLimit: number;
}

export const getSenders = async (): Promise<Sender[]> => {
  const { data } = await api.get('/senders');
  return data;
};

export const createSender = async (payload: CreateSenderPayload): Promise<Sender> => {
  const { data } = await api.post('/senders', payload);
  return data;
};

export const deleteSender = async (id: string) => {
  const { data } = await api.delete(`/senders/${id}`);
  return data;
};
