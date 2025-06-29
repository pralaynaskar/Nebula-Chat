import { useEffect, useState } from 'react';
import { ChatMessage } from './chat-message';
import type { Message } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface ChatMessagesProps {
  messages: Message[];
  onFeedback: (messageId: string, feedback: 'good' | 'bad') => void;
  onSuggestionClick: (suggestion: string) => void;
}

const allSuggestions = [
    "Generate an image of\\na futuristic city skyline",
    "What are the advantages\\nof using Next.js?",
    "Write code to\\ndemonstrate djikstra's algorithm",
    "Help me write an essay\\nabout silicon valley",
    "What is the weather\\nIn San Francisco?",
    "Explain quantum computing\\nin simple terms",
    "Plan a 3-day trip\\nto Paris",
    "What are some healthy\\nbreakfast ideas?",
    "Create a workout plan\\nfor a beginner",
    "How does blockchain\\ntechnology work?",
    "Write a short story\\nabout a friendly robot",
    "What's the difference between\\nAI, ML, and Deep Learning?",
    "Suggest a good book\\nto read this month",
];

export function ChatMessages({ messages, onFeedback, onSuggestionClick }: ChatMessagesProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (messages.length === 0) {
        const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Hello there!</h1>
                <p className="text-muted-foreground">How can I help you today?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl w-full">
                {suggestions.map((suggestion, i) => (
                    <Card key={i} className="p-4 hover:bg-accent cursor-pointer" onClick={() => onSuggestionClick(suggestion)}>
                        <CardContent className="p-0">
                            <p className="text-sm whitespace-pre-wrap">{suggestion.replace(/\\n/g, '\n')}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onFeedback={onFeedback}
        />
      ))}
    </div>
  );
}
