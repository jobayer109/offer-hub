'use client';

interface LoginPandaProps {
  watching: 'idle' | 'phone' | 'password';
  phoneLength: number;
}

export function LoginPanda({ watching, phoneLength }: LoginPandaProps) {
  // Eye position based on phone input length (max shift)
  const eyeOffsetX = watching === 'phone' ? Math.min(phoneLength * 0.8, 8) - 4 : 0;
  const eyeOffsetY = watching === 'phone' ? 2 : 0;

  const isHiding = watching === 'password';

  return (
    <div className="flex justify-center mb-2 select-none">
      <div className="relative w-32 h-32">
        {/* Body */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-20 bg-[#1a1a2e] rounded-[50%]" />

        {/* Face */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#f5f5f5] rounded-full z-10" />

        {/* Ears */}
        <div className="absolute top-0 left-4 w-8 h-8 bg-[#1a1a2e] rounded-full" />
        <div className="absolute top-0 right-4 w-8 h-8 bg-[#1a1a2e] rounded-full" />
        <div className="absolute top-1 left-5 w-5 h-5 bg-[#3a3a5e] rounded-full" />
        <div className="absolute top-1 right-5 w-5 h-5 bg-[#3a3a5e] rounded-full" />

        {/* Eye patches */}
        <div className="absolute top-8 left-7 w-8 h-6 bg-[#1a1a2e] rounded-[50%] rotate-[-8deg] z-20" />
        <div className="absolute top-8 right-7 w-8 h-6 bg-[#1a1a2e] rounded-[50%] rotate-[8deg] z-20" />

        {/* Eyes */}
        <div
          className="absolute top-9 left-9 w-4 h-4 bg-white rounded-full z-30 flex items-center justify-center transition-all duration-200"
          style={{ transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)` }}
        >
          <div className="w-2 h-2 bg-[#1a1a2e] rounded-full">
            <div className="w-1 h-1 bg-white rounded-full ml-0.5" />
          </div>
        </div>
        <div
          className="absolute top-9 right-9 w-4 h-4 bg-white rounded-full z-30 flex items-center justify-center transition-all duration-200"
          style={{ transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)` }}
        >
          <div className="w-2 h-2 bg-[#1a1a2e] rounded-full">
            <div className="w-1 h-1 bg-white rounded-full ml-0.5" />
          </div>
        </div>

        {/* Nose */}
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-3 h-2 bg-[#1a1a2e] rounded-full z-30" />

        {/* Mouth */}
        <div className="absolute top-[66px] left-1/2 -translate-x-1/2 z-30">
          <div className="flex gap-0">
            <div className="w-2.5 h-1.5 border-b-2 border-r border-[#1a1a2e] rounded-br-full" />
            <div className="w-2.5 h-1.5 border-b-2 border-l border-[#1a1a2e] rounded-bl-full" />
          </div>
        </div>

        {/* Blush */}
        <div className="absolute top-14 left-5 w-4 h-2 bg-pink-200 rounded-full opacity-60 z-20" />
        <div className="absolute top-14 right-5 w-4 h-2 bg-pink-200 rounded-full opacity-60 z-20" />

        {/* Hands/Paws - cover eyes when password */}
        <div
          className={`absolute z-40 left-3 w-9 h-7 bg-[#1a1a2e] rounded-full transition-all duration-500 ease-in-out ${
            isHiding ? 'top-7 opacity-100' : 'top-24 opacity-0'
          }`}
        />
        <div
          className={`absolute z-40 right-3 w-9 h-7 bg-[#1a1a2e] rounded-full transition-all duration-500 ease-in-out ${
            isHiding ? 'top-7 opacity-100' : 'top-24 opacity-0'
          }`}
        />

        {/* Paw pads (visible when covering) */}
        <div
          className={`absolute z-50 left-5 flex gap-0.5 transition-all duration-500 ${
            isHiding ? 'top-8 opacity-100' : 'top-24 opacity-0'
          }`}
        >
          <div className="w-1.5 h-1.5 bg-[#3a3a5e] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#3a3a5e] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#3a3a5e] rounded-full" />
        </div>
        <div
          className={`absolute z-50 right-5 flex gap-0.5 transition-all duration-500 ${
            isHiding ? 'top-8 opacity-100' : 'top-24 opacity-0'
          }`}
        >
          <div className="w-1.5 h-1.5 bg-[#3a3a5e] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#3a3a5e] rounded-full" />
          <div className="w-1.5 h-1.5 bg-[#3a3a5e] rounded-full" />
        </div>
      </div>
    </div>
  );
}
