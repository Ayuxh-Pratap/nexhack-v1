"use client";

import { useRouter } from "next/navigation";
import { BookOpen, Clock, Users, ChevronRight, Play } from "lucide-react";
import { useCourseData } from "@/stores/course-mock-store";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/course";

export function BrowseCoursesPage() {
  const router = useRouter();
  const { courses, progress } = useCourseData();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const handleCourseClick = (course: Course) => {
    // Navigate to home page with course selected
    router.push(`/home?course=${course.id}`);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Courses</h1>
          <p className="text-muted-foreground text-lg">
            Explore our collection of courses designed to help you succeed
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const courseProgress = progress[course.id];
            const completedCount = courseProgress?.completed_lectures?.length || 0;
            const progressPercentage = courseProgress?.progress_percentage || course.progress || 0;

            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className={cn(
                  "group cursor-pointer bg-card border border-border rounded-xl",
                  "hover:border-primary/50 hover:shadow-lg transition-all duration-200",
                  "overflow-hidden flex flex-col"
                )}
              >
                {/* Course Thumbnail/Icon */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <BookOpen className="h-16 w-16 text-primary/60 group-hover:text-primary transition-colors" />
                  
                  {/* Progress Badge */}
                  {progressPercentage > 0 && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-md">
                        {progressPercentage}% Complete
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Title and Description */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.total_lectures} lectures</span>
                    </div>
                    {course.total_duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(course.total_duration)}</span>
                      </div>
                    )}
                  </div>

                  {/* Instructor */}
                  {course.instructor && (
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{course.instructor.name}</span>
                    </div>
                  )}

                  {/* Progress Bar (if started) */}
                  {progressPercentage > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">
                          {completedCount} of {course.total_lectures} completed
                        </span>
                        <span className="font-medium">{progressPercentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-auto pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {progressPercentage > 0 ? "Continue Learning" : "Start Course"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses available</h3>
            <p className="text-muted-foreground">
              Check back later for new courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

