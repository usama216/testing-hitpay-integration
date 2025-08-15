// src/components/BookingForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Image from 'next/image'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// date‐fns helpers to compare dates & get end of day
import { isSameDay, endOfDay } from 'date-fns'

import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

import { PeopleSelector } from '@/components/PeopleSelector'
import { AuthModal } from '@/components/auth/AuthModal'

export default function BookingForm() {
  const router = useRouter()

  const [location, setLocation] = useState<string>('')
  const [people, setPeople] = useState<number>(1)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // Add state for people breakdown
  const [peopleBreakdown, setPeopleBreakdown] = useState<{
    coWorkers: number
    coTutors: number
    coStudents: number
    total: number
  }>({
    coWorkers: 1,
    coTutors: 0,
    coStudents: 0,
    total: 1
  })

  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleStartChange = (date: Date) => {
    setStartDate(date)
    // if previously picked end was on a different day or before new start, clear it
    if (!date || !endDate || !isSameDay(date, endDate) || endDate <= date) {
      setEndDate(null)
    }
  }

  const handleBookNow = () => {
    // Validate required fields
    if (!location || !startDate || !endDate) {
      alert('Please fill in all required fields')
      return
    }

    // Show authentication modal
    setShowAuthModal(true)
  }

  const handleContinueToBooking = () => {
    setShowAuthModal(false)

    // Create URL with prefilled data
    const params = new URLSearchParams({
      location: location.toString(),
      people: people.toString(),
      start: startDate!.toISOString(),
      end: endDate!.toISOString(),
      coWorkers: peopleBreakdown.coWorkers.toString(),
      coTutors: peopleBreakdown.coTutors.toString(),
      coStudents: peopleBreakdown.coStudents.toString()
    })

    router.push(`/book-now?${params.toString()}`)
  }

// Handle people count changes - this prevents circular updates
  const handlePeopleChange = (newPeople: number) => {
    if (people !== newPeople) {
      setPeople(newPeople)
      // Only update breakdown if it's different to prevent loops
      if (peopleBreakdown.total !== newPeople) {
        setPeopleBreakdown(prev => ({
          ...prev,
          total: newPeople,
          // Adjust coWorkers to match the new total if needed
          coWorkers: Math.max(1, newPeople - prev.coTutors - prev.coStudents)
        }))
      }
    }
  }

  // Handle breakdown changes - this prevents circular updates
  const handleBreakdownChange = (newBreakdown: typeof peopleBreakdown) => {
    // Only update if there's an actual change
    if (JSON.stringify(peopleBreakdown) !== JSON.stringify(newBreakdown)) {
      setPeopleBreakdown(newBreakdown)
      // Only update people count if it's different to prevent loops
      if (people !== newBreakdown.total) {
        setPeople(newBreakdown.total)
      }
    }
  }

  return (
    <>
      <section id="BookNow" className="pt-24">
        <div className="relative h-[600px]">
          <Image src="/mock_img/hero-bg.png" alt="Hero" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white">
            <h1 className="text-5xl font-serif">
              Start your unforgettable co-working journey with us.
            </h1>
            <p className="mt-4">Where Community meets Productivity</p>

            {/*  THE WHITE BAR  */}
            <div className="mt-8 bg-white p-6 rounded-lg flex space-x-8 items-end">

              {/* LOCATION */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1">Location</label>
                <Select
                  value={location}
                  onValueChange={setLocation}
                >
                  <SelectTrigger className="flex h-10 w-40 items-center justify-between rounded-none border-b border-gray-300 bg-transparent px-3 py-2 text-left text-sm focus:ring-0 text-black">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bukit">Bukit Panjang</SelectItem>
                    <SelectItem value="kovan">Kovan</SelectItem>
                    <SelectItem value="amk">Ang Mo Kio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PEOPLE */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase">People</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-32 text-black border-b border-gray-300 pb-1 text-left focus:outline-none"
                    >
                      {people} {people === 1 ? 'Person' : 'People'}
                      {peopleBreakdown.coTutors > 0 || peopleBreakdown.coStudents > 0 ? (
                        <div className="text-xs text-gray-500 mt-1">
                          {peopleBreakdown.coWorkers}💼 {peopleBreakdown.coTutors}👩‍🏫 {peopleBreakdown.coStudents}🎓
                        </div>
                      ) : null}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" className="w-auto">
                    <PeopleSelector
                      value={people}
                      min={1}
                      max={15}
                      onChange={handlePeopleChange}
                      showBreakdown={true}
                      onBreakdownChange={handleBreakdownChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* DATE & TIME RANGE */}
              <div className="flex space-x-6">
                {/* From */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1">From</label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="Start"
                    className="w-48 pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    minDate={new Date()}
                  />
                </div>

                {/* To */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1">To</label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    // maxDate={startDate}
                    // only allow same-day selection:
                    // filterDate={(d) => startDate ? isSameDay(d, startDate) : true}
                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="End"
                    className="w-48 pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    // enforce time > start
                    minTime={startDate || undefined}
                    maxTime={startDate ? endOfDay(startDate) : undefined}
                  />
                </div>
              </div>

              {/* BOOK BUTTON */}
              <Button
                onClick={handleBookNow}
                className="bg-orange-500 text-white ml-auto transition-colors duration-200">
                Book Now →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleContinueToBooking}
      />
    </>
  )
}