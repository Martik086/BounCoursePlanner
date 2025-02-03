'use client'

import React, { createContext, useState, useContext, ReactNode } from 'react'

type TimeSlot = {
  day: string
  hour: number
}

type LabOrPracticum = {
  instructor: string
  time: TimeSlot[]
  rooms: string[]
}

export type Course = {
  id: string            // Will be generated from code
  code: string         
  name: string
  instructor: string
  time: TimeSlot[]
  rooms: string[]
  credit: number
  ects: number
  department: string
  labs: LabOrPracticum[]
  practicums: LabOrPracticum[]
  isConflicting?: boolean
}

interface CourseContextType {
  addedCourses: Course[]
  addCourse: (course: Course) => void
  removeCourse: (courseId: string) => void
  hoveredCourse: Course | null
  setHoveredCourse: (course: Course | null) => void
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [addedCourses, setAddedCourses] = useState<Course[]>([])
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null)

  const addCourse = (course: Course) => {
    setAddedCourses(prev => [...prev, course])
  }

  const removeCourse = (courseId: string) => {
    setAddedCourses(prev => prev.filter(course => course.id !== courseId))
  }

  return (
    <CourseContext.Provider value={{ 
      addedCourses, 
      addCourse, 
      removeCourse, 
      hoveredCourse, 
      setHoveredCourse 
    }}>
      {children}
    </CourseContext.Provider>
  )
}

export function useCourseContext() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error('useCourseContext must be used within a CourseProvider')
  }
  return context
}
