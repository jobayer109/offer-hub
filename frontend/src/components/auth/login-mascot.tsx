'use client';

interface LoginMascotProps {
  watching: 'idle' | 'phone' | 'password';
  phoneLength: number;
}

export function LoginMascot({ watching, phoneLength }: LoginMascotProps) {
  const isHiding = watching === 'password';
  const isTyping = watching === 'phone';
  const bounce = isTyping ? Math.sin(phoneLength * 0.8) * 3 : 0;

  return (
    <div className="flex justify-center mb-3 select-none">
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${bounce}px) ${isHiding ? 'rotateY(180deg)' : 'rotateY(0deg)'}`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Tag body */}
        <div className="relative w-24 h-32">
          {/* Main tag shape */}
          <div className="absolute inset-0 bg-primary rounded-2xl rounded-tl-[2rem] shadow-lg" />

          {/* Tag hole */}
          <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-background border-2 border-primary-foreground/20 z-10" />

          {/* String from hole */}
          <svg className="absolute -top-4 left-3 w-8 h-6 z-10" viewBox="0 0 32 24">
            <path
              d="M8 24 C8 12, 16 4, 24 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground"
              strokeLinecap="round"
            />
          </svg>

          {/* === FRONT FACE === */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${isHiding ? 'opacity-0' : 'opacity-100'}`}>
            {/* Percent symbol - top area */}
            <div className="absolute top-2 right-3">
              <span className="text-2xl font-black text-primary-foreground/30 select-none">
                %
              </span>
            </div>

            {/* Eyes - middle area */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-5">
              {/* Left eye */}
              <div className="relative w-4 h-4 bg-primary-foreground rounded-full">
                <div
                  className="absolute w-2 h-2 bg-primary rounded-full transition-all duration-200"
                  style={{
                    top: isTyping ? '2px' : '1px',
                    left: isTyping ? `${Math.min(phoneLength * 0.3, 2.5)}px` : '1px',
                  }}
                >
                  <div className="w-1 h-1 bg-primary-foreground/60 rounded-full" />
                </div>
              </div>
              {/* Right eye */}
              <div className="relative w-4 h-4 bg-primary-foreground rounded-full">
                <div
                  className="absolute w-2 h-2 bg-primary rounded-full transition-all duration-200"
                  style={{
                    top: isTyping ? '2px' : '1px',
                    left: isTyping ? `${Math.min(phoneLength * 0.3, 2.5)}px` : '1px',
                  }}
                >
                  <div className="w-1 h-1 bg-primary-foreground/60 rounded-full" />
                </div>
              </div>
            </div>

            {/* Blush */}
            <div className="absolute top-[70px] left-3 w-4 h-2 bg-pink-300/40 rounded-full" />
            <div className="absolute top-[70px] right-3 w-4 h-2 bg-pink-300/40 rounded-full" />

            {/* Mouth - bottom area */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2">
              {isTyping ? (
                <div className="w-4 h-2.5 border-b-2 border-primary-foreground rounded-b-full" />
              ) : (
                <div className="flex gap-0">
                  <div className="w-2 h-1.5 border-b-2 border-r border-primary-foreground rounded-br-full" />
                  <div className="w-2 h-1.5 border-b-2 border-l border-primary-foreground rounded-bl-full" />
                </div>
              )}
            </div>
          </div>

          {/* === BACK FACE (password mode) === */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isHiding ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-2">
                <span className="text-xl text-primary-foreground">&#x2715;</span>
                <span className="text-xl text-primary-foreground">&#x2715;</span>
              </div>
              <div className="w-5 h-0.5 bg-primary-foreground/60 rounded mx-auto" />
              <p className="text-[10px] text-primary-foreground/40 mt-2">looking away...</p>
            </div>
          </div>

          {/* Sparkles when typing */}
          <div className={`transition-opacity duration-300 ${isTyping ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-pulse">&#x2728;</div>
            <div className="absolute -bottom-1 -left-1 text-yellow-400 text-xs animate-pulse delay-150">&#x2728;</div>
            <div className="absolute top-1/2 -right-3 text-yellow-400 text-[10px] animate-pulse delay-300">&#x2728;</div>
          </div>
        </div>
      </div>
    </div>
  );
}
