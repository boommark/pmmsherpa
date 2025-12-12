'use client'

import { MODEL_CONFIG, type ModelProvider } from '@/lib/llm/provider-factory'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ModelSelectorProps {
  value: ModelProvider
  onChange: (value: ModelProvider) => void
  disabled?: boolean
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ModelProvider)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="claude">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            {MODEL_CONFIG.claude.name}
          </div>
        </SelectItem>
        <SelectItem value="gemini">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {MODEL_CONFIG.gemini.name}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
