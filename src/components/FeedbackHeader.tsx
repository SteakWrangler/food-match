import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  message: z.string().min(1, 'Please enter your feedback'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create email content
      const emailSubject = encodeURIComponent('Toss or Taste Feedback');
      const emailBody = encodeURIComponent(
        `Feedback from Toss or Taste App\n\n` +
        `Name: ${data.name || 'Not provided'}\n` +
        `Email: ${data.email || 'Not provided'}\n\n` +
        `Message:\n${data.message}`
      );
      
      // Open default email client
      window.location.href = `mailto:linksmarttechllc@gmail.com?subject=${emailSubject}&body=${emailBody}`;
      
      // Show success toast
      toast({
        title: "Feedback sent!",
        description: "Your feedback has been opened in your email client. Please send the email to complete the process.",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-orange-600 hover:bg-orange-50 p-2 h-8 w-8"
            title="Send feedback or report issues"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send Feedback
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about the bug you found or suggestions you have..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackHeader; 