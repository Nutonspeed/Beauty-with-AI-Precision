import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateTreatmentRecommendation(
  skinAnalysis: any,
  userPreferences: any
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional aesthetic treatment advisor. Based on skin analysis results, provide personalized treatment recommendations."
        },
        {
          role: "user",
          content: `Based on this skin analysis: ${JSON.stringify(skinAnalysis)} and user preferences: ${JSON.stringify(userPreferences)}, provide 3 recommended treatments with explanations.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate treatment recommendations')
  }
}

export async function analyzeSkinImage(imageBase64: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this skin image and identify skin concerns, conditions, and overall skin health. Provide detailed analysis."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('OpenAI Vision API error:', error)
    throw new Error('Failed to analyze skin image')
  }
}
