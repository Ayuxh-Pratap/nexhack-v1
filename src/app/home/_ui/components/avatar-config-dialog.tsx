"use client";

import { useState } from "react";
import { X, Settings, User, Sliders, Check, ChevronDown, Camera } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AvatarConfigDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar: string;
    onAvatarChange: (avatar: string) => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    pause: number;
    onPauseChange: (pause: number) => void;
    cameraY: number;
    onCameraYChange: (y: number) => void;
    cameraZ: number;
    onCameraZChange: (z: number) => void;
    lookAtY: number;
    onLookAtYChange: (y: number) => void;
}

const TABS = [
    { value: "avatar", title: "Avatar", icon: User },
    { value: "animation", title: "Animation", icon: Sliders },
    { value: "camera", title: "Camera", icon: Camera },
] as const;

const AVATAR_OPTIONS = [
    {
        value: "ybot",
        label: "Y Bot",
        description: "Light blue humanoid for sign language",
        image: "/models/ybot.png"
    },
    {
        value: "xbot",
        label: "X Bot",
        description: "Alternative avatar option",
        image: "/models/xbot.png"
    },
] as const;

const SPEED_PRESETS = [
    {
        name: "Beginner",
        speed: 0.05,
        pause: 1200,
        description: "Slow and clear gestures"
    },
    {
        name: "Intermediate",
        speed: 0.15,
        pause: 800,
        description: "Balanced speed and clarity"
    },
    {
        name: "Advanced",
        speed: 0.3,
        pause: 400,
        description: "Fast and fluid gestures"
    },
    {
        name: "Expert",
        speed: 0.45,
        pause: 200,
        description: "Very fast for experienced users"
    },
] as const;

const CAMERA_PRESETS = [
    {
        name: "Default",
        cameraY: 1.4,
        cameraZ: 1.6,
        lookAtY: 1.5,
        description: "Default balanced view"
    },
    {
        name: "Lower",
        cameraY: 1.0,
        cameraZ: 1.6,
        lookAtY: 1.5,
        description: "Lower angle view"
    },
    {
        name: "Higher",
        cameraY: 1.8,
        cameraZ: 1.6,
        lookAtY: 1.5,
        description: "Higher angle view"
    },
    {
        name: "Highest",
        cameraY: 1.8,
        cameraZ: 2.2,
        lookAtY: 1.4,
        description: "Optimal upper body view"
    },
] as const;

