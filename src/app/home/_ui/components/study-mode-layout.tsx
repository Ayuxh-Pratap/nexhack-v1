"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import ChatWrapper from "./chat-wrapper";
import AvatarConfigDialog from "./avatar-config-dialog";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as words from "../model/Animations/words";
import * as alphabets from "../model/Animations/alphabets";
import { defaultPose } from "../model/Animations/defaultPose";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseVeloraResponse } from "@/utils/velora-parser";
import MessageOptions from "./message-options";

// Import the avatar models
const ybot = "/models/ybot.glb";
const xbot = "/models/xbot.glb";

// Custom hook for localStorage
const useLocalStorage = <T,>(key: string, defaultValue: T) => {
    const [value, setValue] = useState<T>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        }
        return defaultValue;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }, [key, value]);

    return [value, setValue] as const;
};

interface Props {
    messages: Array<{
        id: string;
        content: string;
        role: 'user' | 'assistant';
        created_at: string;
    }>;
    isLoading: boolean;
    currentInput?: string;
}

interface AnimationRef {
    flag: boolean;
    pending: boolean;
    animations: any[];
    characters: string[];
    scene?: THREE.Scene;
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.PerspectiveCamera;
    avatar?: THREE.Group;
    animate?: () => void;
}

const StudyModeLayout = ({ messages, isLoading, currentInput }: Props) => {
    const [showChatHistory, setShowChatHistory] = useState(false);
    const [showAvatarConfig, setShowAvatarConfig] = useState(false);
    const [speed, setSpeed] = useLocalStorage("study-mode-speed", 0.1);
    const [pause, setPause] = useLocalStorage("study-mode-pause", 800);
    const [displayText, setDisplayText] = useState("");
    const [modelLoaded, setModelLoaded] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useLocalStorage("study-mode-avatar", "ybot");
    const [lastAnimatedMessageId, setLastAnimatedMessageId] = useState<string>("");
    const [cameraY, setCameraY] = useLocalStorage("study-mode-camera-y", 1.4);
    const [cameraZ, setCameraZ] = useLocalStorage("study-mode-camera-z", 1.6);
    const [lookAtY, setLookAtY] = useLocalStorage("study-mode-lookat-y", 1.5);
    const [isAnimating, setIsAnimating] = useState(false);

    const componentRef = useRef<AnimationRef>({
        flag: false,
        pending: false,
        animations: [],
        characters: []
    });
    const { current: ref } = componentRef;
    const canvasRef = useRef<HTMLDivElement>(null);

    // Get current avatar model path - memoized
    const getCurrentAvatarPath = useCallback(() => {
        return currentAvatar === "xbot" ? xbot : ybot;
    }, [currentAvatar]);

    // Initialize 3D scene - ONLY when avatar changes
    useEffect(() => {
        if (!canvasRef.current) return;

        ref.flag = false;
        ref.pending = false;
        ref.animations = [];
        ref.characters = [];

        ref.scene = new THREE.Scene();
        ref.scene.background = new THREE.Color(0xf8fafc); // Light background

        // Lighting
        const spotLight = new THREE.SpotLight(0xffffff, 100);
        spotLight.position.set(0, 3, 3);
        ref.scene.add(spotLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        ref.scene.add(ambientLight);

        // Add directional light for better visibility
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 2, 2);
        ref.scene.add(directionalLight);

        // Renderer
        ref.renderer = new THREE.WebGLRenderer({ antialias: true });
        const container = canvasRef.current;

        // Set explicit dimensions
        const containerWidth = container.clientWidth || 800;
        const containerHeight = container.clientHeight || 600;

        ref.renderer.setSize(containerWidth, containerHeight);
        ref.renderer.setClearColor(0xf8fafc);

        // Camera
        ref.camera = new THREE.PerspectiveCamera(
            30,
            containerWidth / containerHeight,
            0.1,
            1000
        );
        ref.camera.position.z = 1.6;
        ref.camera.position.y = 0.8; // Move camera higher to focus on upper body
        ref.camera.lookAt(0, 0, 0); // Look at upper body area

        // Clear and append canvas
        container.innerHTML = "";
        container.appendChild(ref.renderer.domElement);

        // Load Y bot model
        const loader = new GLTFLoader();
        loader.load(
            getCurrentAvatarPath(),
            (gltf: any) => {
                // Prevent multiple loads
                if (modelLoaded) return;

                // Remove any existing avatar before adding new one
                if (ref.avatar && ref.scene) {
                    ref.scene.remove(ref.avatar);
                }

                gltf.scene.traverse((child: any) => {
                    if (child.type === 'SkinnedMesh') {
                        child.frustumCulled = false;
                    }
                });
                ref.avatar = gltf.scene;

                // Scale and position the model properly for center alignment
                if (ref.avatar) {
                    // Center the model in the scene
                    ref.avatar.scale.set(1, 1, 1);
                    ref.avatar.position.set(0, 0.1, 0); // Move model up slightly to focus on upper body
                    ref.avatar.rotation.set(0, 0, 0);

                    // Ensure the model is visible and centered
                    ref.avatar.traverse((child: any) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                }

                if (ref.scene && ref.avatar) {
                    ref.scene.add(ref.avatar);
                }
                defaultPose(ref);

                // Apply current camera settings
                if (ref.camera) {
                    ref.camera.position.z = cameraZ;
                    ref.camera.position.y = cameraY;
                    ref.camera.lookAt(0, lookAtY, 0);
                }

                // Mark model as loaded
                setModelLoaded(true);

                // Start rendering
                if (ref.renderer && ref.scene && ref.camera) {
                    ref.renderer.render(ref.scene, ref.camera);
                }
            },
            (xhr: any) => {
                console.log('Loading progress:', (xhr.loaded / xhr.total * 100) + '%');
            },
            (error: any) => {
                console.error('Error loading model:', error);
            }
        );

        // Animation loop - optimized to prevent React interference
        ref.animate = () => {
            if (ref.animations.length === 0) {
                ref.pending = false;
                // Use requestAnimationFrame to ensure smooth state update
                requestAnimationFrame(() => setIsAnimating(false));
                // Continue rendering even when no animations
                if (ref.renderer && ref.scene && ref.camera) {
                    ref.renderer.render(ref.scene, ref.camera);
                }
                return;
            }
            if (ref.animate) {
                requestAnimationFrame(ref.animate);
            }

            if (ref.animations[0].length) {
                if (!ref.flag) {
                    if (ref.animations[0][0] === 'add-text') {
                        ref.animations.shift();
                    } else {
                        for (let i = 0; i < ref.animations[0].length;) {
                            let [boneName, action, axis, limit, sign] = ref.animations[0][i];
                            const bone = ref.avatar?.getObjectByName(boneName) as any;
                            if (sign === "+" && bone?.[action]?.[axis] < limit) {
                                if (bone?.[action]?.[axis] !== undefined) {
                                    bone[action][axis] += speed;
                                    bone[action][axis] = Math.min(bone[action][axis], limit);
                                }
                                i++;
                            } else if (sign === "-" && bone?.[action]?.[axis] > limit) {
                                if (bone?.[action]?.[axis] !== undefined) {
                                    bone[action][axis] -= speed;
                                    bone[action][axis] = Math.max(bone[action][axis], limit);
                                }
                                i++;
                            } else {
                                ref.animations[0].splice(i, 1);
                            }
                        }
                    }
                }
            } else {
                ref.flag = true;
                setTimeout(() => {
                    ref.flag = false;
                }, pause);
                ref.animations.shift();
            }
            if (ref.renderer && ref.scene && ref.camera) {
                ref.renderer.render(ref.scene, ref.camera);
            }
        };

        // Start initial render loop
        const renderLoop = () => {
            if (ref.renderer && ref.scene && ref.camera) {
                ref.renderer.render(ref.scene, ref.camera);
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop();

        // Handle window resize
        const handleResize = () => {
            if (!container || !ref.camera || !ref.renderer) return;
            const newWidth = container.clientWidth || 800;
            const newHeight = container.clientHeight || 600;

            ref.camera.aspect = newWidth / newHeight;
            ref.camera.updateProjectionMatrix();
            ref.renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        // Add ResizeObserver for more responsive layout changes
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        if (container) {
            resizeObserver.observe(container);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();

            // Clean up the 3D model
            if (ref.avatar && ref.scene) {
                ref.scene.remove(ref.avatar);
            }

            // Dispose of the renderer
            if (ref.renderer) {
                ref.renderer.dispose();
            }

            // Clear any pending animations
            ref.animations = [];
            ref.pending = false;
        };
    }, [currentAvatar]); // ONLY depend on currentAvatar

    // Update camera settings without triggering scene rebuild
    useEffect(() => {
        if (modelLoaded && ref.camera) {
            ref.camera.position.z = cameraZ;
            ref.camera.position.y = cameraY;
            ref.camera.lookAt(0, lookAtY, 0);
            
            // Re-render to show camera changes
            if (ref.renderer && ref.scene) {
                ref.renderer.render(ref.scene, ref.camera);
            }
        }
    }, [modelLoaded, cameraY, cameraZ, lookAtY]);

    // Function to animate sign language - memoized
    const animateSignLanguage = useCallback((text: string) => {
        if (!ref.avatar) return;

        // Set the clean display text immediately
        setDisplayText(text);
        setIsAnimating(true);
        const str = text.toUpperCase();
        const strWords = str.split(' ');

        for (let word of strWords) {
            if ((words as any)[word]) {
                ref.animations.push(['add-text', word + ' ']);
                (words as any)[word](ref);
            } else {
                for (const [index, ch] of word.split('').entries()) {
                    if (index === word.length - 1)
                        ref.animations.push(['add-text', ch + ' ']);
                    else
                        ref.animations.push(['add-text', ch]);
                    if ((alphabets as any)[ch]) {
                        (alphabets as any)[ch](ref);
                    }
                }
            }
        }

        if (ref.pending === false) {
            ref.pending = true;
            if (ref.animate) {
                ref.animate();
            }
        }
    }, []);

    // Function to stop ongoing animation - memoized
    const stopAnimation = useCallback(() => {
        ref.animations = [];
        ref.pending = false;
        setIsAnimating(false);
        setDisplayText("");
        // Reset to default pose
        if (ref.avatar) {
            defaultPose(ref);
        }
    }, []);

    // Memoized event handlers
    const handleToggleChatHistory = useCallback(() => {
        setShowChatHistory(!showChatHistory);
    }, [showChatHistory]);

    const handleAvatarChange = useCallback((avatar: string) => {
        setCurrentAvatar(avatar);
        setModelLoaded(false); // Reset to reload new avatar
    }, []);

    // Smart auto-animation: only animate <sign> blocks from Velora responses
    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant' && lastMessage.id !== lastAnimatedMessageId) {
                setLastAnimatedMessageId(lastMessage.id);

                // Check if this is a Velora response with <sign> blocks
                if (lastMessage.content.includes('<sign>')) {
                    const parsed = parseVeloraResponse(lastMessage.content);
                    // Only auto-animate if there are sign blocks
                    if (parsed.hasSignContent && parsed.allSignContent.length > 0) {
                        // Animate the first sign block only
                        animateSignLanguage(parsed.allSignContent[0]);
                    }
                }
            }
        }
    }, [messages.length, isLoading, lastAnimatedMessageId]); // Optimized dependencies

    // Handle canvas resize when chat history is toggled
    useEffect(() => {
        // Small delay to ensure DOM has updated
        const timer = setTimeout(() => {
            if (canvasRef.current && ref.renderer && ref.camera) {
                const container = canvasRef.current;
                const newWidth = container.clientWidth || 800;
                const newHeight = container.clientHeight || 600;

                ref.camera.aspect = newWidth / newHeight;
                ref.camera.updateProjectionMatrix();
                ref.renderer.setSize(newWidth, newHeight);

                // Ensure camera is properly positioned for centering
                ref.camera.position.z = 1.6;
                ref.camera.position.y = 1.8; // Move camera higher to focus on upper body
                ref.camera.lookAt(0, 1.5, 0); // Look at upper body area

                // Re-render to ensure model is visible and centered
                if (ref.scene) {
                    ref.renderer.render(ref.scene, ref.camera);
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [showChatHistory]);

    return (
        <div className="relative w-full h-[calc(100vh-57px)] flex flex-col overflow-hidden">
            {/* Blurred Classroom Background */}
            <div className="fixed inset-0 -z-10">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat opacity-100"
                    style={{
                        backgroundImage: "url('/images/classroom.jpg')", // Using existing image as placeholder
                        filter: "blur(8px)"
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
            </div>

            {/* Main Content Area - Fixed height, no scrolling, with top padding for fixed header */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* 3D Model Area - Fixed position, always visible */}
                <div className={cn(
                    "flex flex-col items-center justify-center p-8 transition-all duration-500 ease-in-out flex-shrink-0",
                    showChatHistory ? "w-1/2" : "w-full"
                )}>
                    {/* 3D Model Container */}
                    <div className="relative w-full max-w-4xl aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden">
                        {/* Toggle Button - Top Right Corner */}
                        <button
                            onClick={handleToggleChatHistory}
                            className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 rounded-md transition-all duration-300 ease-in-out z-10"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{showChatHistory ? "Hide" : "Show"} Chat History</span>
                        </button>

                        {/* Configure Avatar Button - Top Left Corner */}
                        <Popover open={showAvatarConfig} onOpenChange={setShowAvatarConfig}>
                            <PopoverTrigger asChild>
                                <button className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 text-sm bg-accent hover:bg-accent/80 rounded-md transition-all duration-300 ease-in-out z-10">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Configure Avatar</span>
                                </button>
                            </PopoverTrigger>
                            <AvatarConfigDialog
                                isOpen={showAvatarConfig}
                                onClose={() => setShowAvatarConfig(false)}
                                currentAvatar={currentAvatar}
                                onAvatarChange={handleAvatarChange}
                                speed={speed}
                                onSpeedChange={setSpeed}
                                pause={pause}
                                onPauseChange={setPause}
                                cameraY={cameraY}
                                onCameraYChange={setCameraY}
                                cameraZ={cameraZ}
                                onCameraZChange={setCameraZ}
                                lookAtY={lookAtY}
                                onLookAtYChange={setLookAtY}
                            />
                        </Popover>

                        {/* 3D Model Canvas */}
                        <div
                            ref={canvasRef}
                            className="w-full h-full min-h-[400px] bg-blue-50 relative"
                            style={{ width: '100%', height: '100%' }}
                        />

                        {/* Overlay for text display and controls */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Sign Language Translation
                                </h3>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <span>Speed: {Math.round(speed * 100) / 100}</span>
                                    <span>Pause: {pause}ms</span>
                                </div>
                            </div>

                            {/* Status Display - Simple and compact */}
                            <div className="text-sm text-gray-600 mb-2 min-h-[20px]">
                                {isLoading ? "Processing..." :
                                    isAnimating ? `Animating: ${displayText}` :
                                        "Type a message to see sign language translation"}
                            </div>

                            {/* Animation Controls */}
                            <div className="flex items-center justify-between">
                                {/* Stop Animation Button */}
                                {isAnimating && (
                                    <button
                                        onClick={stopAnimation}
                                        className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        Stop Animation
                                    </button>
                                )}

                                {/* Manual Animation Trigger */}
                                {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isLoading && !isAnimating && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">AI Response Ready</span>
                                        <button
                                            onClick={() => {
                                                const lastMessage = messages[messages.length - 1];
                                                if (lastMessage.role === 'assistant') {
                                                    // Check if it's a Velora response
                                                    if (lastMessage.content.includes('<sign>')) {
                                                        const parsed = parseVeloraResponse(lastMessage.content);
                                                        if (parsed.hasSignContent) {
                                                            // Animate all sign content concatenated
                                                            animateSignLanguage(parsed.allSignContent.join(' '));
                                                        }
                                                    } else {
                                                        // For regular responses, animate the whole content
                                                        animateSignLanguage(lastMessage.content);
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Animate Response
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Current Input Display - Only show if short */}
                            {currentInput && currentInput.length < 50 && (
                                <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                                    <span className="font-medium">Input:</span> {currentInput}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat History Sidebar - Independent scrolling */}
                <div className={cn(
                    "flex flex-col bg-background border-l border-border/50 transition-all duration-500 ease-in-out relative",
                    showChatHistory ? "w-1/2 opacity-100" : "w-0 opacity-0"
                )}>
                    {/* Fade Effect Overlay - Top to Bottom */}
                    <div
                        className="
                            absolute top-0 left-0 right-0 h-16
                            pointer-events-none z-10
                            bg-gradient-to-b
                            from-accent/70 via-accent/30 to-transparent
                            dark:from-background/80 dark:via-background/40 dark:to-transparent
                        "
                    />

                    {/* Chat Messages Area - Scrollable container */}
                    <div className="flex-1 overflow-y-auto relative">
                        <div className="flex flex-col-reverse min-h-full">
                            <ChatWrapper
                                messages={messages}
                                isLoading={isLoading}
                                onSignWord={animateSignLanguage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(StudyModeLayout);