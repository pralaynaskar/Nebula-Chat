import type { AiModel } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ChatHeaderProps {
  models: AiModel[];
  selectedModel: AiModel;
  onModelChange: (model: AiModel) => void;
  isLoading: boolean;
}

export function ChatHeader({ models, selectedModel, onModelChange, isLoading }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b h-14">
        <div className="flex items-center gap-4">
            <SidebarTrigger />
            <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isLoading}>
                    <Button variant="ghost" size="sm" className="gap-1 disabled:opacity-50">
                        <span className="font-semibold">Chat model</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup value={selectedModel.id} onValueChange={(value) => {
                        const model = models.find((m) => m.id === value);
                        if (model) onModelChange(model);
                    }}>
                        {models.map((model) => (
                            <DropdownMenuRadioItem key={model.id} value={model.id}>
                                {model.name}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  );
}
