// Advanced AI Features Demo Page
'use client';

import { useState } from 'react';
import { AIErrorBoundary } from '@/components/error-boundary';
import SkinAnalysisComponent from '@/components/skin-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Calendar, MessageSquare, Image as ImageIcon } from 'lucide-react';

function AdvancedAIContent() {
  const [activeTab, setActiveTab] = useState('skin-analysis');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Sparkles className="h-16 w-16" />
            </div>
            <h1 className="text-5xl font-bold">Advanced AI Features</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Experience cutting-edge AI technology for personalized skincare analysis, virtual makeup try-on, and intelligent recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Sparkles className="h-12 w-12 mx-auto text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Skin Analysis</h3>
              <p className="text-sm text-gray-600">
                AI-powered detection of 15+ skin conditions
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Wand2 className="h-12 w-12 mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Virtual Makeup</h3>
              <p className="text-sm text-gray-600">
                Try on makeup products virtually
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">Skincare Routine</h3>
              <p className="text-sm text-gray-600">
                Personalized daily routines
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageSquare className="h-12 w-12 mx-auto text-orange-600 mb-3" />
              <h3 className="font-semibold mb-2">AI Chatbot</h3>
              <p className="text-sm text-gray-600">
                Get instant skincare advice
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <ImageIcon className="h-12 w-12 mx-auto text-pink-600 mb-3" />
              <h3 className="font-semibold mb-2">Outcome Prediction</h3>
              <p className="text-sm text-gray-600">
                Visualize treatment results
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="skin-analysis">
              <Sparkles className="h-4 w-4 mr-2" />
              Skin Analysis
            </TabsTrigger>
            <TabsTrigger value="virtual-makeup">
              <Wand2 className="h-4 w-4 mr-2" />
              Virtual Makeup
            </TabsTrigger>
            <TabsTrigger value="skincare-routine">
              <Calendar className="h-4 w-4 mr-2" />
              Skincare Routine
            </TabsTrigger>
            <TabsTrigger value="ai-chatbot">
              <MessageSquare className="h-4 w-4 mr-2" />
              AI Chatbot
            </TabsTrigger>
            <TabsTrigger value="outcome-prediction">
              <ImageIcon className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
          </TabsList>

          {/* Skin Analysis Tab */}
          <TabsContent value="skin-analysis">
            <SkinAnalysisComponent />
          </TabsContent>

          {/* Virtual Makeup Tab */}
          <TabsContent value="virtual-makeup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-6 w-6" />
                  Virtual Makeup Try-On
                </CardTitle>
                <CardDescription>
                  Try different makeup looks virtually before purchasing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <Wand2 className="h-16 w-16 mx-auto text-purple-400" />
                  <h3 className="text-xl font-semibold">Virtual Makeup Try-On</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Upload your photo and try on different makeup products including lipsticks, eyeshadows, blush, and more.
                    See how products look on you before buying!
                  </p>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500">
                      Features: 50+ products • Real-time preview • Multiple looks • Save & share
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skincare Routine Tab */}
          <TabsContent value="skincare-routine">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  Personalized Skincare Routine
                </CardTitle>
                <CardDescription>
                  Get a customized morning and evening skincare routine based on your skin type and concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <Calendar className="h-16 w-16 mx-auto text-green-400" />
                  <h3 className="text-xl font-semibold">Skincare Routine Generator</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Answer a few questions about your skin, and our AI will create a personalized morning and evening routine
                    with product recommendations tailored to your needs.
                  </p>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500">
                      Includes: Morning routine • Evening routine • Weekly treatments • Product suggestions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Chatbot Tab */}
          <TabsContent value="ai-chatbot">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  AI Skincare Chatbot
                </CardTitle>
                <CardDescription>
                  Chat with our AI assistant for instant skincare advice and product recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <MessageSquare className="h-16 w-16 mx-auto text-orange-400" />
                  <h3 className="text-xl font-semibold">AI Skincare Assistant</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Ask questions about skincare, get product recommendations, learn about ingredients, 
                    and receive personalized advice from our GPT-4 powered chatbot.
                  </p>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500">
                      24/7 available • Product knowledge • Ingredient info • Treatment advice
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outcome Prediction Tab */}
          <TabsContent value="outcome-prediction">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-6 w-6" />
                  Treatment Outcome Prediction
                </CardTitle>
                <CardDescription>
                  Visualize potential treatment results with AI-generated before/after predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 space-y-4">
                  <ImageIcon className="h-16 w-16 mx-auto text-pink-400" />
                  <h3 className="text-xl font-semibold">Before & After Prediction</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    See how your skin could look after following recommended treatments. 
                    Our AI generates realistic predictions based on your current condition and treatment plan.
                  </p>
                  <div className="pt-4">
                    <p className="text-sm text-gray-500">
                      AI-generated results • Timeline predictions • Treatment tracking • Progress photos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technology Section */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Powered by Advanced AI</CardTitle>
              <CardDescription>
                Our platform uses cutting-edge artificial intelligence and machine learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Computer Vision</h3>
                  <p className="text-sm text-gray-600">
                    Advanced image recognition to analyze skin conditions with high accuracy
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Deep Learning</h3>
                  <p className="text-sm text-gray-600">
                    Neural networks trained on thousands of dermatological cases
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Natural Language Processing</h3>
                  <p className="text-sm text-gray-600">
                    GPT-4 powered chatbot for intelligent skincare conversations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdvancedAIPage() {
  return (
    <AIErrorBoundary>
      <AdvancedAIContent />
    </AIErrorBoundary>
  )
}
