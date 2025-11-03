"use client";

import { useState } from "react";
import type { User } from "@/types/user";
import type { Course, CourseMessage, Instructor } from "@/types/course";
import { Play, CheckCircle2, Circle, BookOpen, Clock, FileText, File, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCourseData } from "@/stores/course-mock-store";

interface CourseOvaContainerProps {
    user: User;
    course?: Course;
    courses?: Course[];
    messages?: CourseMessage[];
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    try {
        // Extract video ID from various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
        ];
        
        let videoId: string | null = null;
        let queryParams = new URLSearchParams();
        
        // Try to extract video ID
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                videoId = match[1];
                break;
            }
        }
        
        if (!videoId) return null;
        
        // Extract query parameters from original URL (especially 'si' parameter)
        try {
            const urlObj = new URL(url);
            const siParam = urlObj.searchParams.get('si');
            if (siParam) {
                queryParams.set('si', siParam);
            } else {
                // Default parameter if not present
                queryParams.set('si', 'Di1J6_weFKVrHpyb');
            }
        } catch {
            // If URL parsing fails, use default
            queryParams.set('si', 'Di1J6_weFKVrHpyb');
        }
        
        return `https://www.youtube.com/embed/${videoId}?${queryParams.toString()}`;
    } catch {
        return null;
    }
};

