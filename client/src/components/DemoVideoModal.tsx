import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // 2 minutes demo

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-navy-primary">
                Chronicare Platform Demo
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                Discover how Chronicare transforms your health management experience
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Video Container */}
        <div className="relative flex-1 bg-gradient-to-br from-navy-primary to-slate-800 flex items-center justify-center">
          {/* Simulated Video Content */}
          <div className="w-full h-full relative overflow-hidden">
            {/* Health Dashboard Simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-float">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-teal-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-primary mb-2">Interactive Health Dashboard</h3>
                  <p className="text-slate-600">See how easy it is to track your health metrics</p>
                </div>
                
                {/* Simulated Health Cards */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Blood Pressure</p>
                      <p className="text-2xl font-bold text-green-600">120/80</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-800">Glucose Level</p>
                      <p className="text-2xl font-bold text-blue-600">95 mg/dL</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-purple-800">Medication</p>
                      <p className="text-sm text-purple-600">Next dose: 2:00 PM</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm w-20 h-20 rounded-full"
                >
                  <Play className="w-8 h-8 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-teal-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  <Play className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestart}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Features List */}
        <div className="px-6 py-4 bg-slate-50 border-t">
          <h4 className="font-semibold text-navy-primary mb-3">What you'll see in this demo:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-primary rounded-full"></div>
              <span>Real-time health monitoring dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-primary rounded-full"></div>
              <span>Medication reminders and tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-primary rounded-full"></div>
              <span>Personalized care plan creation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-teal-primary rounded-full"></div>
              <span>Health reports and analytics</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}