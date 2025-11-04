"use client";

import { create } from "zustand";
import type { Course, CourseMessage, CourseProgress, Lecture } from "@/types/course";

interface CourseMockDataStore {
    // Courses
    courses: Course[];
    setCourses: (courses: Course[]) => void;
    getCourseById: (courseId: string) => Course | undefined;
    
    // Progress
    progress: Record<string, CourseProgress>; // courseId -> progress
    setProgress: (courseId: string, progress: CourseProgress) => void;
    updateProgress: (courseId: string, lectureId: string, completed: boolean) => void;
    
    // Messages (chat about course)
    messages: Record<string, CourseMessage[]>; // courseId -> messages
    setMessages: (courseId: string, messages: CourseMessage[]) => void;
    addMessage: (courseId: string, message: CourseMessage) => void;
    
    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    isAiLoading: boolean;
    setIsAiLoading: (loading: boolean) => void;
}

// Mock courses data
const generateMockCourses = (): Course[] => {
    const courses: Course[] = [
        {
            id: "course-1",
            title: "Complete React Development",
            description: "Master React from basics to advanced concepts. Build real-world applications and learn hooks, context, and modern patterns.",
            instructor: {
                id: "instructor-1",
                name: "Sarah Johnson",
                avatar: undefined,
            },
            thumbnail: undefined,
            total_lectures: 15,
            total_duration: 18000, // 5 hours
            enrolled_at: new Date(Date.now() - 7 * 86400000).toISOString(),
            progress: 45,
            created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            lectures: [
                {
                    id: "lecture-1-1",
                    course_id: "course-1",
                    title: "Introduction to React",
                    description: "Learn the fundamentals of React and why it's the most popular library for building user interfaces.",
                    video_url: "https://youtu.be/-6LvNku2nJE?si=QAiynXNmW7iEMz20",
                    duration: 1200, // 20 minutes
                    order: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    materials: [
                        {
                            id: "mat-1-1",
                            lecture_id: "lecture-1-1",
                            type: "pdf",
                            title: "React Basics Cheat Sheet",
                            url: "https://example.com/react-basics.pdf",
                            created_at: new Date().toISOString(),
                        },
                    ],
                },
                {
                    id: "lecture-1-2",
                    course_id: "course-1",
                    title: "Components and Props",
                    description: "Understand how to create reusable components and pass data using props.",
                    video_url: "https://youtu.be/k3KqQvywToE?si=PktCHlErRiXMQFlp",
                    duration: 1800, // 30 minutes
                    order: 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: "lecture-1-3",
                    course_id: "course-1",
                    title: "State and Hooks",
                    description: "Master useState and useEffect hooks to manage component state and side effects.",
                    video_url: "https://youtu.be/yNbnA5pryMg?si=VXQkQda0n7Gz3pXh",
                    duration: 2400, // 40 minutes
                    order: 3,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: "lecture-1-4",
                    course_id: "course-1",
                    title: "Context API",
                    description: "Learn how to use Context API to manage global state without prop drilling.",
                    video_url: "https://youtu.be/kAOuj6o7Kxs?si=TZ3PNhyGl2LcBpco",
                    duration: 1500, // 25 minutes
                    order: 4,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: "lecture-1-5",
                    course_id: "course-1",
                    title: "Building Your First App",
                    description: "Put everything together and build a complete React application.",
                    video_url: "https://youtu.be/kAOuj6o7Kxs?si=BuymY_a2R1S8WyqX",
                    duration: 3600, // 60 minutes
                    order: 5,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ],
        },
        {
            id: "course-2",
            title: "JavaScript Fundamentals",
            description: "Deep dive into JavaScript. Learn ES6+, async programming, and advanced patterns used in modern development.",
            instructor: {
                id: "instructor-2",
                name: "Michael Chen",
                avatar: undefined,
            },
            thumbnail: undefined,
            total_lectures: 12,
            total_duration: 14400, // 4 hours
            enrolled_at: new Date(Date.now() - 14 * 86400000).toISOString(),
            progress: 75,
            created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            lectures: [
                {
                    id: "lecture-2-1",
                    course_id: "course-2",
                    title: "Variables and Data Types",
                    description: "Learn about let, const, var and different data types in JavaScript.",
                    video_url: "https://youtu.be/SR5NYCdzKkc?si=mHhHkg4U09Vz7Cgr",
                    duration: 900, // 15 minutes
                    order: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: "lecture-2-2",
                    course_id: "course-2",
                    title: "Functions and Scope",
                    description: "Master function declarations, arrow functions, and understand scope in JavaScript.",
                    video_url: "https://youtu.be/SR5NYCdzKkc?si=mHhHkg4U09Vz7Cgr",
                    duration: 1800, // 30 minutes
                    order: 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: "lecture-2-3",
                    course_id: "course-2",
                    title: "Async/Await and Promises",
                    description: "Understand asynchronous JavaScript with promises and async/await syntax.",
                    video_url: "https://youtu.be/SR5NYCdzKkc?si=mHhHkg4U09Vz7Cgr",
                    duration: 2100, // 35 minutes
                    order: 3,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ],
        },
        {
            id: "course-3",
            title: "TypeScript for Beginners",
            description: "Learn TypeScript from scratch. Build type-safe applications and leverage modern TypeScript features.",
            instructor: {
                id: "instructor-1",
                name: "Sarah Johnson",
                avatar: undefined,
            },
            thumbnail: undefined,
            total_lectures: 10,
            total_duration: 12600, // 3.5 hours
            enrolled_at: new Date(Date.now() - 3 * 86400000).toISOString(),
            progress: 20,
            created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            lectures: [
                {
                    id: "lecture-3-1",
                    course_id: "course-3",
                    title: "TypeScript Setup",
                    description: "Learn how to set up TypeScript in your project and configure the compiler.",
                    video_url: "https://youtu.be/SR5NYCdzKkc?si=mHhHkg4U09Vz7Cgr",
                    duration: 600, // 10 minutes
                    order: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    id: "lecture-3-2",
                    course_id: "course-3",
                    title: "Basic Types",
                    description: "Understand TypeScript's type system and basic types.",
                    video_url: "https://youtu.be/SR5NYCdzKkc?si=mHhHkg4U09Vz7Cgr",
                    duration: 1200, // 20 minutes
                    order: 2,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ],
        },
    ];

    return courses;
};

// Initial progress data
const generateInitialProgress = (courses: Course[], userId: string): Record<string, CourseProgress> => {
    const progress: Record<string, CourseProgress> = {};
    
    courses.forEach((course) => {
        const completedCount = Math.floor((course.progress || 0) / 100 * course.lectures.length);
        const completedLectures = course.lectures.slice(0, completedCount).map(l => l.id);
        const currentLecture = course.lectures[completedCount]?.id;
        
        progress[course.id] = {
            course_id: course.id,
            user_id: userId,
            completed_lectures: completedLectures,
            current_lecture_id: currentLecture,
            progress_percentage: course.progress || 0,
            last_accessed_at: course.enrolled_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    });
    
    return progress;
};

// Initial messages for courses
const initialMessages: Record<string, CourseMessage[]> = {
    "course-1": [
        {
            id: "msg-course-1-1",
            course_id: "course-1",
            content: "What are the key concepts I should focus on in this React course?",
            role: "user",
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
            id: "msg-course-1-2",
            course_id: "course-1",
            content: "Based on this React course, focus on: 1) Understanding component composition, 2) Mastering hooks (useState, useEffect, useContext), 3) Learning to manage state effectively, and 4) Building real-world applications. The course progresses from basics to advanced patterns, so make sure to complete each lecture in order.",
            role: "assistant",
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
    ],
    "course-2": [
        {
            id: "msg-course-2-1",
            course_id: "course-2",
            content: "Can you explain async/await in simpler terms?",
            role: "user",
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
            id: "msg-course-2-2",
            course_id: "course-2",
            content: "Async/await makes asynchronous code look and behave more like synchronous code. Instead of using .then() chains, you use the 'async' keyword before a function and 'await' before promises. This makes the code easier to read and debug.",
            role: "assistant",
            created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
    ],
};

const mockCourses = generateMockCourses();
const mockUserId = "user-1"; // This should come from auth state

export const useCourseData = create<CourseMockDataStore>((set, get) => ({
    // Courses
    courses: mockCourses,
    setCourses: (courses) => set({ courses }),
    getCourseById: (courseId: string) => {
        return get().courses.find(c => c.id === courseId);
    },
    
    // Progress
    progress: generateInitialProgress(mockCourses, mockUserId),
    setProgress: (courseId, progress) =>
        set((state) => ({
            progress: { ...state.progress, [courseId]: progress },
        })),
    updateProgress: (courseId, lectureId, completed) => {
        const currentProgress = get().progress[courseId];
        if (!currentProgress) return;
        
        const completedLectures = completed
            ? [...currentProgress.completed_lectures, lectureId]
            : currentProgress.completed_lectures.filter(id => id !== lectureId);
        
        const course = get().courses.find(c => c.id === courseId);
        const progressPercentage = course
            ? Math.round((completedLectures.length / course.lectures.length) * 100)
            : currentProgress.progress_percentage;
        
        set((state) => ({
            progress: {
                ...state.progress,
                [courseId]: {
                    ...currentProgress,
                    completed_lectures: completedLectures,
                    progress_percentage: progressPercentage,
                    updated_at: new Date().toISOString(),
                },
            },
        }));
    },
    
    // Messages
    messages: initialMessages,
    setMessages: (courseId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [courseId]: messages },
        })),
    addMessage: (courseId, message) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [courseId]: [...(state.messages[courseId] || []), message],
            },
        })),
    
    // Loading states
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
    isAiLoading: false,
    setIsAiLoading: (loading) => set({ isAiLoading: loading }),
}));

