import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Clock className="w-16 h-16 mx-auto text-blue-500 animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Coming Soon
        </h1>
        
        <p className="text-lg text-slate-300 mb-8">
          Subscription and billing features are coming soon. We're working on bringing you the best pricing and plans.
        </p>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <p className="text-sm text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">Stay tuned!</span>
          </p>
          <p className="text-sm text-slate-400">
            Early access users will be notified as soon as this launches.
          </p>
        </div>

        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="w-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
