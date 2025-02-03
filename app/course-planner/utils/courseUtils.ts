import { Course } from '../CourseContext';
import coursesData from '@/lib/all_courses.json'

export function transformJsonCourse(jsonCourse: typeof coursesData.courses[0]): Course {
  return {
    id: jsonCourse.code,
    code: jsonCourse.code,
    name: jsonCourse.name,
    instructor: jsonCourse.instructor,
    time: jsonCourse.time,
    rooms: jsonCourse.rooms,
    credit: jsonCourse.credit,
    ects: jsonCourse.ects,
    department: jsonCourse.department,
    labs: jsonCourse.labs,
    practicums: jsonCourse.practicums
  }
}

export function getAllCourses(): Course[] {
  return coursesData.courses.map(transformJsonCourse)
}

export function getDayAbbreviation(day: string): string {
  const dayMap: Record<string, string> = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  }
  return dayMap[day] || day
} 