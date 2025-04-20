"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, BarChart2, ArrowRight, BookOpen, Code, Heart } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function AboutPage() {
  useEffect(() => {
    // Register ScrollTrigger plugin
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger)

      // Animate sections on scroll
      gsap.utils.toArray(".gsap-reveal").forEach((section: any, i) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          },
        )
      })
    }
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
          About Bias Checker AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Our mission is to promote unbiased communication and foster inclusive dialogue.
        </p>
      </motion.div>

      <Tabs defaultValue="mission" className="w-full mb-12">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="mission" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Our Mission
          </TabsTrigger>
          <TabsTrigger
            value="technology"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            Technology
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Our Team
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mission">
          <div className="gsap-reveal space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2">
                <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                <p className="mb-4">
                  At Bias Checker AI, we envision a world where communication is free from unconscious bias, where ideas
                  are evaluated on their merit rather than the language used to express them, and where everyone feels
                  included in the conversation.
                </p>
                <p>
                  We believe that by making people aware of potential biases in their writing, we can help create more
                  inclusive and effective communication across all domains - from journalism and academia to everyday
                  conversations.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-[400px] aspect-square rounded-full bg-gradient-to-br from-primary/20 to-purple-500/30 p-1 animate-pulse-slow flex items-center justify-center">
                  <Shield className="h-24 w-24 text-primary" />
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Core Values</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-primary/10">
                  <CardContent className="pt-6">
                    <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary w-12 h-12 flex items-center justify-center">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Education</h3>
                    <p className="text-muted-foreground">
                      We believe in educating users about different types of bias and how they manifest in language,
                      rather than simply flagging content.
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-primary/10">
                  <CardContent className="pt-6">
                    <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary w-12 h-12 flex items-center justify-center">
                      <Code className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Transparency</h3>
                    <p className="text-muted-foreground">
                      Our algorithms and detection methods are transparent, and we continuously work to eliminate any
                      bias in our own systems.
                    </p>
                  </CardContent>
                </Card>

                <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-primary/10">
                  <CardContent className="pt-6">
                    <div className="mb-4 p-3 rounded-full bg-primary/10 text-primary w-12 h-12 flex items-center justify-center">
                      <Heart className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Inclusivity</h3>
                    <p className="text-muted-foreground">
                      We strive to create tools that help make communication more inclusive for people of all
                      backgrounds, identities, and perspectives.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="technology">
          <div className="gsap-reveal space-y-8">
            <h2 className="text-2xl font-bold mb-6">Our Technology</h2>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Bias Detection Engine</h3>
              <p className="mb-4">
                Our bias detection system uses a combination of rule-based pattern matching and machine learning
                algorithms to identify potentially biased language across multiple dimensions:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  <strong>Gender Bias:</strong> Detecting gendered language, stereotypes, and assumptions.
                </li>
                <li>
                  <strong>Political Bias:</strong> Identifying politically charged terminology and one-sided framing.
                </li>
                <li>
                  <strong>Racial Bias:</strong> Recognizing language that reinforces racial stereotypes or uses coded
                  language.
                </li>
                <li>
                  <strong>Other Biases:</strong> Detecting ableism, ageism, and other forms of biased language.
                </li>
              </ul>
              <p>
                Each detected instance is categorized, explained, and paired with constructive suggestions for
                improvement.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Content Moderation</h3>
              <p className="mb-4">
                Our platform includes robust content moderation tools to ensure discussions remain respectful and
                constructive:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Toxicity Detection:</strong> Automatically identifies and blocks harmful content.
                </li>
                <li>
                  <strong>Community Reporting:</strong> Allows users to flag problematic content for review.
                </li>
                <li>
                  <strong>User Reputation System:</strong> Rewards positive contributions to the community.
                </li>
              </ul>
            </div>

            <div className="mt-12 text-center">
              <h3 className="text-xl font-bold mb-4">Try Our Technology</h3>
              <Link href="/analyzer">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                >
                  Go to Analyzer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="gsap-reveal space-y-8">
            <h2 className="text-2xl font-bold mb-6">Meet Our Team</h2>

            <p className="mb-8">
              Bias Checker AI was founded by a diverse team of linguists, data scientists, and social scientists
              committed to making communication more inclusive and effective.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Dr. Sarah Chen</h3>
                  <p className="text-sm text-muted-foreground mb-3">Chief Linguistic Officer</p>
                  <p className="text-sm">
                    PhD in Computational Linguistics with 10+ years of experience in natural language processing and
                    bias detection.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <BarChart2 className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Marcus Johnson</h3>
                  <p className="text-sm text-muted-foreground mb-3">Chief Technology Officer</p>
                  <p className="text-sm">
                    Former AI researcher at MIT with expertise in machine learning models for text analysis and
                    classification.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-primary/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">Dr. Aisha Patel</h3>
                  <p className="text-sm text-muted-foreground mb-3">Chief Ethics Officer</p>
                  <p className="text-sm">
                    Specializes in ethical AI development with a focus on fairness, accountability, and transparency in
                    algorithmic systems.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="mb-4">
                Our team is supported by an advisory board of experts in journalism, education, and diversity &
                inclusion.
              </p>
              <Link href="/careers">
                <Button variant="outline">Join Our Team</Button>
              </Link>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <div className="gsap-reveal space-y-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-xl font-medium mb-2">How accurate is the bias detection?</h3>
                <p className="text-muted-foreground">
                  Our system achieves approximately 85-90% accuracy in detecting common forms of bias. We continuously
                  improve our algorithms based on user feedback and new research. We provide confidence scores with each
                  detection to indicate the certainty level.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-xl font-medium mb-2">Is my data private?</h3>
                <p className="text-muted-foreground">
                  Yes, we take privacy seriously. Your analyzed text is not stored permanently unless you explicitly
                  save it to your account. We do not sell or share your data with third parties. You can read our full
                  privacy policy for more details.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-xl font-medium mb-2">Can I use this for my organization?</h3>
                <p className="text-muted-foreground">
                  We offer enterprise plans for organizations that want to integrate our bias detection technology into
                  their workflows. This includes custom API access, team management features, and detailed analytics.
                  Contact our sales team for more information.
                </p>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-xl font-medium mb-2">How do you handle false positives?</h3>
                <p className="text-muted-foreground">
                  We understand that context matters, and our system may occasionally flag content that isn't actually
                  biased. That's why we provide explanations for each detection and allow users to provide feedback.
                  This feedback loop helps us improve the system over time.
                </p>
              </div>

              <div className="pb-4">
                <h3 className="text-xl font-medium mb-2">Is the tool available in languages other than English?</h3>
                <p className="text-muted-foreground">
                  Currently, our tool primarily supports English, but we're actively working on expanding to other
                  languages. Spanish and French support is in beta testing, with more languages planned for the future.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="mb-4">Have more questions? We're here to help!</p>
              <Link href="/contact">
                <Button>Contact Us</Button>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <motion.div
        className="mt-16 text-center gsap-reveal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Ready to Get Started?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/analyzer">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              Try the Analyzer
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">
              Create an Account
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
