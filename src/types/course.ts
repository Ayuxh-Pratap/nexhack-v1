export interface Instructor {
    id: string;
    name: string;
    email?: string;
    image?: string | null;
    avatar?: string | null;
    bio?: string;
}

export interface CourseMaterial {
    id: string;
    lecture_id: string;
    title: string;
    type: 'pdf' | 'doc' | 'link' | 'video' | 'other';
    url: string;
    created_at?: string;
}

export interface Lecture {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    video_url?: string;
    duration?: number; // in seconds
    materials?: CourseMaterial[];
    order?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Course {
    id: string;
    title: string;
    description?: string;
    instructor?: Instructor;
    thumbnail?: string | null;
    lectures: Lecture[];
    total_lectures: number;
    total_duration?: number; // in seconds
    progress?: number; // 0-100
    enrolled_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CourseMessage {
    id: string;
    course_id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
}

export interface CourseProgress {
    course_id: string;
    user_id: string;
    completed_lectures: string[];
    current_lecture_id?: string;
    progress_percentage: number;
    last_accessed_at: string;
    updated_at: string;
}

