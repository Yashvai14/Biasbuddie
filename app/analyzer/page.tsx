"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Info, AlertTriangle, CheckCircle, Loader2, Sparkles } from "lucide-react"
import { analyzeTextForBias, type BiasAnalysisResult, type BiasType } from "@/lib/bias-analyzer"
import HighlightedTextDisplay from "@/components/highlighted-text"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export default function AnalyzerPage() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<BiasAnalysisResult | null>(null)
  const { toast } = useToast()

  const analyzeText = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)

    // Simulate processing time for better UX
    setTimeout(() => {
      const analysisResult = analyzeTextForBias(text)
      setResult(analysisResult)
      setIsAnalyzing(false)

      // Show toast notification
      toast({
        title: "Analysis Complete",
        description:
          analysisResult.overallScore > 0.3
            ? "We've detected some bias in your text."
            : "Your text looks good! Minimal bias detected.",
        variant: analysisResult.overallScore > 0.3 ? "default" : "default",
      })
    }, 1500)
  }

  const getBiasLevel = (score: number) => {
    if (score < 0.3) return { level: "Low", color: "text-green-500", icon: <CheckCircle className="h-5 w-5" /> }
    if (score < 0.7) return { level: "Medium", color: "text-amber-500", icon: <AlertTriangle className="h-5 w-5" /> }
    return { level: "High", color: "text-red-500", icon: <AlertTriangle className="h-5 w-5" /> }
  }

  const getBiasColor = (score: number) => {
    if (score < 0.3) return "bg-green-500"
    if (score < 0.7) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="container py-10 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          Bias Analyzer
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
          <CardHeader>
            <CardTitle>Analyze Your Text</CardTitle>
            <CardDescription>
              Enter your text below to check for potential gender, political, and racial biases and get suggestions for
              improvement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your text here... For example: 'The chairman announced that all policemen should man their stations. The spokesman for the radical left group claimed that conservative policies are destroying our nation.'"
              className="min-h-[200px] mb-4 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              onClick={analyzeText}
              disabled={!text.trim() || isAnalyzing}
              className="w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Text
                  <span className="absolute inset-0 w-full h-full bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-2">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="highlighted"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Highlighted Text
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Bias Details
                </TabsTrigger>
                <TabsTrigger
                  value="suggestions"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
                  <CardHeader>
                    <CardTitle>Bias Analysis Overview</CardTitle>
                    <CardDescription>Summary of the bias analysis for your text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-medium">Overall Bias Level:</span>
                      <span
                        className={`flex items-center gap-1 font-semibold ${getBiasLevel(result.overallScore).color}`}
                      >
                        {getBiasLevel(result.overallScore).icon}
                        {getBiasLevel(result.overallScore).level}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span>Bias Score</span>
                        <span>{(result.overallScore * 100).toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={result.overallScore * 100}
                        className="h-2"
                        indicatorClassName={getBiasColor(result.overallScore)}
                      />
                    </div>

                    <Alert className="bg-primary/5 border-primary/20">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertTitle>Analysis Summary</AlertTitle>
                      <AlertDescription>
                        {result.biasTypes.length > 0 ? (
                          <>
                            Your text has a bias score of {(result.overallScore * 100).toFixed(0)}%. We've detected{" "}
                            {result.biasTypes.length} {result.biasTypes.length === 1 ? "type" : "types"} of potential
                            bias: {result.biasTypes.map((type) => type.type).join(", ")}. See the "Suggestions" tab for
                            ways to improve your text.
                          </>
                        ) : (
                          <>No significant bias detected in your text. Great job!</>
                        )}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="highlighted" className="mt-4">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
                  <CardHeader>
                    <CardTitle>Highlighted Text</CardTitle>
                    <CardDescription>Your text with biased words highlighted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.highlightedText && result.highlightedText.length > 0 ? (
                      <div className="p-4 border rounded-md bg-background">
                        <HighlightedTextDisplay segments={result.highlightedText} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No Bias Detected</h3>
                        <p className="text-muted-foreground max-w-md">
                          We didn't find any biased language in your text. Great job!
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 inline-block bg-pink-200 dark:bg-pink-900 border-b-2 border-pink-500 rounded"></span>
                        <span className="text-sm">Gender bias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 inline-block bg-blue-200 dark:bg-blue-900 border-b-2 border-blue-500 rounded"></span>
                        <span className="text-sm">Political bias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 inline-block bg-amber-200 dark:bg-amber-900 border-b-2 border-amber-500 rounded"></span>
                        <span className="text-sm">Racial bias</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 inline-block bg-purple-200 dark:bg-purple-900 border-b-2 border-purple-500 rounded"></span>
                        <span className="text-sm">Other bias</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
                  <CardHeader>
                    <CardTitle>Detailed Bias Analysis</CardTitle>
                    <CardDescription>Breakdown of the different types of bias detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.biasTypes.length > 0 ? (
                      <div className="space-y-6">
                        {result.biasTypes.map((bias, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <BiasTypeCard biasType={bias} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No Bias Detected</h3>
                        <p className="text-muted-foreground max-w-md">
                          We didn't find any significant gender, political, or racial bias in your text. Great job!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-primary/10">
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                    <CardDescription>Recommendations to make your text more neutral and inclusive</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.suggestions.length > 0 ? (
                      <ul className="space-y-3">
                        {result.suggestions.map((suggestion, index) => (
                          <motion.li
                            key={index}
                            className="flex gap-2 items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-xl font-medium mb-2">No Suggestions Needed</h3>
                        <p className="text-muted-foreground max-w-md">
                          Your text appears to be neutral and inclusive. Keep up the good work!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface BiasTypeCardProps {
  biasType: BiasType
}

function BiasTypeCard({ biasType }: BiasTypeCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "gender":
        return "👫"
      case "political":
        return "🗳️"
      case "racial":
        return "🌍"
      default:
        return "⚠️"
    }
  }

  const getTypeTitle = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1) + " Bias"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence < 0.3) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (confidence < 0.7) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  return (
    <div className="border rounded-lg p-5 hover:shadow-md transition-shadow duration-300 bg-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {getTypeIcon(biasType.type)}
          </span>
          <h3 className="font-medium text-lg">{getTypeTitle(biasType.type)}</h3>
        </div>
        <span className={`text-sm px-2 py-1 rounded-full ${getConfidenceColor(biasType.confidence)}`}>
          {(biasType.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>

      <p className="text-muted-foreground mb-4">{biasType.explanation}</p>

      {biasType.examples.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Examples found in your text:</h4>
          <div className="flex flex-wrap gap-2">
            {biasType.examples.map((example, i) => (
              <span key={i} className="bg-muted px-2 py-1 rounded text-sm">
                "{example}"
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
