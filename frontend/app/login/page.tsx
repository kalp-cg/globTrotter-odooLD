"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLogin, useSignup } from "@/lib/hooks/useAuth";
import { StampButton } from "@/components/ui/stamp-button";
import { RouteLine } from "@/components/ui/route-line";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const router = useRouter();
  const controls = useAnimation();
  
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  
  const isLoading = loginMutation.isPending || signupMutation.isPending;
  const apiError = loginMutation.error || signupMutation.error;

  // Debounced email validation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (email.length > 0) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) setEmailError("Looks like a typo in the email address!");
        else setEmailError("");
      } else {
        setEmailError("");
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [email]);

  const triggerWobble = async () => {
    await controls.start({
      x: [-5, 5, -5, 5, 0],
      transition: { duration: 0.4 }
    });
  };

  useEffect(() => {
    if (apiError) {
      triggerWobble();
    }
  }, [apiError]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (emailError || !email || !password) {
      triggerWobble();
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      // Assuming signup takes name and email. We'll pass a default name if not collected.
      signupMutation.mutate({ email, password, name: "Traveler" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl relative">
        {/* Offset shadow paper */}
        <div 
          className="absolute inset-0 bg-kraft -z-10"
          style={{ transform: "rotate(1deg) translate(8px, 12px)", borderRadius: "2px" }}
        />

        {/* Main Postcard Panel */}
        <motion.div 
          animate={controls}
          className="bg-paper flex flex-col md:flex-row w-full border border-kraft/30 overflow-hidden"
          style={{ 
            transform: "rotate(-1deg)",
            clipPath: "polygon(1% 0%, 99% 1%, 100% 99%, 0% 98%)",
            borderRadius: "2px"
          }}
        >
          {/* Left Half: Map Illustration */}
          <div className="w-full md:w-5/12 bg-kraft/10 p-8 border-b md:border-b-0 md:border-r border-kraft/30 flex flex-col justify-between min-h-[250px] relative">
            <div>
              <h1 className="font-display text-4xl text-ink leading-tight">GlobeTrotter</h1>
              <p className="font-body text-ink/70 mt-2 text-lg">Your scrapbook, your journey.</p>
            </div>
            
            {/* Hand-drawn route connecting pinned cities */}
            <div className="absolute bottom-8 left-8 right-8 top-32 pointer-events-none">
              {/* City Pins */}
              <div className="absolute top-[10%] left-[20%] w-3 h-3 rounded-full bg-postal border-2 border-ink z-10" />
              <div className="absolute top-[50%] right-[30%] w-3 h-3 rounded-full bg-postal border-2 border-ink z-10" />
              <div className="absolute bottom-[20%] left-[40%] w-3 h-3 rounded-full bg-postal border-2 border-ink z-10" />
              
              <div className="absolute inset-0 z-0">
                <RouteLine startX={20} startY={20} endX={70} endY={50} />
              </div>
              <div className="absolute inset-0 z-0">
                <RouteLine startX={70} startY={50} endX={40} endY={80} />
              </div>
            </div>
          </div>

          {/* Right Half: Form */}
          <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-8 flex flex-col items-center">
                <PaperSkeleton className="h-10 w-3/4 mb-4" />
                <PaperSkeleton className="h-10 w-full" />
                <PaperSkeleton className="h-10 w-full" />
                <PaperSkeleton className="h-14 w-1/2 mt-8" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <h2 className="font-display text-3xl text-ink">
                  {mode === "login" ? "Welcome back" : "Start your journal"}
                </h2>

                <div className="space-y-10">
                  <div className="relative">
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Email address"
                      className="w-full bg-transparent border-b-2 border-ink/40 border-dashed focus:border-ink focus:border-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-4 focus-visible:ring-offset-paper px-2 py-2 font-body text-xl text-ink placeholder:text-ink/30 transition-colors"
                      required
                    />
                    {/* Inline Validation Scribble */}
                    {emailError && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 mt-1 flex flex-col text-postal"
                      >
                        <span className="font-display text-sm leading-none">{emailError}</span>
                        <svg className="w-12 h-2 mt-0.5 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 10">
                          <path d="M0,5 Q25,8 50,3 T100,6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  <div className="relative">
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Password"
                      className="w-full bg-transparent border-b-2 border-ink/40 border-dashed focus:border-ink focus:border-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold focus-visible:ring-offset-4 focus-visible:ring-offset-paper px-2 py-2 font-body text-xl text-ink placeholder:text-ink/30 transition-colors"
                      required
                    />
                  </div>
                </div>

                {apiError && (
                  <div className="font-display text-postal text-lg text-center mt-4">
                    {apiError.message || "Something went wrong. Try again!"}
                  </div>
                )}

                <div className="pt-6 flex flex-col items-center gap-6">
                  <StampButton type="submit" variant="primary" className="w-full sm:w-auto min-w-[200px]">
                    {mode === "login" ? "Log in" : "Sign up"}
                  </StampButton>

                  <div className="flex flex-col items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "signup" : "login");
                        setEmailError("");
                        if (apiError) loginMutation.reset();
                      }}
                      className="font-body text-denim underline decoration-2 decoration-denim/30 underline-offset-4 hover:decoration-denim transition-colors focus-visible:ring-2 focus-visible:ring-marigold focus-visible:outline-none"
                    >
                      {mode === "login" ? "Need an account? Sign up" : "Already traveling? Log in"}
                    </button>
                    
                    {mode === "login" && (
                      <a href="#" className="font-mono text-xs text-ink/60 hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-marigold focus-visible:outline-none p-1">
                        Forgot password?
                      </a>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
