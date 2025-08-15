'use client'

import React, { useState } from 'react'

export type SeatMeta = {
  id: string
  x: number
  y: number
  shape: 'rect' | 'circle'
  size: number       // radius for circle, half-width for rect
}

export type OverlayMeta = {
  id: string
  src: string         // path to your PNG/SVG
  x: number
  y: number
  width: number
  height: number
}

export type TableMeta = {
  id: string
  shape: 'rect' | 'circle'
  x: number
  y: number
  width?: number   // for rect
  height?: number  // for rect
  radius?: number  // for circle
  fill?: string    // optional override
}

export type LabelMeta = {
  id: string
  text: string
  x: number
  y: number
  fontSize?: number
  fill?: string
}

export interface SeatPickerProps {
  layout: SeatMeta[]
  tables?: TableMeta[]
  labels?: LabelMeta[]
  bookedSeats?: string[]
  overlays?: OverlayMeta[]
  onSelectionChange?: (selectedIds: string[]) => void
}

export const SeatPicker: React.FC<SeatPickerProps> = ({
  layout,
  bookedSeats = [],
  tables = [],    // default to empty
  labels = [],    // default to empty
  overlays = [],
  onSelectionChange,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSeat = (id: string) => {
    if (bookedSeats.includes(id)) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      onSelectionChange?.([...next])
      return next
    })
  }

  return (
    <svg
      viewBox="0 0 400 600"
      style={{ width: '100%', height: 'auto', border: '1px solid #eee' }}
    > 

        {overlays.map(img => (
        <image
          key={img.id}
          href={img.src}
          x={img.x}
          y={img.y}
          width={img.width}
          height={img.height}
        />
      ))}

      {/* 3) Tables */}
      {tables.map(tbl => {
        const fill = tbl.fill || '#D4C9AA'  // default red
        return tbl.shape === 'circle' ? (
          <circle
            key={tbl.id}
            cx={tbl.x}
            cy={tbl.y}
            r={tbl.radius}
            fill={fill}
          />
        ) : (
          <rect
            key={tbl.id}
            x={tbl.x - tbl.width!/2}
            y={tbl.y - tbl.height!/2}
            width={tbl.width}
            height={tbl.height}
            rx={4}
            fill={fill}
          />
        )
      })}

      {layout.map((seat) => {
        const isBooked = bookedSeats.includes(seat.id)
        const isSelected = selected.has(seat.id)
        const fill = isBooked
          ? '#ccc'
          : isSelected
          ? '#f97316'
          : '#10b981'

        if (seat.shape === 'circle') {
          return (
            <circle
              key={seat.id}
              cx={seat.x}
              cy={seat.y}
              r={seat.size}
              fill={fill}
              stroke="#0003"
              strokeWidth={1}
              style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
              onClick={() => toggleSeat(seat.id)}
            />
          )
        } else {
          return (
            <rect
              key={seat.id}
              x={seat.x - seat.size}
              y={seat.y - seat.size}
              width={seat.size * 2}
              height={seat.size * 2}
              rx={4}
              fill={fill}
              stroke="#0003"
              strokeWidth={1}
              style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
              onClick={() => toggleSeat(seat.id)}
            />
          )
        }
      })}
      {/* 5) Labels */}
      {labels.map(lbl => (
        <text
          key={lbl.id}
          x={lbl.x}
          y={lbl.y}
          fontSize={lbl.fontSize || 14}
          fill={lbl.fill || '#000'}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {lbl.text}
        </text>
      ))}
    </svg>
  )
}
