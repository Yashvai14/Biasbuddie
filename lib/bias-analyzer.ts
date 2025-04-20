// Custom bias analyzer model

// Types for bias analysis
export interface BiasAnalysisResult {
  overallScore: number // 0-1 where 0 is unbiased and 1 is extremely biased
  biasTypes: BiasType[]
  suggestions: string[]
  highlightedText?: HighlightedText[] // Added for highlighting biased words
}

export interface BiasType {
  type: "gender" | "political" | "racial" | "other"
  confidence: number // 0-1
  examples: string[]
  explanation: string
}

// New interface for highlighted text
export interface HighlightedText {
  text: string
  biasType?: "gender" | "political" | "racial" | "other"
  patternIndex?: number
}

// Bias detection patterns
const biasPatterns = {
  gender: {
    patterns: [
      {
        regex: /\b(mankind|manpower|manmade|chairman|policeman|fireman|stewardess|waitress|actress)\b/gi,
        weight: 0.6,
        suggestion:
          "Consider using gender-neutral terms like 'humanity', 'workforce', 'artificial', 'chair', 'police officer', 'firefighter', 'flight attendant', 'server', 'actor'.",
      },
      {
        regex: /\b(he|his|him)\b/gi,
        weight: 0.2,
        suggestion: "If not referring to a specific man, consider using 'they/their/them' for gender neutrality.",
      },
      {
        regex: /\b(she|her|hers)\b/gi,
        weight: 0.2,
        suggestion: "If not referring to a specific woman, consider using 'they/their/them' for gender neutrality.",
      },
      {
        regex: /\b(girls|ladies|gals|guys|boys|men|women)\b/gi,
        weight: 0.3,
        suggestion: "When referring to mixed gender groups, consider using 'people', 'folks', 'team', or 'everyone'.",
      },
      {
        regex: /\b(hysterical|emotional|bossy|shrill|nagging|bitchy)\b/gi,
        weight: 0.8,
        suggestion: "These terms are often applied in a gender-biased way. Consider more neutral descriptors.",
      },
      {
        regex: /\b(man up|grow a pair|don't be a girl|like a girl)\b/gi,
        weight: 0.9,
        suggestion: "These phrases reinforce gender stereotypes. Consider more inclusive language.",
      },
    ],
    explanation: "Gender bias involves language that treats genders unequally or reinforces gender stereotypes.",
  },

  political: {
    patterns: [
      {
        regex: /\b(leftist|left-wing|liberal|socialist|communist)\b/gi,
        weight: 0.5,
        suggestion: "These political labels can be loaded terms. Consider more specific policy descriptions.",
      },
      {
        regex: /\b(right-wing|conservative|fascist|alt-right)\b/gi,
        weight: 0.5,
        suggestion: "These political labels can be loaded terms. Consider more specific policy descriptions.",
      },
      {
        regex: /\b(radical|extremist|fanatic)\b/gi,
        weight: 0.7,
        suggestion: "These terms can be politically charged. Consider more neutral descriptions of specific positions.",
      },
      {
        regex: /\b(snowflake|libtard|republicant|trumptard|democrap)\b/gi,
        weight: 0.9,
        suggestion:
          "These are derogatory political terms. Consider respectful language when discussing different viewpoints.",
      },
      {
        regex: /\b(mainstream media|fake news|deep state|elites)\b/gi,
        weight: 0.6,
        suggestion: "These terms often carry political bias. Consider more specific and neutral descriptions.",
      },
      {
        regex: /\b(woke|cancel culture|political correctness)\b/gi,
        weight: 0.6,
        suggestion: "These terms have become politically charged. Consider more specific descriptions of the issues.",
      },
    ],
    explanation:
      "Political bias involves language that favors one political viewpoint over others or uses politically charged terminology.",
  },

  racial: {
    patterns: [
      {
        regex: /\b(thug|ghetto|urban|inner city|welfare queen)\b/gi,
        weight: 0.7,
        suggestion: "These terms can carry racial connotations. Consider more specific and neutral language.",
      },
      {
        regex: /\b(illegal alien|illegal immigrant)\b/gi,
        weight: 0.6,
        suggestion: "Consider 'undocumented immigrant' or 'person without legal status' for more neutral language.",
      },
      {
        regex: /\b(articulate|well-spoken)\b/gi,
        weight: 0.4,
        suggestion:
          "When applied to minorities, these terms can imply surprise at their abilities. Consider whether you would use this descriptor for everyone.",
      },
      {
        regex: /\b(exotic|oriental|colored|ethnic)\b/gi,
        weight: 0.8,
        suggestion: "These terms can otherize racial groups. Consider more specific and respectful terminology.",
      },
      {
        regex: /\b(civilized|primitive|savage|tribal)\b/gi,
        weight: 0.7,
        suggestion:
          "These terms often carry colonial and racial bias. Consider more neutral and specific descriptions.",
      },
      {
        regex: /\b(model minority|credit to their race)\b/gi,
        weight: 0.8,
        suggestion:
          "These phrases reinforce racial stereotypes. Consider discussing individual achievements without racial framing.",
      },
    ],
    explanation: "Racial bias involves language that treats racial groups unequally or reinforces racial stereotypes.",
  },

  other: {
    patterns: [
      {
        regex: /\b(crazy|insane|psycho|schizo|retarded|lame)\b/gi,
        weight: 0.7,
        suggestion: "These terms can be ableist. Consider more specific and respectful language.",
      },
      {
        regex: /\b(old|elderly|senior citizen)\b/gi,
        weight: 0.3,
        suggestion: "Consider 'older adult' or specific age ranges when relevant.",
      },
      {
        regex: /\b(fat|obese|overweight|skinny)\b/gi,
        weight: 0.5,
        suggestion: "Body-related terms can carry bias. Consider whether physical descriptions are necessary.",
      },
      {
        regex: /\b(third world|developing country)\b/gi,
        weight: 0.5,
        suggestion: "Consider 'low-income country' or naming specific regions/countries.",
      },
      {
        regex: /\b(poor|poverty-stricken|disadvantaged)\b/gi,
        weight: 0.4,
        suggestion: "Consider 'economically marginalized' or more specific descriptions of economic conditions.",
      },
      {
        regex: /\b(normal|abnormal|natural|unnatural)\b/gi,
        weight: 0.5,
        suggestion: "These terms can imply value judgments. Consider more specific and neutral descriptions.",
      },
    ],
    explanation: "Other biases include ableism, ageism, classism, and other forms of prejudice in language.",
  },
}

// Function to analyze text for bias
export function analyzeTextForBias(text: string): BiasAnalysisResult {
  if (!text || text.trim() === "") {
    return {
      overallScore: 0,
      biasTypes: [],
      suggestions: [],
    }
  }

  const result: BiasAnalysisResult = {
    overallScore: 0,
    biasTypes: [],
    suggestions: [],
    highlightedText: [],
  }

  const uniqueSuggestions = new Set<string>()
  const biasTypeResults = new Map<string, BiasType>()
  const biasMatches: { index: number; length: number; biasType: string; patternIndex: number }[] = []

  // Initialize bias types
  Object.keys(biasPatterns).forEach((type) => {
    biasTypeResults.set(type, {
      type: type as any,
      confidence: 0,
      examples: [],
      explanation: biasPatterns[type as keyof typeof biasPatterns].explanation,
    })
  })

  // Check for each bias pattern
  Object.entries(biasPatterns).forEach(([biasType, { patterns, explanation }]) => {
    const typeKey = biasType as "gender" | "political" | "racial" | "other"
    const biasTypeResult = biasTypeResults.get(biasType)!

    patterns.forEach((pattern, patternIndex) => {
      // Use a non-global regex for finding all matches with their positions
      const regex = new RegExp(pattern.regex.source, "gi")
      let match

      while ((match = regex.exec(text)) !== null) {
        // Add to confidence score based on matches and their weights
        const confidenceIncrement = Math.min(0.1 + pattern.weight * 0.1, 1)
        biasTypeResult.confidence = Math.min(biasTypeResult.confidence + confidenceIncrement, 1)

        // Add unique examples (up to 3 per pattern)
        if (biasTypeResult.examples.length < 3 && !biasTypeResult.examples.includes(match[0])) {
          biasTypeResult.examples.push(match[0])
        }

        // Store match position for highlighting
        biasMatches.push({
          index: match.index,
          length: match[0].length,
          biasType: biasType,
          patternIndex: patternIndex,
        })

        // Add suggestion
        uniqueSuggestions.add(pattern.suggestion)
      }
    })

    // Only keep bias types with confidence > 0
    if (biasTypeResult.confidence > 0) {
      biasTypeResults.set(biasType, biasTypeResult)
    } else {
      biasTypeResults.delete(biasType)
    }
  })

  // Calculate overall score as average of all bias type confidences
  const biasTypes = Array.from(biasTypeResults.values())
  if (biasTypes.length > 0) {
    result.overallScore = biasTypes.reduce((sum, type) => sum + type.confidence, 0) / biasTypes.length
  }

  result.biasTypes = biasTypes
  result.suggestions = Array.from(uniqueSuggestions)

  // Add general suggestions if bias is detected
  if (result.overallScore > 0) {
    if (result.overallScore > 0.7) {
      result.suggestions.unshift("Consider revising your text to reduce significant bias.")
    } else if (result.overallScore > 0.3) {
      result.suggestions.unshift("Your text contains some bias. Consider the suggestions below.")
    } else {
      result.suggestions.unshift("Your text contains minimal bias, but could be improved with the suggestions below.")
    }
  } else {
    result.suggestions.push("No significant bias detected in your text.")
  }

  // Generate highlighted text segments
  if (biasMatches.length > 0) {
    // Sort matches by their position in the text
    biasMatches.sort((a, b) => a.index - b.index)

    let lastIndex = 0
    const highlightedSegments: HighlightedText[] = []

    // Process each match to create text segments
    for (const match of biasMatches) {
      // Add non-biased text before the match
      if (match.index > lastIndex) {
        highlightedSegments.push({
          text: text.substring(lastIndex, match.index),
        })
      }

      // Add the biased text segment
      highlightedSegments.push({
        text: text.substring(match.index, match.index + match.length),
        biasType: match.biasType as any,
        patternIndex: match.patternIndex,
      })

      lastIndex = match.index + match.length
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      highlightedSegments.push({
        text: text.substring(lastIndex),
      })
    }

    result.highlightedText = highlightedSegments
  } else {
    // If no bias detected, just return the original text
    result.highlightedText = [{ text }]
  }

  return result
}

// Function to check for toxic content
export function checkToxicContent(text: string): { isToxic: boolean; reason?: string } {
  if (!text || text.trim() === "") {
    return { isToxic: false }
  }

  // Enhanced toxic patterns with more comprehensive detection
  const toxicPatterns = [
    // Profanity
    {
      regex: /\b(fuck|shit|ass|bitch|cunt|dick|pussy|cock|whore|slut|asshole|motherfuck|bullshit|piss|damn)\b/gi,
      reason: "Profanity",
    },
    // Racial slurs - expanded list
    {
      regex: /\b(nigger|nigga|chink|spic|kike|wetback|gook|towelhead|raghead|redskin|beaner|coon|gringo|jap)\b/gi,
      reason: "Racial slurs",
    },
    // Homophobic/transphobic slurs - expanded list
    {
      regex: /\b(fag|faggot|dyke|tranny|homo|queer|sissy|ladyboy|shemale)\b/gi,
      reason: "Homophobic/transphobic slurs",
    },
    // Ableist slurs - expanded list
    {
      regex: /\b(retard|retarded|spaz|spastic|cripple|vegetable|mongoloid|moron|idiot|imbecile)\b/gi,
      reason: "Ableist slurs",
    },
    // Self-harm encouragement - expanded patterns
    {
      regex: /\b(kill yourself|kys|commit suicide|neck yourself|end your life|jump off|slit your|hang yourself)\b/gi,
      reason: "Self-harm encouragement",
    },
    // Violent content - expanded patterns
    {
      regex: /\b(i(\s|\w)*hate(\s|\w)*you|die|death to|should be killed|hope you die|deserve to die|will kill you)\b/gi,
      reason: "Violent content",
    },
    // Sexual violence - expanded patterns
    {
      regex: /\b(rape|molest|sexually assault|grope|force yourself|non-consensual)\b/gi,
      reason: "Sexual violence",
    },
    // Threats - new category
    {
      regex: /\b(i(\s|\w)*will(\s|\w)*find(\s|\w)*you|come for you|hunt you down|track you|stalk you)\b/gi,
      reason: "Threatening language",
    },
    // Doxxing - new category
    {
      regex: /\b(your address is|your ip is|i know where you live|i found your home|your location is)\b/gi,
      reason: "Personal information/doxxing",
    },
    // Harassment - new category
    {
      regex: /\b(keep crying|triggered|snowflake|nobody cares|nobody asked|attention seeker)\b/gi,
      reason: "Harassment",
    },
  ]

  // Check each pattern
  for (const pattern of toxicPatterns) {
    if (pattern.regex.test(text)) {
      return { isToxic: true, reason: pattern.reason }
    }
  }

  // Check for excessive capitalization (shouting)
  const words = text.split(/\s+/)
  const capsWords = words.filter((word) => word.length > 3 && word === word.toUpperCase())
  if (words.length >= 5 && capsWords.length / words.length > 0.6) {
    return { isToxic: true, reason: "Excessive capitalization (shouting)" }
  }

  // Check for character repetition (e.g., "!!!!!")
  const repeatedCharsRegex = /([!?.])\1{4,}/
  if (repeatedCharsRegex.test(text)) {
    return { isToxic: true, reason: "Excessive punctuation" }
  }

  return { isToxic: false }
}
