'use client'

import { useState, useMemo, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Calendar, MapPin, GraduationCap, Plus, Minus, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useCourseContext } from './CourseContext'
import { getAllCourses, getDayAbbreviation } from './utils/courseUtils'

// Use the Course type from the context
type Course = ReturnType<typeof useCourseContext>['addedCourses'][number]

// Updated sample course data
const courses = getAllCourses()

export default function CourseSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const { addedCourses, addCourse, removeCourse, setHoveredCourse } = useCourseContext()

  useEffect(() => {
    const uniqueDepartments = Array.from(new Set(courses.map(course => course.department)))
    setDepartments(uniqueDepartments.sort())
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === '') {
      setSearchResults([])
    } else {
      const filteredCourses = courses.filter(course => 
        course.id.toLowerCase().includes(query.toLowerCase()) ||
        course.name.toLowerCase().includes(query.toLowerCase()) ||
        course.instructor.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filteredCourses)
    }
  }

  const handleDepartmentClick = (department: string) => {
    const departmentCourses = courses.filter(course => course.department === department)
    setSearchResults(departmentCourses)
    setSearchQuery(`${department} `)
  }

  const toggleCourse = (course: Course) => {
    if (addedCourses.some(c => c.id === course.id)) {
      removeCourse(course.id)
    } else {
      addCourse(course)
    }
  }

  const hasConflict = (course1: Course, course2: Course) => {
    // Check all time slots including labs and practicums
    const getAllSlots = (course: Course) => [
      ...course.time,
      ...course.labs.flatMap(lab => lab.time),
      ...course.practicums.flatMap(prac => prac.time)
    ];

    const slots1 = getAllSlots(course1);
    const slots2 = getAllSlots(course2);

    return slots1.some(s1 => 
      slots2.some(s2 => 
        s1.day === s2.day && s1.hour === s2.hour
      )
    );
  };

  const conflictingCourses = useMemo(() => {
    const conflicts = new Set<string>()
    for (let i = 0; i < addedCourses.length; i++) {
      for (let j = i + 1; j < addedCourses.length; j++) {
        if (hasConflict(addedCourses[i], addedCourses[j])) {
          conflicts.add(addedCourses[i].id)
          conflicts.add(addedCourses[j].id)
        }
      }
    }
    return conflicts
  }, [addedCourses])

  const handleHover = (course: Course) => {
    if (!addedCourses.some(c => c.id === course.id)) {
      const hasConflictWithAdded = addedCourses.some(c => hasConflict(c, course))
      setHoveredCourse({ ...course, isConflicting: hasConflictWithAdded })
    } else {
      // If the course is already added, we set hoveredCourse to null
      setHoveredCourse(null)
    }
  }

  const handleMouseLeave = () => {
    setHoveredCourse(null)
  }

  return (
    <div className="w-full h-full p-2 overflow-hidden flex flex-col">
      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-stone-800/50 border-stone-700 text-stone-200 placeholder-stone-400 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-stone-500 focus:border-transparent pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
      </div>
      <ScrollArea className="flex-grow">
        <div className="bg-stone-800/30 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-3">
          {searchQuery.trim() === '' ? (
            <div className="flex flex-wrap gap-2">
              {departments.map(department => (
                <Button
                  key={department}
                  onClick={() => handleDepartmentClick(department)}
                  className="bg-stone-700 hover:bg-stone-600 text-stone-200"
                >
                  {department}
                </Button>
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-stone-400">No courses found.</p>
          ) : (
            searchResults.map(course => (
              <Card 
                key={course.id} 
                className={`overflow-hidden bg-stone-800/30 border-stone-700/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-stone-700/20 ${
                  conflictingCourses.has(course.id) ? 'border-amber-500/50' : ''
                }`}
                onMouseEnter={() => handleHover(course)}
                onMouseLeave={handleMouseLeave}
              >
                <CardContent className="p-3 flex items-center">
                  <div className="flex-grow pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-sm font-semibold text-stone-300 flex items-center">
                        <span>{course.code.replace(/([A-Za-z]*\d+)(\.\d+)/, '$1 $2')}</span>
                        <span className="mx-2">•</span>
                        <span className="truncate">{course.name}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2 text-stone-300">
                        <User className="w-3 h-3" />
                        <span className="truncate">{course.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-300">
                        <Calendar className="w-3 h-3" />
                        <span>{course.time.map(s => `${s.day} ${s.hour}`).join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-300">
                        <MapPin className="w-3 h-3" />
                        <span>{course.rooms.join(', ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-stone-300">
                        <GraduationCap className="w-3 h-3" />
                        <span>{course.credit} Credits</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleCourse(course)}
                    className={`min-w-[3rem] h-[3rem] rounded-md transition-all duration-300 ${
                      addedCourses.some(c => c.id === course.id)
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-400/20 hover:bg-green-500'
                    }`}
                  >
                    {addedCourses.some(c => c.id === course.id) ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5 text-green-400 hover:text-white" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
