import React from 'react'
import { cn } from '../../lib/utils'

export interface RangeOption {
  label: string
  hours: number
}

interface RangeSelectorProps {
  options: RangeOption[]
  selected: RangeOption
  onChange: (option: RangeOption) => void
}

export default function RangeSelector({ options, selected, onChange }: RangeSelectorProps) {
  return (
    <div className="flex bg-[#1c1c1e] rounded-full p-1 gap-1 w-full max-w-sm mx-auto shadow-inner border border-white/5">
      {options.map((option) => {
        const isSelected = selected.label === option.label
        return (
          <button
            key={option.label}
            onClick={() => onChange(option)}
            className={cn(
              'flex-1 text-center py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 whitespace-nowrap',
              isSelected
                ? 'bg-[#3a3a3c] text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
