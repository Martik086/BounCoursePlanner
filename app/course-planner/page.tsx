'use client'

import { useState, useEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import CourseTable from './coursetable'
import CourseSearch from './coursesearch'
import { CourseProvider } from './CourseContext'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Search, X } from 'lucide-react'

export default function CoursePlannerPage() {
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <CourseProvider>
      <div className="flex h-screen bg-gradient-to-br from-stone-900 to-stone-800">
        <div className={`${isMobile ? 'w-full' : 'w-1/2'} p-4 overflow-auto`}>
          <CourseTable />
        </div>
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button className="fixed bottom-4 right-4 rounded-full w-12 h-12 bg-stone-700 hover:bg-stone-600">
                <Search className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-full sm:w-[400px] bg-stone-900 p-0 border-l-0"
            >
              <div className="flex justify-between items-center p-4 border-b border-stone-700">
                <h2 className="text-xl font-semibold text-stone-100">Course Search</h2>
                <SheetClose asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-stone-400 hover:text-stone-300 hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </SheetClose>
              </div>
              <CourseSearch />
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-1/2 p-4 overflow-hidden">
            <CourseSearch />
          </div>
        )}
      </div>
    </CourseProvider>
  )
}
