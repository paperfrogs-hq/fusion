import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UserIndex() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <img 
                src="/Logo-01-transparent.png" 
                alt="Fusion Logo" 
                className="fusion-logo-lockup mx-auto h-20 w-[240px]"
              />
            </motion.div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Verify Your Audio
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Upload and verify your audio files with blockchain-backed authenticity. 
              Join thousands of users protecting their content.
            </p>

            {/* CTA Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
              {/* Sign In Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="group border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_0_26px_-14px_rgba(182,255,0,0.75)]">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Lock className="w-6 h-6 text-primary" />
                      Sign In
                    </CardTitle>
                    <CardDescription className="text-base">
                      Already have an account? Access your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/user/login">
                      <Button 
                        className="w-full group-hover:scale-105 transition-transform" 
                        size="lg"
                      >
                        Sign In
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      Secure access to your verified audio files
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sign Up Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="group border border-primary/30 bg-gradient-to-br from-card to-primary/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_30px_-14px_rgba(182,255,0,0.85)]">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Zap className="w-6 h-6 text-primary" />
                      Sign Up
                    </CardTitle>
                    <CardDescription className="text-base">
                      New to Fusion? Start your 14-day trial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/user/signup">
                      <Button 
                        variant="hero"
                        className="w-full group-hover:scale-105 transition-transform" 
                        size="lg"
                      >
                        Start 14-Day Trial
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      No credit card required • Start in minutes
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Blockchain Verified</h3>
              <p className="text-sm text-muted-foreground">
                Every audio file is cryptographically secured and timestamped on the blockchain
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Verification</h3>
              <p className="text-sm text-muted-foreground">
                Get real-time verification results with detailed authenticity reports
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Storage</h3>
              <p className="text-sm text-muted-foreground">
                Your files are encrypted and stored securely with enterprise-grade protection
              </p>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-20 pt-12 border-t border-border"
          >
            <p className="text-muted-foreground mb-4">
              Looking for enterprise solutions?
            </p>
            <Link to="/client/login">
              <Button variant="outline" size="lg">
                Access Client Portal
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
