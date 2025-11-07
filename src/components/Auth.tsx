interface AuthProps {
  onAuthSuccess: (role: string) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const handleProfileSelect = (profile: 'creator' | 'learner') => {
    const role = profile === 'creator' ? 'teacher' : 'student';
    onAuthSuccess(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-4xl px-6">
        {/* Header */}
        <div className="mb-20">
          <div className="inline-block mb-3 px-3 py-1 bg-indigo-50 border border-indigo-100">
            <span className="text-xs tracking-wide text-indigo-700" style={{ fontWeight: 600 }}>
              DUTCH LEARNING
            </span>
          </div>
          <h1 className="text-5xl tracking-tight mb-3 text-zinc-900" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Choose Profile
          </h1>
          <p className="text-zinc-500">Select your account to continue</p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Mauro - Creator */}
          <button
            onClick={() => handleProfileSelect('creator')}
            className="group text-left p-8 border border-zinc-200 hover:border-indigo-500 transition-all bg-white hover:shadow-lg"
          >
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2" style={{ fontWeight: 600 }}>
                Creator
              </div>
              <div className="text-3xl text-zinc-900 mb-2" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Mauro
              </div>
            </div>
            <div className="text-sm text-zinc-600 mb-6">
              Build lessons, manage content, and track learning progress
            </div>
            <div className="flex items-center text-indigo-600 text-sm" style={{ fontWeight: 500 }}>
              Continue
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Xindy - Learner */}
          <button
            onClick={() => handleProfileSelect('learner')}
            className="group text-left p-8 border border-zinc-200 hover:border-indigo-500 transition-all bg-white hover:shadow-lg"
          >
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2" style={{ fontWeight: 600 }}>
                Learner
              </div>
              <div className="text-3xl text-zinc-900 mb-2" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Xindy
              </div>
            </div>
            <div className="text-sm text-zinc-600 mb-6">
              Practice exercises, complete lessons, and master Dutch
            </div>
            <div className="flex items-center text-indigo-600 text-sm" style={{ fontWeight: 500 }}>
              Continue
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-zinc-400">
            Personal Dutch learning platform for Mauro & Xindy
          </p>
        </div>
      </div>
    </div>
  );
}
