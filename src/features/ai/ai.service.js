const Groq = require('groq-sdk');
const { getSummary, getTrends, getServiceBreakdown } = require('../analysis/analysis.service');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getInsights = async (appId, hours = 24) => {
  // Fetch all analysis data in parallel — one DB round trip per query, all simultaneous
  const [summary, trends, services] = await Promise.all([
    getSummary(appId, hours),
    getTrends(appId, hours),
    getServiceBreakdown(appId, hours),
  ]);

  const prompt = buildPrompt({ summary, trends, services, hours });

  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return {
    insights: completion.choices[0].message.content,
    data: { summary, trends, services },
  };
};

const buildPrompt = ({ summary, trends, services, hours }) => {
  const serviceLines = services.length
    ? services.map(s =>
        `  - ${s.service}: ${s.total} logs, ${s.errors} errors (${s.error_rate_percent}% error rate)`
      ).join('\n')
    : '  No service data available.';

  const trendLines = trends.length
    ? trends.map(t =>
        `  - ${new Date(t.hour).toISOString().slice(11,16)}: ${t.total} logs, ${t.errors} errors`
      ).join('\n')
    : '  No trend data available.';

  return `You are an expert SRE (Site Reliability Engineer) analysing application logs.

Here is the log data for the last ${hours} hours:

SUMMARY:
- Total logs: ${summary.total}
- Errors: ${summary.errors}
- Warnings: ${summary.warnings}
- Info: ${summary.info}
- Debug: ${summary.debug}
- Error rate: ${summary.error_rate_percent ?? 0}%

PER-SERVICE BREAKDOWN:
${serviceLines}

HOURLY TREND (oldest to newest):
${trendLines}

Please provide a concise, actionable analysis covering:
1. Overall health assessment (1-2 sentences)
2. The most critical issue if any exists
3. Which service needs attention first and why
4. One specific recommendation the developer should act on now

Be direct and specific. Use the actual numbers. Keep the total response under 200 words.
If everything looks healthy, say so clearly.`;
};

module.exports = { getInsights };