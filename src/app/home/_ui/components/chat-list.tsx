"use client";

import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props {
  // UI-only props
}

const ChatList = ({}: Props) => {
  // Mock chat data for UI demonstration
  const mockChats = [
    { id: '1', title: 'Getting Started with AI', created_at: '2024-01-15' },
    { id: '2', title: 'Code Review Help', created_at: '2024-01-14' },
    { id: '3', title: 'Project Planning Discussion', created_at: '2024-01-13' },
    { id: '4', title: 'Creative Writing Session', created_at: '2024-01-12' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h2 className="text-lg font-semibold">Chats</h2>
        <Button variant="ghost" size="icon">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {chat.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(chat.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">User</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
