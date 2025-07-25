import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedbackData {
  name?: string;
  email?: string;
  message: string;
  userAgent?: string;
  ipAddress?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message, userAgent, ipAddress }: FeedbackData = await req.json()

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Insert feedback into database
    const { data: feedbackData, error: insertError } = await supabase
      .from('feedback')
      .insert({
        name: name || null,
        email: email || null,
        message: message.trim(),
        user_agent: userAgent || null,
        ip_address: ipAddress || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting feedback:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email notification using Resend
    const emailContent = `
New feedback received from Toss or Taste App

Name: ${name || 'Not provided'}
Email: ${email || 'Not provided'}
Message: ${message}

User Agent: ${userAgent || 'Not provided'}
IP Address: ${ipAddress || 'Not provided'}
Timestamp: ${new Date().toISOString()}
Feedback ID: ${feedbackData.id}
    `.trim()

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: 'linksmarttechllc@gmail.com',
          subject: 'New Feedback - Toss or Taste App',
          text: emailContent,
        }),
      })

      if (emailResponse.ok) {
        // Update feedback record to mark email as sent
        await supabase
          .from('feedback')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
          })
          .eq('id', feedbackData.id)
        
        console.log('Email sent successfully for feedback ID:', feedbackData.id)
      } else {
        const errorText = await emailResponse.text()
        console.error('Failed to send email:', errorText)
        // Still mark as processed but log the email failure
        await supabase
          .from('feedback')
          .update({
            processed_at: new Date().toISOString(),
          })
          .eq('id', feedbackData.id)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      // Still mark as processed but log the email error
      await supabase
        .from('feedback')
        .update({
          processed_at: new Date().toISOString(),
        })
        .eq('id', feedbackData.id)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Feedback submitted successfully',
        id: feedbackData.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing feedback:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 