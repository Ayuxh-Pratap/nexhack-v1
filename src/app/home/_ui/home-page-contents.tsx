"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, MessageSquare } from "lucide-react";
import ChatContainer from "./components/chat-container";
import ChatWrapper from "./components/chat-wrapper";
import ChatInput from "./components/chat-input";
import EmptyState from "./components/empty-state";
import StudyModeLayout from "./components/study-mode-layout";
import { NodeWorkspaceModal } from "./node/node-workspace-modal";
import CourseOvaContainer from "./components/course-container";
import { useCourseData } from "@/stores/course-mock-store";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types/user";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

// Utility function to generate unique IDs
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const HomePageContents = () => {
  console.log('HomePageContents component rendering...');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isNodeMode, setIsNodeMode] = useState(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState("course"); // Default to course
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();

  // Map auth user to expected User type for CourseOvaContainer
  const user: User | null = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser.id,
      name: authUser.name || "",
      email: authUser.email,
      image: authUser.avatar || null,
      emailVerified: authUser.emailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [authUser]);

  // Debug logging
  useEffect(() => {
    console.log('Auth state:', { authUser, authLoading, user });
  }, [authUser, authLoading, user]);

  // Get courses from store
  const { courses, getCourseById } = useCourseData();
  
  // Get course from URL parameter or use first course by default
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for course ID in URL params
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course');
    if (courseId) {
      setSelectedCourseId(courseId);
    }
  }, []);

  const selectedCourse = selectedCourseId 
    ? getCourseById(selectedCourseId) || courses[0]
    : courses[0];

  // Debug useEffect to monitor mode state changes
  useEffect(() => {
    console.log('Study mode state changed to:', isStudyMode);
    console.log('Node mode state changed to:', isNodeMode);
  }, [isStudyMode, isNodeMode]);

  // Dummy function to create chat (will be replaced with RTK Query later)
  const createChat = async (title: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate dummy chat ID
    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      message: "Chat created successfully",
      chat: {
        id: chatId,
        title: title,
        userId: authUser?.id || "user-1",
        isArchived: false,
        isPinned: false,
        lastMessageId: null,
        lastMessageAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Set current input for study mode display
    setCurrentInput(content);

    // If this is the first message (empty state), create a new chat
    if (messages.length === 0 && !isStudyMode && !isNodeMode) {
      setIsLoading(true);
      setPendingMessage(content); // Store the message content

      try {
        // Create a new chat with the message content as title
        const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
        const data = await createChat(title);

        // Check if we have a valid chat ID before redirecting
        if (!data?.chat?.id) {
          toast.error("Failed to create chat: Invalid chat ID");
          setIsLoading(false);
          setPendingMessage('');
          return;
        }

        // Redirect to the new chat with the message as URL parameter
        const url = pendingMessage ? `/home/c/${data.chat.id}?message=${encodeURIComponent(pendingMessage)}` : `/home/c/${data.chat.id}`;
        router.push(url);
        setPendingMessage(''); // Clear the pending message
        return;
      } catch (error) {
        toast.error("Failed to create chat. Please try again.");
        console.error("Error creating chat:", error);
        setIsLoading(false);
        setPendingMessage(''); // Clear on error
        return;
      }
    }

    // For study mode, node mode, or existing chats, add the message
    const userMessage: Message = {
      id: generateUniqueId(),
      content,
      role: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiMessage: Message = {
        id: generateUniqueId(),
        content: isStudyMode
          ? `Sign language translation for: "${content}". The 3D model will now demonstrate the corresponding gestures.`
          : isNodeMode
            ? `Medical specialist team response for: "${content}". Your healthcare specialists are analyzing your query and will provide comprehensive medical insights.`
            : `I received your message: "${content}". This is a simulated response. In a real implementation, this would be an AI-generated response.`,
        role: 'assistant',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setCurrentInput(''); // Clear current input after processing
    }, 2000); // Longer delay for study mode to simulate processing
  };

  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleToggleStudyMode = () => {
    console.log('Study mode toggle clicked! Current state:', isStudyMode);
    const newState = !isStudyMode;
    console.log('Setting study mode to:', newState);
    setIsStudyMode(newState);
    // Clear current input when toggling modes
    setCurrentInput('');
  };

  const handleToggleNodeMode = () => {
    console.log('Node mode toggle clicked! Current state:', isNodeMode);
    const newState = !isNodeMode;
    console.log('Setting node mode to:', newState);
    setIsNodeMode(newState);
    // Clear current input when toggling modes
    setCurrentInput('');
    console.log('Node mode state updated to:', newState);
  };

  console.log('Rendering with isStudyMode:', isStudyMode, 'isNodeMode:', isNodeMode, 'messages.length:', messages.length);
  console.log('handleToggleStudyMode function:', handleToggleStudyMode);
  console.log('handleToggleNodeMode function:', handleToggleNodeMode);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full relative">
        <div className="sticky z-50 w-fit mx-auto" style={{ top: 'calc(var(--header-height) + 1rem)' }}>
          <TabsList className="h-12 bg-muted/80 backdrop-blur-md p-1 rounded-lg gap-1 border border-border shadow-lg">
            <TabsTrigger 
              value="course" 
              className="px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md transition-all duration-200 shadow-sm data-[state=active]:shadow-md font-medium"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Course
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md transition-all duration-200 shadow-sm data-[state=active]:shadow-md font-medium"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="course" className="flex-1 mt-0 p-0" style={{ paddingTop: 'calc(var(--header-height) + 1rem)' }}>
          {authLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading user data...</p>
              </div>
            </div>
          ) : user ? (
            <CourseOvaContainer 
              user={user} 
              course={selectedCourse}
              courses={courses}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No user data available</p>
                <p className="text-sm text-muted-foreground">Please try logging in again</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="flex-1 mt-0 p-0">
          <ChatContainer isStudyMode={isStudyMode}>
            {isStudyMode ? (
              <StudyModeLayout
                messages={messages}
                isLoading={isLoading}
                currentInput={currentInput}
              />
            ) : messages.length === 0 ? (
              <EmptyState onSelectPrompt={handleSelectPrompt} />
            ) : (
              <ChatWrapper
                messages={messages}
                isLoading={isLoading}
              />
            )}
          </ChatContainer>
          
          <ChatInput
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            isStudyMode={isStudyMode}
            onToggleStudyMode={handleToggleStudyMode}
            isNodeMode={isNodeMode}
            onToggleNodeMode={handleToggleNodeMode}
          />
        </TabsContent>
      </Tabs>
      
      {/* Node Workspace Modal */}
      <NodeWorkspaceModal
        isOpen={isNodeMode}
        onClose={() => setIsNodeMode(false)}
        chatId={undefined} // No chat context on home page
      />
    </>
  );
};