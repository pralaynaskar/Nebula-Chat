"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import type { AiModel, Message, Conversation } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { generateResponse } from '@/ai/flows/chat-flow';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Moon, LogIn, ChevronsUpDown, Pencil, Trash2, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const models: AiModel[] = [
  { id: 'googleai/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Google\'s fast and efficient model.' },
];

const initialConversations: Conversation[] = [];
const initialModelTraffic: Record<string, number> = {};

export function ChatLayout() {
  const [isClient, setIsClient] = useState(false);
  const [selectedModel, setSelectedModel] = useLocalStorage<AiModel>(
    'selectedModel',
    models[0]
  );
  
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    'conversations',
    initialConversations
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeConversationId)
  , [conversations, activeConversationId]);

  const messages = activeConversation?.messages || [];

  const [modelTraffic, setModelTraffic] = useLocalStorage<Record<string, number>>(
    'modelTraffic',
    initialModelTraffic
  );
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
        if (!activeConversationId && conversations.length > 0) {
          setActiveConversationId(conversations[0].id);
        }
        if (activeConversationId && !conversations.find(c => c.id === activeConversationId)) {
            setActiveConversationId(conversations.length > 0 ? conversations[0].id : null);
        }
    }
  }, [conversations, activeConversationId, isClient]);
  
  useEffect(() => {
    if (activeConversation) {
      const model = models.find(m => m.id === activeConversation.model);
      if (model) {
        setSelectedModel(model);
      }
    }
  }, [activeConversation, setSelectedModel]);

  const handleModelChange = (model: AiModel) => {
    if (isLoading) return;
    setSelectedModel(model);
    if (activeConversation) {
      setConversations(prev => prev.map(c => 
        c.id === activeConversationId ? { ...c, model: model.id } : c
      ));
    }
  };
  
  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      name: `Chat ${conversations.length + 1}`,
      messages: [],
      model: selectedModel.id,
      createdAt: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setConversationToDelete(null);
  };

  const handleStartRename = (convo: Conversation) => {
    setRenamingConversationId(convo.id);
    setRenameValue(convo.name);
  };
  
  const handleConfirmRename = (id: string) => {
    if (renameValue.trim()) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, name: renameValue.trim() } : c));
    }
    setRenamingConversationId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingConversationId(null);
    setRenameValue('');
  };

  const addMessage = async (text: string, imageUrl?: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      model: selectedModel.id,
      timestamp: Date.now(),
      imageUrl,
    };

    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      text: '...',
      sender: 'loading',
      model: selectedModel.id,
      timestamp: Date.now(),
    };

    let currentConversationId = activeConversationId;
    let conversationForApi = conversations.find(c => c.id === currentConversationId);

    if (!conversationForApi) {
        const newConversation: Conversation = {
            id: crypto.randomUUID(),
            name: text.substring(0, 25) || 'New Chat',
            messages: [],
            model: selectedModel.id,
            createdAt: Date.now(),
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        currentConversationId = newConversation.id;
        conversationForApi = newConversation;
    }
    
    setConversations(prev => prev.map(c => 
        c.id === currentConversationId 
            ? { ...c, messages: [...c.messages, userMessage, loadingMessage] }
            : c
    ));
    
    setIsLoading(true);

    const currentConvo = conversations.find(c => c.id === currentConversationId) || conversationForApi;
    const historyForApi = [...currentConvo.messages, userMessage];

    const flowMessages = historyForApi
        .filter((m) => m.sender === 'user' || m.sender === 'ai')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          content: m.text,
        }));
    
    setModelTraffic(prev => ({...prev, [selectedModel.id]: (prev[selectedModel.id] || 0) + 1}));

    let aiResponse: Message;

    try {
      const response = await generateResponse({
        messages: flowMessages,
        model: selectedModel.id,
        imageUrl: imageUrl,
      });
      
      aiResponse = {
        id: crypto.randomUUID(),
        text: response.text,
        sender: 'ai',
        model: selectedModel.id,
        timestamp: Date.now(),
        imageUrl: response.imageUrl,
      };

    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: 'Failed to get a response from the model.',
        variant: 'destructive',
      });
      aiResponse = {
        id: crypto.randomUUID(),
        text: 'Sorry, I encountered an error. Please check the logs or your API key.',
        sender: 'ai',
        model: selectedModel.id,
        timestamp: Date.now(),
      };
    } finally {
        if (currentConversationId) {
            setConversations(prev => prev.map(c => {
              if (c.id === currentConversationId) {
                const finalMessages = c.messages.filter(m => m.sender !== 'loading');
                finalMessages.push(aiResponse);
                return { ...c, messages: finalMessages };
              }
              return c;
            }));
        }
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addMessage(suggestion.replace(/\\n/g, ' '));
  };

  const handleFeedback = (messageId: string, feedback: 'good' | 'bad') => {
    setConversations(prev => prev.map(c => {
        if (c.id !== activeConversationId) return c;
        const updatedMessages = c.messages.map(msg =>
            msg.id === messageId ? { ...msg, feedback } : msg
        );
        return { ...c, messages: updatedMessages };
    }));
  };

  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center justify-between p-2">
                    <h2 className="text-lg font-semibold group-data-[collapsible=icon]:hidden bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Nebula Chat</h2>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2 pt-0">
                {isClient ? (
                  conversations.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {conversations.map(convo => (
                        <div key={convo.id} className="relative group">
                          {renamingConversationId === convo.id ? (
                              <div className="flex items-center gap-1 p-1">
                                  <Input
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleConfirmRename(convo.id);
                                          if (e.key === 'Escape') handleCancelRename();
                                      }}
                                      className="h-8"
                                      autoFocus
                                      onBlur={() => handleConfirmRename(convo.id)}
                                  />
                                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleConfirmRename(convo.id)}>
                                      <Check className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCancelRename}>
                                      <X className="h-4 w-4" />
                                  </Button>
                              </div>
                          ) : (
                            <Button
                              variant={activeConversationId === convo.id ? 'secondary' : 'ghost'}
                              size="sm"
                              className="w-full justify-start truncate pr-14"
                              onClick={() => setActiveConversationId(convo.id)}
                            >
                              {convo.name}
                            </Button>
                          )}
                          {renamingConversationId !== convo.id && (
                               <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartRename(convo)}>
                                      <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400" onClick={() => setConversationToDelete(convo)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                        Start a new chat to see your history.
                    </p>
                  )
                ) : (
                    <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                        <SidebarMenuSkeleton />
                        <SidebarMenuSkeleton />
                        <SidebarMenuSkeleton />
                    </div>
                )}
            </SidebarContent>
            <SidebarFooter className="border-t border-border mt-auto p-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between gap-2 h-11">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                                <span className="group-data-[collapsible=icon]:hidden">Guest</span>
                            </div>
                            <ChevronsUpDown size={16} className="group-data-[collapsible=icon]:hidden text-muted-foreground"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                        <DropdownMenuItem>
                            <Moon size={16} className="mr-2"/>
                            <span>Toggle light mode</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem>
                            <LogIn size={16} className="mr-2"/>
                            <span>Login to your account</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
      <SidebarInset>
          <ChatHeader
              models={models}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              isLoading={isLoading}
          />
          <div className="flex-1 overflow-y-auto relative" ref={scrollRef}>
              <ChatMessages
                messages={messages}
                onFeedback={handleFeedback}
                onSuggestionClick={handleSuggestionClick}
              />
          </div>
          <div className="border-t bg-background p-4 shrink-0">
              <div className="max-w-3xl mx-auto">
                  <ChatInput
                      onSendMessage={addMessage}
                      isLoading={isLoading}
                  />
              </div>
          </div>
      </SidebarInset>

      <AlertDialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the chat "{conversationToDelete?.name}". This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
