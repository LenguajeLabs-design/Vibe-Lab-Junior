import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home as HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card p-8 rounded-[2rem] border-4 border-white shadow-xl text-center"
      >
        <div className="inline-flex items-center justify-center p-4 bg-accent/20 text-accent-foreground rounded-full mb-6">
          <AlertTriangle className="w-12 h-12 text-accent" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-foreground mb-4">
          Oops!
        </h1>
        
        <p className="text-lg text-foreground/70 font-medium mb-8">
          We couldn't find the page you were looking for. It might have bounced away!
        </p>
        
        <Button 
          size="lg"
          className="w-full text-xl rounded-2xl"
          onClick={() => setLocation('/')}
          data-testid="button-go-home"
        >
          <HomeIcon className="w-6 h-6 mr-2" />
          Back to Lab
        </Button>
      </motion.div>
    </div>
  );
}