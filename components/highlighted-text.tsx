import type { HighlightedText } from "@/lib/bias-analyzer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HighlightedTextDisplayProps {
  segments: HighlightedText[]
}

export default function HighlightedTextDisplay({ segments }: HighlightedTextDisplayProps) {
  // Define colors for different bias types
  const getBiasColor = (biasType?: string) => {
    switch (biasType) {
      case "gender":
        return "bg-pink-200 dark:bg-pink-900 border-b-2 border-pink-500"
      case "political":
        return "bg-blue-200 dark:bg-blue-900 border-b-2 border-blue-500"
      case "racial":
        return "bg-amber-200 dark:bg-amber-900 border-b-2 border-amber-500"
      case "other":
        return "bg-purple-200 dark:bg-purple-900 border-b-2 border-purple-500"
      default:
        return ""
    }
  }

  const getBiasTooltip = (biasType?: string) => {
    switch (biasType) {
      case "gender":
        return "Gender bias detected"
      case "political":
        return "Political bias detected"
      case "racial":
        return "Racial bias detected"
      case "other":
        return "Other bias detected (ableism, ageism, etc.)"
      default:
        return ""
    }
  }

  return (
    <TooltipProvider>
      <div className="whitespace-pre-wrap break-words">
        {segments.map((segment, index) => {
          if (segment.biasType) {
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <span className={`px-0.5 rounded ${getBiasColor(segment.biasType)}`}>{segment.text}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getBiasTooltip(segment.biasType)}</p>
                </TooltipContent>
              </Tooltip>
            )
          }
          return <span key={index}>{segment.text}</span>
        })}
      </div>
    </TooltipProvider>
  )
}
