import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

// Generate a simple device ID based on browser fingerprint
function getDeviceId(): string {
  const stored = localStorage.getItem('chatbot_device_id');
  if (stored) return stored;
  
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('chatbot_device_id', deviceId);
  return deviceId;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [deviceId] = useState(() => getDeviceId());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch predefined questions
  const { data: questionsData } = useQuery({
    queryKey: ['/api/chatbot/questions'],
    enabled: isOpen,
  });

  // Fetch remaining questions count
  const { data: remainingData, refetch: refetchRemaining } = useQuery({
    queryKey: ['/api/chatbot/remaining', deviceId],
    enabled: isOpen,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, deviceId }),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data: { response: string; remaining: number }) => {
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_bot',
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
      }]);
      
      // Refetch remaining count
      refetchRemaining();
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot/remaining', deviceId] });
    },
    onError: (error: any) => {
      if (error.message.includes('429')) {
        toast({
          title: "Daily Limit Reached",
          description: "You've reached your daily limit of 5 questions. Try again tomorrow!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Sorry, I couldn't process your question. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim() || chatMutation.isPending) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: message,
      timestamp: new Date(),
    }]);

    // Clear input
    setInputValue("");

    // Send to API
    chatMutation.mutate(message);
  };

  const handlePredefinedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'bot',
        content: "Hi! I'm your AI assistant for this platform. I can help you discover tools, explain features, and answer questions about our catalog. What would you like to know?",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  const predefinedQuestions = (questionsData as { questions?: string[] })?.questions || [];
  const remaining = (remainingData as { remaining?: number })?.remaining ?? 5;

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]">
          <Card className="h-full flex flex-col glass-card border-0 shadow-2xl">
            {/* Header */}
            <CardHeader className="pb-3 px-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">AI Assistant</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>{remaining} questions left today</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 px-4 pb-4 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.type === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-muted'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {chatMutation.isPending && (
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="h-1 w-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-1 w-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-1 w-1 bg-current rounded-full animate-bounce"></div>
                          </div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Predefined Questions */}
              {messages.length === 1 && predefinedQuestions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Quick questions:</div>
                  <div className="flex flex-wrap gap-1">
                    {predefinedQuestions.slice(0, 3).map((question: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePredefinedQuestion(question)}
                        disabled={chatMutation.isPending || remaining <= 0}
                        className="text-xs h-7 px-2"
                      >
                        {question.length > 20 ? question.substring(0, 20) + '...' : question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={remaining > 0 ? "Ask me anything about the platform..." : "Daily limit reached"}
                    disabled={chatMutation.isPending || remaining <= 0}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    type="submit"
                    size="sm"
                    disabled={!inputValue.trim() || chatMutation.isPending || remaining <= 0}
                    className="px-3"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {remaining <= 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    You've reached your daily limit. Come back tomorrow!
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}