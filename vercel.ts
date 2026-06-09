const config = {
  framework: 'nextjs',
  buildCommand: 'next build',
  devCommand: 'next dev',
  installCommand: 'npm install',
  regions: ['iad1'],
  functions: {
    'app/api/ai/speech/route.ts': { maxDuration: 120 },
    'app/api/ai/chat/route.ts': { maxDuration: 60 },
    'app/api/ai/vendor-reply/route.ts': { maxDuration: 60 },
    'app/api/ai/seating-suggest/route.ts': { maxDuration: 60 },
  },
} as const

export default config