const CourseOvaContainer = ({ user, course, courses, messages }: CourseOvaContainerProps) => {
    const { progress, updateProgress } = useCourseData();
    const [selectedLectureId, setSelectedLectureId] = useState<string | null>(
        course?.lectures[0]?.id || null
    );
    const [activeTab, setActiveTab] = useState("notes");

    // Get progress for current course
    const courseProgress = course ? progress[course.id] : undefined;
    const completedLectures = courseProgress?.completed_lectures || [];

    // If no course selected, show course list
    if (!course && courses) {
        return (
            <div className="relative flex-1 size-full">
                <div className="relative flex flex-col w-full max-w-5xl pt-20 pb-24 mx-auto h-full overflow-auto px-4">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                            <p className="text-muted-foreground">Select a course to view lectures and content</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {courses.map((c) => (
                                <div 
                                    key={c.id} 
                                    className="cursor-pointer p-4 rounded-lg hover:bg-accent/50 transition-colors space-y-3"
                                    onClick={() => window.location.href = `/course/${c.id}?mode=ova`}
                                >
                                    <div>
                                        <h3 className="font-semibold line-clamp-2 mb-1">{c.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4" />
                                            <span>{c.total_lectures} lectures</span>
                                        </div>
                                        {c.progress !== undefined && (
                                            <span className="font-medium text-foreground">{c.progress}%</span>
                                        )}
                                    </div>
                                    {c.progress !== undefined && (
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${c.progress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-muted-foreground">No course selected</p>
                </div>
            </div>
        );
    }

    const selectedLecture = course.lectures.find(l => l.id === selectedLectureId) || course.lectures[0];
    const selectedLectureIndex = course.lectures.findIndex(l => l.id === selectedLectureId) + 1;
    const totalDuration = course.total_duration || course.lectures.reduce((sum, l) => sum + (l.duration || 0), 0);
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className="relative w-full h-full flex flex-col px-6 lg:px-8 xl:px-10">
            <div className="flex flex-col lg:flex-row h-full min-h-0">
                {/* Left Sidebar - Lectures List */}
                <div className="lg:w-64 xl:w-72 flex-shrink-0 border-r border-border/50 flex flex-col h-full min-h-0">
                    <div className="p-4 space-y-3 border-none">
                        <div>
                            <h2 className="text-lg font-semibold line-clamp-2">{course.title}</h2>
                            {course.instructor && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {course.instructor.name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{course.total_lectures} lectures</span>
                            </div>
                            {totalDuration > 0 && (
                                <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{formatDuration(totalDuration)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Lectures Scrollable List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <div className="space-y-0">
                            {course.lectures.map((lecture, index) => {
                                const isCompleted = completedLectures.includes(lecture.id);
                                const isSelected = selectedLectureId === lecture.id;
                                
                                return (
                                    <button
                                        key={lecture.id}
                                        onClick={() => setSelectedLectureId(lecture.id)}
                                        className={cn(
                                            "w-full text-left py-3.5 transition-opacity cursor-pointer",
                                            isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-3 w-3 text-primary fill-current" />
                                                ) : (
                                                    <Circle className="h-3 w-3 text-muted-foreground" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm font-normal leading-relaxed mb-1",
                                                    isSelected ? "text-foreground" : "text-foreground/90"
                                                )}>
                                                    {lecture.title}
                                                </p>
                                                {lecture.duration && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDuration(lecture.duration)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Fully Scrollable */}
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                    {selectedLecture ? (
                        <div className="flex flex-col">
                            {/* Course Header */}
                            <div className="px-4 lg:px-6 py-4 border-none shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                            <span>Courses</span>
                                            <ChevronRight className="h-3 w-3" />
                                            <span>{course.title}</span>
                                        </div>
                                        <h1 className="text-2xl font-semibold">{selectedLecture.title}</h1>
                                        {course.instructor && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {course.instructor.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>LECTURE {selectedLectureIndex}/{course.lectures.length}</span>
                                        <button className="p-1 hover:bg-accent/50 rounded transition-colors">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Video Player - Center, Full Width with Special Border */}
                            <div className="px-4 lg:px-6 py-6">
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-muted/30 to-muted/50 shadow-lg shadow-primary/5">
                                    {/* Inner border effect */}
                                    <div className="absolute inset-0 rounded-xl border border-primary/10 pointer-events-none"></div>
                                    
                                    {selectedLecture.video_url ? (
                                        (() => {
                                            const embedUrl = getYouTubeEmbedUrl(selectedLecture.video_url);
                                            return embedUrl ? (
                                                <iframe
                                                    className="w-full h-full rounded-xl"
                                                    src={embedUrl}
                                                    title="YouTube video player"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                                                    <div className="text-center space-y-4">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                                                            <Play className="h-20 w-20 mx-auto text-primary relative z-10" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-medium">Video Player</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {selectedLecture.video_url}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <p className="text-muted-foreground">No video available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content Tabs */}
                            <div className="border-none">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
                                    <div className="px-4 lg:px-6 border-none shrink-0">
                                        <TabsList className="h-12 bg-muted/30 p-1 rounded-lg gap-1">
                                            <TabsTrigger 
                                                value="notes" 
                                                className="px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md transition-all duration-200 shadow-sm data-[state=active]:shadow-md font-medium"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Notes
                                            </TabsTrigger>
                                            <TabsTrigger 
                                                value="resources" 
                                                className="px-5 py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground rounded-md transition-all duration-200 shadow-sm data-[state=active]:shadow-md font-medium"
                                            >
                                                <File className="h-4 w-4 mr-2" />
                                                Resources
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>
                                    
                                    <div className="px-4 lg:px-6 py-6">
                                        <TabsContent value="notes" className="mt-0 p-0">
                                            <div className="w-full space-y-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-3">About this lecture</h3>
                                                    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                                                        <p>{selectedLecture.description || 'No description available.'}</p>
                                                        <p>
                                                            This lecture covers the fundamental concepts and provides a comprehensive understanding 
                                                            of the topic. You'll learn practical skills and best practices that you can apply 
                                                            in real-world scenarios.
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {course.instructor && (
                                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                            <BookOpen className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold mb-1">About Instructor</h4>
                                                            <p className="text-sm font-medium">{course.instructor.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {course.instructor.bio || `${course.instructor.name} is an experienced instructor with expertise in this field. They bring practical knowledge and insights to help you master the subject.`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="resources" className="mt-0 p-0">
                                            <div className="w-full space-y-4">
                                                <h3 className="text-lg font-semibold">Course Materials</h3>
                                                {selectedLecture.materials && selectedLecture.materials.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {selectedLecture.materials.map((material) => (
                                                            <a
                                                                key={material.id}
                                                                href={material.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-4 rounded-lg hover:bg-accent/50 transition-colors group"
                                                            >
                                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                                                    <File className="h-5 w-5 text-primary" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium">{material.title}</p>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                                        {material.type.toUpperCase()} • Click to download
                                                                    </p>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <File className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                                        <p className="text-sm text-muted-foreground">No resources available for this lecture</p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center min-h-[400px]">
                            <p className="text-muted-foreground">Select a lecture to view content</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Course Progress Only - Independent Scroll */}
                <div className="hidden xl:flex xl:w-80 flex-shrink-0 border-l border-border/50 flex flex-col h-full min-h-0 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">{course.title}</h3>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">
                                    {completedLectures.length}/{course.lectures.length} COMPLETED
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${courseProgress?.progress_percentage || 0}%` }}
                                />
                            </div>
                        </div>
                        
                        {course.instructor && (
                            <div className="pt-4 border-t border-border/50">
                                <h4 className="text-sm font-semibold mb-2">Instructor</h4>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{course.instructor.name}</p>
                                        <p className="text-xs text-muted-foreground">Course Instructor</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-4 border-none">
                            <h4 className="text-sm font-semibold mb-3">Course Details</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Total Lectures</span>
                                    <span className="font-medium">{course.total_lectures}</span>
                                </div>
                                {totalDuration > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Total Duration</span>
                                        <span className="font-medium">{formatDuration(totalDuration)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{courseProgress?.progress_percentage || 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseOvaContainer;

