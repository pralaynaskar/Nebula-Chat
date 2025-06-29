"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Paperclip, ArrowUp, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if ((message.trim() || imageUrl) && !isLoading) {
      onSendMessage(message, imageUrl || undefined);
      setMessage('');
      removeImage();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {imageUrl && (
        <div className="mb-2 relative w-24 h-24">
          <Image src={imageUrl} alt="Selected image" layout="fill" objectFit="cover" className="rounded-lg" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/75 rounded-full"
            onClick={removeImage}
          >
            <X className="w-4 h-4 text-white" />
          </Button>
        </div>
      )}
      <div className="relative flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <Button type="button" variant="ghost" size="icon" className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handlePaperclipClick}>
            <Paperclip className="w-5 h-5" />
        </Button>
        <Textarea
            value={message}
            onChange={handleInputChange}
            placeholder="Send a message..."
            className="pl-12 pr-14 py-3 min-h-[52px] resize-none border rounded-xl bg-card"
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
            }}
            rows={1}
        />
        <Button
            type="submit"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary disabled:bg-primary/50"
            disabled={isLoading || (!message.trim() && !imageUrl)}
        >
            <ArrowUp className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