export default function AvatarConfigDialog({
    isOpen,
    onClose,
    currentAvatar,
    onAvatarChange,
    speed,
    onSpeedChange,
    pause,
    onPauseChange,
    cameraY,
    onCameraYChange,
    cameraZ,
    onCameraZChange,
    lookAtY,
    onLookAtYChange
}: AvatarConfigDialogProps) {
    const [isActive, setIsActive] = useState<string>("avatar");

    const handleAvatarSelect = (avatarValue: string) => {
        onAvatarChange(avatarValue);
    };

    const handlePresetSelect = (preset: typeof SPEED_PRESETS[number]) => {
        onSpeedChange(preset.speed);
        onPauseChange(preset.pause);
    };

    const handleCameraPresetSelect = (preset: typeof CAMERA_PRESETS[number]) => {
        onCameraYChange(preset.cameraY);
        onCameraZChange(preset.cameraZ);
        onLookAtYChange(preset.lookAtY);
    };

    const getCurrentPreset = () => {
        return SPEED_PRESETS.find(preset =>
            Math.abs(preset.speed - speed) < 0.01 && Math.abs(preset.pause - pause) < 50
        );
    };

    const getCurrentCameraPreset = () => {
        return CAMERA_PRESETS.find(preset =>
            Math.abs(preset.cameraY - cameraY) < 0.1 &&
            Math.abs(preset.cameraZ - cameraZ) < 0.1 &&
            Math.abs(preset.lookAtY - lookAtY) < 0.1
        );
    };

    return (
        <PopoverContent className="w-80 p-4" align="end">
            {/* Header */}
            <div className="flex items-center justify-between w-full pb-3 border-b border-border">
                <h3 className="text-sm font-semibold">Avatar Configuration</h3>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    className="h-6 w-6 p-0"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* Content */}
            <div className="w-full">
                <Tabs
                    value={isActive}
                    defaultValue="avatar"
                    onValueChange={(value) => setIsActive(value)}
                    className="w-full"
                >
                    {/* Compact Tabs */}
                    <TabsList className="grid w-full grid-cols-3 h-8 mb-3">
                        {TABS.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="text-xs h-6"
                            >
                                <tab.icon className="w-3 h-3 mr-1" />
                                {tab.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Avatar Selection Tab */}
                    <TabsContent value="avatar" className="space-y-3">
                        <div className="space-y-2">
                            {AVATAR_OPTIONS.map((avatar) => {
                                const isSelected = currentAvatar === avatar.value;
                                return (
                                    <div
                                        key={avatar.value}
                                        className={cn(
                                            "flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-all",
                                            isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                        )}
                                        onClick={() => handleAvatarSelect(avatar.value)}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={avatar.image} alt={avatar.label} />
                                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                                    {avatar.label.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                                    <Check className="w-2 h-2" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium truncate">{avatar.label}</h4>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {avatar.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* Animation Settings Tab */}
                    <TabsContent value="animation" className="space-y-4">
                        {/* Presets */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Speed Presets</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {SPEED_PRESETS.map((preset) => {
                                    const isActive = getCurrentPreset()?.name === preset.name;
                                    return (
                                        <Button
                                            key={preset.name}
                                            size="sm"
                                            variant={isActive ? "default" : "outline"}
                                            className="h-8 text-xs"
                                            onClick={() => handlePresetSelect(preset)}
                                        >
                                            {preset.name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Controls */}
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Speed</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {Math.round(speed * 100) / 100}
                                    </span>
                                </div>
                                <Slider
                                    value={[speed]}
                                    onValueChange={(value) => onSpeedChange(value[0])}
                                    max={0.5}
                                    min={0.05}
                                    step={0.01}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Pause</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {pause}ms
                                    </span>
                                </div>
                                <Slider
                                    value={[pause]}
                                    onValueChange={(value) => onPauseChange(value[0])}
                                    max={2000}
                                    min={0}
                                    step={100}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                onSpeedChange(0.1);
                                onPauseChange(800);
                            }}
                            className="w-full h-7 text-xs"
                        >
                            Reset to Default
                        </Button>
                    </TabsContent>

                    {/* Camera Settings Tab */}
                    <TabsContent value="camera" className="space-y-4">
                        {/* Presets */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium">Camera Presets</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {CAMERA_PRESETS.map((preset) => {
                                    const isActive = getCurrentCameraPreset()?.name === preset.name;
                                    return (
                                        <Button
                                            key={preset.name}
                                            size="sm"
                                            variant={isActive ? "default" : "outline"}
                                            className="h-8 text-xs"
                                            onClick={() => handleCameraPresetSelect(preset)}
                                        >
                                            {preset.name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Controls */}
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Camera Height (Y)</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {Math.round(cameraY * 100) / 100}
                                    </span>
                                </div>
                                <Slider
                                    value={[cameraY]}
                                    onValueChange={(value) => onCameraYChange(value[0])}
                                    max={3.0}
                                    min={0.5}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Camera Distance (Z)</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {Math.round(cameraZ * 100) / 100}
                                    </span>
                                </div>
                                <Slider
                                    value={[cameraZ]}
                                    onValueChange={(value) => onCameraZChange(value[0])}
                                    max={3.0}
                                    min={0.8}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Look At Height (Y)</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {Math.round(lookAtY * 100) / 100}
                                    </span>
                                </div>
                                <Slider
                                    value={[lookAtY]}
                                    onValueChange={(value) => onLookAtYChange(value[0])}
                                    max={2.0}
                                    min={0.0}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                onCameraYChange(1.4);
                                onCameraZChange(1.6);
                                onLookAtYChange(1.5);
                            }}
                            className="w-full h-7 text-xs"
                        >
                            Reset to Default
                        </Button>
                    </TabsContent>
                </Tabs>
            </div>
        </PopoverContent>
    );
}