import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../cards/Card';
import { Card as CardModel } from '../../types/cards';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const demoCardTop: CardModel = { id: 'demo-1', color: 'blue', type: 'number', value: '7', scoreValue: 7 };
  const demoMatchColor: CardModel = { id: 'demo-2', color: 'blue', type: 'number', value: '3', scoreValue: 3 };
  const demoMatchNumber: CardModel = { id: 'demo-3', color: 'red', type: 'number', value: '7', scoreValue: 7 };
  const demoDrawTwo: CardModel = { id: 'demo-4', color: 'green', type: 'draw2', value: 'draw2', scoreValue: 20 };
  const demoWild: CardModel = { id: 'demo-5', color: 'wild', type: 'wild', value: 'wild', scoreValue: 50 };
  const demoWild4: CardModel = { id: 'demo-6', color: 'wild', type: 'wild4', value: 'wild4', scoreValue: 50 };

  const steps = [
    {
      title: '1. Basic Matching Rules',
      description: 'On your turn, play a card from your hand that matches the Discard pile\'s current color OR number/symbol.',
      visual: (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400 mb-1">Top Discard</span>
              <Card card={demoCardTop} size="sm" disabled />
            </div>
            <span className="text-2xl text-slate-500 font-bold">←</span>
            <div className="flex space-x-3">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-300 mb-1">Match Color!</span>
                <Card card={demoMatchColor} size="sm" isPlayable />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-rose-300 mb-1">Match Number!</span>
                <Card card={demoMatchNumber} size="sm" isPlayable />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '2. Action Cards (Skip, Reverse, Draw Two)',
      description: 'Action cards disrupt your opponents! Draw Two forces the next player to draw 2 cards and lose their turn. Skip cancels their turn, and Reverse flips the direction of play.',
      visual: (
        <div className="flex items-center justify-center space-x-4">
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-emerald-300 mb-1">+2 Cards</span>
            <Card card={demoDrawTwo} size="sm" disabled />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-cyan-300 mb-1">Skip Turn</span>
            <Card card={{ id: 'demo-skip', color: 'yellow', type: 'skip', value: 'skip', scoreValue: 20 }} size="sm" disabled />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-rose-300 mb-1">Reverse Play</span>
            <Card card={{ id: 'demo-rev', color: 'red', type: 'reverse', value: 'reverse', scoreValue: 20 }} size="sm" disabled />
          </div>
        </div>
      ),
    },
    {
      title: '3. Wild & Wild Draw Four',
      description: 'Wild cards can be played on any turn. When played, you choose the active color. Wild Draw Four gives the next player 4 cards, skips their turn, and lets you pick the color!',
      visual: (
        <div className="flex items-center justify-center space-x-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-purple-300 mb-1 font-bold">Wild</span>
            <Card card={demoWild} size="sm" disabled />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-fuchsia-300 mb-1 font-bold">Wild Draw Four</span>
            <Card card={demoWild4} size="sm" disabled />
          </div>
        </div>
      ),
    },
    {
      title: '4. Calling UNO & Catching Opponents',
      description: 'When you are about to play down to your LAST card, you MUST shout "UNO!" by pressing the UNO button. If you forget and an opponent catches you, you must draw 2 penalty cards!',
      visual: (
        <div className="flex flex-col items-center space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
          <div className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-sm rounded-xl shadow-neon-red border border-yellow-300 animate-pulse">
            🚨 CALL UNO!
          </div>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Watch opponents carefully! If they hold 1 card and forgot to shout UNO, tap "CATCH UNO!" to penalize them!
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-left"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
            HOW TO PLAY
          </span>
          <span className="text-xs text-slate-400">Step {currentStep + 1} of {steps.length}</span>
        </div>

        {/* Step Visual and Explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[260px] flex flex-col justify-between"
          >
            <div>
              <h3 className="font-display font-black text-xl text-white">
                {steps[currentStep].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="py-4">
              {steps[currentStep].visual}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              currentStep === 0 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-indigo-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md"
            >
              <span>Got It!</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
