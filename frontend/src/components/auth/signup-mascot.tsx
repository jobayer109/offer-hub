'use client';

interface SignupMascotProps {
  step: number; // 0 = idle, 1 = phone entered, 2 = password entered
  typing: boolean;
  mood?: 'neutral' | 'happy' | 'sad';
}

export function SignupMascot({ step, typing, mood = 'neutral' }: SignupMascotProps) {
  const isHappy = mood === 'happy';
  const isSad = mood === 'sad';

  return (
    <div className="flex justify-center mb-3 select-none">
      <div className="relative">
        {/* Gift box */}
        <div
          className={`relative w-24 h-20 transition-transform duration-500 ${
            isHappy ? 'animate-bounce' : isSad ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
        >
          {/* Box lid - lifts as steps progress */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-8 bg-primary rounded-lg shadow-md z-20 transition-all duration-500 ease-out origin-bottom"
            style={{
              transform: `translateX(-50%) rotate(${isHappy ? -20 : step >= 2 ? -12 : step >= 1 ? -5 : 0}deg) translateY(${isHappy ? -14 : step >= 2 ? -8 : step >= 1 ? -3 : 0}px)`,
            }}
          >
            {/* Ribbon on lid */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-primary-foreground/20 rounded" />
            {/* Bow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-end">
              <div className="w-4 h-3 border-2 border-primary-foreground/40 rounded-full -rotate-30 -mr-0.5" />
              <div className="w-2 h-2 bg-primary-foreground/40 rounded-full" />
              <div className="w-4 h-3 border-2 border-primary-foreground/40 rounded-full rotate-30 -ml-0.5" />
            </div>
          </div>

          {/* Box body */}
          <div className={`absolute bottom-0 left-0 w-24 h-16 rounded-lg shadow-inner transition-colors duration-300 ${
            isSad ? 'bg-destructive/70' : 'bg-primary/80'
          }`}>
            {/* Vertical ribbon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-primary-foreground/15 rounded" />

            {/* Face on box */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              {/* Eyes */}
              <div className="flex gap-4 mb-1.5">
                {isSad ? (
                  <>
                    {/* Sad eyes - droopy */}
                    <div className="relative w-3 h-3">
                      <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />
                      <div className="absolute -top-0.5 -left-0.5 w-3.5 h-2 border-b-2 border-primary-foreground/60 rounded-b-full rotate-[-10deg]" />
                    </div>
                    <div className="relative w-3 h-3">
                      <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full" />
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-2 border-b-2 border-primary-foreground/60 rounded-b-full rotate-[10deg]" />
                    </div>
                  </>
                ) : isHappy ? (
                  <>
                    {/* Happy eyes - squinting arcs */}
                    <div className="w-3 h-1.5 border-t-2 border-primary-foreground rounded-t-full" />
                    <div className="w-3 h-1.5 border-t-2 border-primary-foreground rounded-t-full" />
                  </>
                ) : (
                  <>
                    {/* Normal eyes */}
                    <div className={`w-2.5 h-2.5 bg-primary-foreground rounded-full transition-all duration-200 ${typing ? 'scale-y-50' : ''}`}>
                      <div className="w-1 h-1 bg-primary/60 rounded-full mt-0.5 ml-0.5" />
                    </div>
                    <div className={`w-2.5 h-2.5 bg-primary-foreground rounded-full transition-all duration-200 ${typing ? 'scale-y-50' : ''}`}>
                      <div className="w-1 h-1 bg-primary/60 rounded-full mt-0.5 ml-0.5" />
                    </div>
                  </>
                )}
              </div>

              {/* Mouth */}
              {isSad ? (
                /* Sad mouth - upside down curve */
                <div className="w-4 h-2 border-t-2 border-primary-foreground rounded-t-full mt-1" />
              ) : isHappy ? (
                /* Big smile */
                <div className="w-5 h-3 bg-primary-foreground/80 rounded-b-full rounded-t-sm" />
              ) : step >= 2 ? (
                <div className="w-4 h-2.5 bg-primary-foreground/80 rounded-t-full rounded-b-lg" />
              ) : step >= 1 ? (
                <div className="w-3 h-1.5 border-b-2 border-primary-foreground rounded-b-full" />
              ) : (
                <div className="flex gap-0">
                  <div className="w-1.5 h-1 border-b-2 border-r border-primary-foreground rounded-br-full" />
                  <div className="w-1.5 h-1 border-b-2 border-l border-primary-foreground rounded-bl-full" />
                </div>
              )}

              {/* Tears when sad */}
              {isSad && (
                <div className="absolute top-8 flex gap-6">
                  <div className="w-1 h-2 bg-sky-300 rounded-full animate-pulse" />
                  <div className="w-1 h-2 bg-sky-300 rounded-full animate-pulse delay-200" />
                </div>
              )}
            </div>
          </div>

          {/* Confetti/sparkles when happy or step 2 */}
          <div className={`transition-opacity duration-500 ${step >= 2 || isHappy ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute -top-5 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
            <div className="absolute -top-4 right-0 w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce delay-100" />
            <div className="absolute -top-6 left-1/2 w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-200" />
            <div className="absolute -top-3 -right-3 w-2 h-2 bg-green-400 rounded-sm rotate-45 animate-bounce delay-75" />
            <div className="absolute -top-5 -left-4 w-1.5 h-1.5 bg-purple-400 rounded-sm rotate-12 animate-bounce delay-150" />
          </div>

          {/* Extra celebration for happy */}
          {isHappy && (
            <>
              <div className="absolute -top-8 left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
              <div className="absolute -top-7 right-2 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping delay-150" />
            </>
          )}

          {/* Sad cloud */}
          {isSad && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-muted-foreground/40 text-lg">
              &#x2601;
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isSad
                  ? 'w-1.5 bg-destructive/40'
                  : i <= step
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
