export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'loading';
  model: string;
  feedback?: 'good' | 'bad';
  timestamp: number;
  imageUrl?: string;
};

export type AiModel = {
  id: string;
  name: string;
  description: string;
};

export type ModelTraffic = Record<string, number>;

export type Conversation = {
    id: string;
    name: string;
    messages: Message[];
    model: string;
    createdAt: number;
};
