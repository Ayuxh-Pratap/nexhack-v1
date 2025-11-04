"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, MessageSquare } from "lucide-react";
import ChatContainer from "../../../_ui/components/chat-container";
import ChatWrapper from "../../../_ui/components/chat-wrapper";
import ChatInput from "../../../_ui/components/chat-input";
import StudyModeLayout from "../../../_ui/components/study-mode-layout";
import { NodeWorkspaceModal } from "../../../_ui/node/node-workspace-modal";
import CourseOvaContainer from "../../../_ui/components/course-container";
import { useCourseData } from "@/stores/course-mock-store";
import { useAuth } from "@/hooks/use-auth";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { User } from "@/types/user";

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
}

interface ChatPageProps {
    chatId: string;
}

// Utility function to generate unique IDs
const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function ChatPage({ chatId }: ChatPageProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialMessage, setHasInitialMessage] = useState(false);
    const [isStudyMode, setIsStudyMode] = useState(false);
    const [isNodeMode, setIsNodeMode] = useState(false);
    const [currentInput, setCurrentInput] = useState<string>('');
    const [activeTab, setActiveTab] = useState("course"); // Default to course
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMessageProcessed = useRef(false);
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

    // Get courses from store
    const { courses, getCourseById } = useCourseData();
    // In a real implementation, this would be fetched based on the chatId
    // For now, use first course by default
    const selectedCourse = courses[0];
    
    // Get lecture_id from URL params or course (for course-related chats)
    const lectureIdFromUrl = searchParams.get('lecture_id');
    const lectureId = lectureIdFromUrl || selectedCourse?.lectures?.[0]?.id || null;
    
    // Find the lecture and get its video_url
    const selectedLecture = selectedCourse?.lectures?.find(l => l.id === lectureId);
    const lectureVideoUrl = selectedLecture?.video_url || null;

    // Use chat stream hook
    const aiMessageIdRef = useRef<string | null>(null);
    const { sendMessage: streamChat, isStreaming: isStreamingChat } = useChatStream({
        onChunk: (chunk: string) => {
            // Update the last AI message with the new chunk
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    // Update existing message
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...lastMessage,
                            content: lastMessage.content + chunk
                        }
                    ];
                } else {
                    // Create new AI message
                    const aiMessage: Message = {
                        id: generateUniqueId(),
                        content: chunk,
                        role: 'assistant',
                        created_at: new Date().toISOString()
                    };
                    aiMessageIdRef.current = aiMessage.id;
                    return [...prev, aiMessage];
                }
            });
        },
        onComplete: async () => {
            // Save the complete AI message using the ref to get latest state
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    // Save message asynchronously
                    createMessage(chatId, lastMessage.content, 'assistant').catch(error => {
                        console.error("Failed to save AI message:", error);
                    });
                }
                return prev;
            });
            setIsLoading(false);
            setCurrentInput('');
            aiMessageIdRef.current = null;
        },
        onError: (error: Error) => {
            console.error("Chat stream error:", error);
            setIsLoading(false);
            aiMessageIdRef.current = null;
        }
    });
    
    // Dummy function to get messages (will be replaced with RTK Query later)
    const getMessages = async (chatId: string) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Return dummy messages (in real app, this would fetch from backend)
        return {
            messages: [],
            total: 0,
            hasMore: false
        };
    };

    // Dummy function to create message (will be replaced with RTK Query later)
    const createMessage = async (chatId: string, content: string, messageType: 'user' | 'assistant') => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Just log for now (will be replaced with actual API call)
        console.log('Message saved (dummy):', { chatId, content, messageType });
        
        return {
            success: true,
            message: {
                id: generateUniqueId(),
                chatId,
                content,
                messageType,
                createdAt: new Date().toISOString()
            }
        };
    };

    // Dummy function to generate AI response (will be replaced with RTK Query later)
    const generateAIResponse = async (messages: Array<{ role: string; content: string }>, config: any) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate dummy AI response based on mode
        let content = "";
        if (config.isStudyMode) {
            content = `Sign language translation for: "${messages[messages.length - 1]?.content}". The 3D model will now demonstrate the corresponding gestures.`;
        } else if (config.useNodeBasedPrompting) {
            content = `Academic specialist team response for: "${messages[messages.length - 1]?.content}". Your academic specialists are analyzing your query and will provide comprehensive insights.`;
        } else {
            content = `I understand your question: "${messages[messages.length - 1]?.content}". As your academic mentor, I'm here to help you with placements, higher studies, and career guidance. This is a simulated response - the actual FastAPI backend will provide real AI-powered responses.`;
        }
        
        return {
            success: true,
            content: content
        };
    };

    // Load messages on mount (dummy data for now)
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    useEffect(() => {
        const loadMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const data = await getMessages(chatId);
                if (data?.messages) {
                    const formattedMessages: Message[] = data.messages.map((msg: any) => ({
                        id: msg.id,
                        content: msg.content,
                        role: msg.messageType === 'assistant' ? 'assistant' : 'user',
                        created_at: msg.createdAt
                    }));
                    formattedMessages.sort((a, b) => 
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );
                    setMessages(formattedMessages);
                }
            } catch (error) {
                console.error("Failed to load messages:", error);
                toast.error("Failed to load chat history");
            } finally {
                setIsLoadingMessages(false);
            }
        };
        
        if (chatId && chatId !== 'undefined') {
            loadMessages();
        }
    }, [chatId]);

    // Check if chatId is valid
    useEffect(() => {
        if (!chatId || chatId === 'undefined') {
            toast.error("Invalid chat ID");
            router.push('/home');
            return;
        }
    }, [chatId, router]);


    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Set current input for study mode display
        setCurrentInput(content);

        // Check if message already exists to prevent duplicates
        const messageExists = messages.some(msg => 
            msg.content === content && msg.role === 'user'
        );
        
        if (messageExists) {
            console.log('Message already exists, skipping...');
            return;
        }

        // Add user message immediately to UI with optimized state update
        const userMessage: Message = {
            id: generateUniqueId(),
            content,
            role: 'user',
            created_at: new Date().toISOString()
        };

        // Immediate state update for seamless UI
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Save user message
            await createMessage(chatId, content, 'user');

            // If node mode is active, show success toast instead of calling backend
            if (isNodeMode) {
                toast.success("Node mode active!", {
                    description: "Your academic specialist team is processing your query. This is a frontend-only demo.",
                    duration: 3000,
                });
                setIsLoading(false);
                setCurrentInput('');
                return;
            }

            // Start streaming chat response using SSE
            // Send query and video_url if lecture is available
            await streamChat(content, lectureVideoUrl);
        } catch (error) {
            console.error("Failed to send message:", error);
            // Fallback error message
            const errorMessage: Message = {
                id: generateUniqueId(),
                content: "I apologize, but I'm having trouble generating a response right now. Please try again.",
                role: 'assistant',
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }

        // Clear current input after processing
        setCurrentInput('');
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
    };

    const handleSignWord = (word: string) => {
        // For main chat page, suggest switching to study mode for full experience
        toast.info(`To see "${word}" in sign language, switch to Study Mode!`, {
            action: {
                label: "Study Mode",
                onClick: () => setIsStudyMode(true)
            }
        });
    };

    // Handle initial message from URL params - only once
    useEffect(() => {
        if (initialMessageProcessed.current) return;
        
        const initialMessage = searchParams.get('message');
        if (initialMessage && chatId && chatId !== 'undefined') {
            initialMessageProcessed.current = true;
            setHasInitialMessage(true);
            
            // Store the message in a ref to prevent re-processing
            const messageToSend = initialMessage;
            
            // Remove the message from URL to prevent re-sending
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('message');
            window.history.replaceState({}, '', newUrl.toString());
            
            // Use setTimeout to ensure URL is updated before sending message
            setTimeout(() => {
                handleSendMessage(messageToSend);
            }, 0);
        }
    }, [chatId]); // Only depend on chatId, not searchParams

    // Don't render if chatId is invalid
    if (!chatId || chatId === 'undefined') {
        return null;
    }

    // Show loading state while fetching messages
    if (isLoadingMessages && messages.length === 0) {
        return (
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
                    {user ? (
                        <CourseOvaContainer 
                            user={user} 
                            course={selectedCourse}
                            courses={courses}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-muted-foreground">Loading user data...</p>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="chat" className="flex-1 mt-0 p-0">
                    <ChatContainer isStudyMode={isStudyMode}>
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <div className="text-muted-foreground">Loading chat history...</div>
                        </div>
                    </ChatContainer>
                </TabsContent>
            </Tabs>
        );
    }

    // Show empty state if no messages and not loading
    if (messages.length === 0 && !isLoading && !isLoadingMessages) {
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
                        {user ? (
                            <CourseOvaContainer 
                                user={user} 
                                course={selectedCourse}
                                courses={courses}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <p className="text-muted-foreground">Loading user data...</p>
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
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <div className="text-muted-foreground text-center">
                                        <p className="text-lg font-medium">No messages yet</p>
                                        <p className="text-sm">Start a conversation by typing a message below.</p>
                                    </div>
                                </div>
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
            </>
        );
    }

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
                    {user ? (
                        <CourseOvaContainer 
                            user={user} 
                            course={selectedCourse}
                            courses={courses}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-muted-foreground">Loading user data...</p>
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
                        ) : (
                            <ChatWrapper
                                messages={messages}
                                isLoading={isLoading}
                                onSignWord={handleSignWord}
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
                chatId={chatId} // Pass chat context for node activation
            />
        </>
    );
}
