'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Squirrel, Sun, Coffee, Zap, Star, Clock } from "lucide-react"
import { useCourseContext } from './CourseContext'
import { useMemo } from 'react'

// Use the Course type from the context
type Course = ReturnType<typeof useCourseContext>['addedCourses'][number]

export default function CourseTable() {
  const { addedCourses, hoveredCourse } = useCourseContext()

  const days = [
    { name: 'Mon', icon: Squirrel },
    { name: 'Tue', icon: Sun },
    { name: 'Wed', icon: Coffee },
    { name: 'Thu', icon: Zap },
    { name: 'Fri', icon: Star }
  ]
  const hours = Array.from({ length: 8 }, (_, i) => i + 1)

  const hasConflict = (course1: Course, course2: Course) => {
    // Check main time slots
    for (const slot1 of course1.time) {
      for (const slot2 of course2.time) {
        if (slot1.day === slot2.day && slot1.hour === slot2.hour) {
          return true
        }
      }
    }
    
    // Check labs and practicums
    const allSlots1 = [
      ...course1.time,
      ...course1.labs.flatMap(lab => lab.time),
      ...course1.practicums.flatMap(prac => prac.time)
    ]
    
    const allSlots2 = [
      ...course2.time,
      ...course2.labs.flatMap(lab => lab.time),
      ...course2.practicums.flatMap(prac => prac.time)
    ]
    
    for (const slot1 of allSlots1) {
      for (const slot2 of allSlots2) {
        if (slot1.day === slot2.day && slot1.hour === slot2.hour) {
          return true
        }
      }
    }
    
    return false
  }

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

  const getCoursesForSlot = (day: string, slotNumber: number) => {
    // Convert table day abbreviation to full day name
    const fullDayName = Object.entries({
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun'
    }).find(([, abbrev]) => abbrev === day)?.[0] || day;

    const courses = addedCourses.filter(course => {
      const hasMainTime = course.time.some(slot => 
        slot.day === fullDayName && slot.hour === slotNumber
      );
      
      const hasLabTime = course.labs.some(lab => 
        lab.time.some(slot => slot.day === fullDayName && slot.hour === slotNumber)
      );
      
      const hasPracticumTime = course.practicums.some(prac => 
        prac.time.some(slot => slot.day === fullDayName && slot.hour === slotNumber)
      );

      return hasMainTime || hasLabTime || hasPracticumTime;
    });

    // Include hovered course even if not added, but check its time slots
    if (hoveredCourse && !addedCourses.some(c => c.id === hoveredCourse.id)) {
      const isHoveredSlot = hoveredCourse.time.some(slot => 
        slot.day === fullDayName && slot.hour === slotNumber
      ) || hoveredCourse.labs.some(lab => 
        lab.time.some(slot => slot.day === fullDayName && slot.hour === slotNumber)
      ) || hoveredCourse.practicums.some(prac => 
        prac.time.some(slot => slot.day === fullDayName && slot.hour === slotNumber)
      );

      if (isHoveredSlot) {
        courses.push(hoveredCourse);
      }
    }

    return courses;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-100">Weekly Schedule</h2>
        <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-pink-500 rounded-full"></div>
      </div>
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow className="border-b border-stone-600">
            <TableHead className="w-20 p-3 text-stone-400 bg-stone-800 rounded-tl-lg">
              <Clock className="w-5 h-5 mx-auto" />
            </TableHead>
            {days.map((day, index) => (
              <TableHead key={day.name} className={`p-3 text-stone-400 bg-stone-800 ${index === days.length - 1 ? 'rounded-tr-lg' : ''}`}>
                <div className="flex flex-col items-center">
                  <day.icon className="w-5 h-5 mb-1" />
                  <span>{day.name}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hours.map((hour) => (
            <TableRow 
              key={hour} 
              className={`${hour % 2 === 0 ? "bg-stone-800" : "bg-stone-900"} border-b border-stone-700 hover:bg-transparent`}
            >
              <TableCell className="text-stone-300 font-medium text-center">
                {`${hour + 8}:00`}
              </TableCell>
              {days.map((day) => {
                const courses = getCoursesForSlot(day.name, hour)
                const isConflicting = courses.length > 1
                const isHoveredConflict = isConflicting && hoveredCourse && courses.some(c => c.id === hoveredCourse.id)
                return (
                  <TableCell 
                    key={`${day.name}-${hour}`} 
                    className="p-0 rounded-sm text-stone-300"
                  >
                    {courses.length > 0 && (
                      <div className={`m-1 rounded-sm transition-all duration-300 ${
                        isHoveredConflict ? 'bg-red-500/20' :
                        isConflicting ? 'bg-amber-500/20' :
                        hoveredCourse && courses.some(c => c.id === hoveredCourse.id) ? 'bg-green-500/20' : ''
                      }`}>
                        <div className={`w-full h-full flex flex-col items-center justify-center font-mono text-xs p-1 ${
                          isHoveredConflict ? 'text-red-400' :
                          isConflicting ? 'text-amber-400' :
                          hoveredCourse && courses.some(c => c.id === hoveredCourse.id) ? 'text-green-400' : ''
                        }`}>
                          {courses.map((course, index) => (
                            <span key={course.id} className="text-center">
                              {course.code.replace(/([A-Za-z]*\d+)(\.\d+)/, '$1$2')}
                              {index < courses.length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
