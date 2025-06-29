import { Bot, ThumbsDown, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string, feedback: 'good' | 'bad') => void;
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const isAi = message.sender === 'ai';
  const isLoading = message.sender === 'loading';

  if (isLoading) {
    return (
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-secondary">
          <Bot className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-start gap-3', {
        'justify-end': isUser,
      })}
    >
      {!isUser && (
        <div className="p-2 rounded-full bg-secondary">
          <Bot className="w-6 h-6 text-secondary-foreground" />
        </div>
      )}

      <div
        className={cn(
          'max-w-2xl p-3 rounded-2xl shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        {message.imageUrl && (
          <Image
            src={message.imageUrl}
            alt={isUser ? "User upload" : "Generated image"}
            width={400}
            height={400}
            className={cn('rounded-lg w-full h-auto', message.text ? 'mb-2' : '')}
          />
        )}
        {message.text &&
          (isAi ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          ))}
        {isAi && (
          <div className="flex items-center justify-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7',
                message.feedback === 'good' && 'bg-green-500/20 text-green-400'
              )}
              onClick={() => onFeedback(message.id, 'good')}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7',
                message.feedback === 'bad' && 'bg-red-500/20 text-red-400'
              )}
              onClick={() => onFeedback(message.id, 'bad')}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="p-2 rounded-full bg-muted">
          <User className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
