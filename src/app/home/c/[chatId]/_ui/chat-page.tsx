"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, MessageSquare } from "lucide-react";
import ChatContainer from "../../../_ui/components/chat-container";
import ChatWrapper from "../../../_ui/components/chat-wrapper";
import ChatInput from "../../../_ui/components/chat-input";
import StudyModeLayout from "../../../_ui/components/study-mode-layout";
import { NodeWorkspaceModal } from "../../../_ui/node/node-workspace-modal";
import CourseOvaContainer from "../../../_ui/components/course-container";
import { prepareVeloraAIRequest } from "@/utils/velora-client-utils";
import { useCourseData } from "@/stores/course-mock-store";

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
    const trpc = useTRPC();

    // Fetch user profile
    const { data: user } = useSuspenseQuery(trpc.user.getProfile.queryOptions());

    // Get courses from store
    const { courses, getCourseById } = useCourseData();
    // In a real implementation, this would be fetched based on the chatId
    // For now, use first course by default
    const selectedCourse = courses[0];
    
    // Fetch existing messages using tRPC
    const { 
        data: messagesData, 
        error: messagesError, 
        isLoading: isLoadingMessages,
        refetch: refetchMessages 
    } = useSuspenseQuery(trpc.message.getMessages.queryOptions({ 
        chatId,
        limit: 50,
        offset: 0,
        includeDeleted: false
    }));

    // Create message mutation
    const createMessageMutation = useMutation(
        trpc.message.createMessage.mutationOptions({
            onSuccess: (data: any) => {
                // Message was saved successfully
                console.log('Message saved:', data);
                // Refetch messages to get the latest data
                refetchMessages();
            },
            onError: (error: any) => {
                toast.error("Failed to save message");
                console.error("Error saving message:", error);
            }
        })
    );

    // AI response mutation
    const aiResponseMutation = useMutation(
        trpc.ai.generateResponse.mutationOptions({
            onSuccess: (data: any) => {
                if (data.success && data.content) {
                    const aiMessage: Message = {
                        id: generateUniqueId(),
                        content: data.content,
                        role: 'assistant',
                        created_at: new Date().toISOString()
                    };

                    // Immediate state update for seamless UI
                    setMessages(prev => [...prev, aiMessage]);

                    // Save AI message to database
                    createMessageMutation.mutateAsync({
                        chatId,
                        content: data.content,
                        messageType: 'assistant'
                    }).catch(error => {
                        console.error("Failed to save AI message:", error);
                    });
                } else {
                    // Fallback error message
                    const errorMessage: Message = {
                        id: generateUniqueId(),
                        content: "I apologize, but I'm having trouble generating a response right now. Please try again.",
                        role: 'assistant',
                        created_at: new Date().toISOString()
                    };
                    // Immediate state update for seamless UI
                    setMessages(prev => [...prev, errorMessage]);
                }
                setIsLoading(false);
            },
            onError: (error: any) => {
                console.error("AI response error:", error);
                // Fallback error message
                const errorMessage: Message = {
                    id: generateUniqueId(),
                    content: "I apologize, but I'm having trouble generating a response right now. Please try again.",
                    role: 'assistant',
                    created_at: new Date().toISOString()
                };
                // Immediate state update for seamless UI
                setMessages(prev => [...prev, errorMessage]);
                setIsLoading(false);
            }
        })
    );

    // Check if chatId is valid
    useEffect(() => {
        if (!chatId || chatId === 'undefined') {
            toast.error("Invalid chat ID");
            router.push('/home');
            return;
        }
    }, [chatId, router]);

    // Handle messages error
    useEffect(() => {
        if (messagesError) {
            toast.error("Failed to load chat history");
            console.error("Messages error:", messagesError);
        }
    }, [messagesError]);

    // Load existing messages when data is fetched
    useEffect(() => {
        if (messagesData?.messages) {
            const formattedMessages: Message[] = messagesData.messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                role: msg.messageType === 'assistant' ? 'assistant' : 'user',
                created_at: msg.createdAt
            }));
            
            // Sort messages by creation time (oldest first for display)
            formattedMessages.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            setMessages(formattedMessages);
        }
    }, [messagesData]);

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
            // Save user message to database
            await createMessageMutation.mutateAsync({
                chatId,
                content,
                messageType: 'user'
            });

            // Prepare messages for AI (include conversation history)
            const messagesForAI = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add the new user message
            messagesForAI.push({
                role: 'user',
                content: content
            });

            // Generate AI response with appropriate mode
            const aiRequest = prepareVeloraAIRequest(messagesForAI, {
                provider: 'gemini',
                temperature: 0.7,
                maxTokens: 2048,
                isStudyMode: isStudyMode,
                chatId: chatId, // Include chatId for node-based prompting
                useNodeBasedPrompting: isNodeMode // Enable node-based prompting in node mode
            });

            await aiResponseMutation.mutateAsync(aiRequest as any);

        } catch (error) {
            console.error("Failed to send message:", error);
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
                    <CourseOvaContainer 
                        user={user} 
                        course={selectedCourse}
                        courses={courses}
                    />
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
                        <CourseOvaContainer 
                            user={user} 
                            course={selectedCourse}
                            courses={courses}
                        />
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
                    <CourseOvaContainer 
                        user={user} 
                        course={selectedCourse}
                        courses={courses}
                    />
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
