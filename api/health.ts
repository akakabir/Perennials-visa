export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'operational',
    services: {
      server: 'operational',
      ai_proxy: process.env.GROQ_API_KEY ? 'operational' : 'degraded'
    },
    timestamp: new Date().toISOString()
  });
}
