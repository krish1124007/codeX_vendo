"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const isLoading = status === "streaming" || status === "submitted";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform ${
          isOpen ? "scale-0" : "scale-100"
        }`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 sm:w-[400px] ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-foreground">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight">Procurement AI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">How can I help?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ask me about RFQs, quotations, or vendors.
                </p>
              </div>
              <div className="mt-4 flex flex-col w-full gap-2 px-4">
                <Button variant="outline" size="sm" onClick={() => sendMessage({ text: "What are the open RFQs?" })} className="w-full text-xs justify-start">
                  What are the open RFQs?
                </Button>
                <Button variant="outline" size="sm" onClick={() => sendMessage({ text: "Give me a dummy answer" })} className="w-full text-xs justify-start">
                  Give me a dummy answer
                </Button>
              </div>
            </div>
          ) : (
            messages.map((m: any) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role !== "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.parts?.map((part: any, i: number) => {
                    if (part.type === "text") return <span key={i}>{part.text}</span>;
                    if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                      const toolName = part.toolName || part.type.split("-").slice(1).join("-");
                      const message =
                        part.state === "output-available"
                          ? `Completed: ${toolName}`
                          : `Calling: ${toolName}...`;
                      return (
                        <div key={i} className="mt-2 text-xs italic opacity-70">
                          {message}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-foreground">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border bg-background p-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about RFQs or quotations..."
              className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:bg-background"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input?.trim()}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
