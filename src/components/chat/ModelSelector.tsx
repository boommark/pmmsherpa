'use client'

import { MODEL_CONFIG, type ModelProvider } from '@/lib/llm/provider-factory'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Brain, Zap } from 'lucide-react'

interface ModelSelectorProps {
  value: ModelProvider
  onChange: (value: ModelProvider) => void
  disabled?: boolean
}

// Group models by provider
const modelGroups = {
  anthropic: {
    label: 'Anthropic',
    models: ['claude-opus', 'claude-sonnet'] as ModelProvider[],
  },
  google: {
    label: 'Google',
    models: ['gemini-3-pro', 'gemini-2.5-thinking'] as ModelProvider[],
  },
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const currentConfig = MODEL_CONFIG[value]

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ModelProvider)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px] sm:w-[180px] md:w-[220px]">
        <SelectValue>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${currentConfig.color}`} />
            <span className="truncate text-xs sm:text-sm">{currentConfig.name}</span>
            {currentConfig.isThinking && <Brain className="h-3 w-3 text-purple-500 shrink-0 hidden sm:block" />}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(modelGroups).map(([key, group]) => (
          <SelectGroup key={key}>
            <SelectLabel className="text-xs text-muted-foreground">{group.label}</SelectLabel>
            {group.models.map((modelKey) => {
              const config = MODEL_CONFIG[modelKey]
              return (
                <SelectItem key={modelKey} value={modelKey}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.color}`} />
                    <span>{config.name}</span>
                    {config.isThinking ? (
                      <Brain className="h-3 w-3 text-purple-500" />
                    ) : (
                      <Zap className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
