import { useEffect, useRef } from 'react';
import useMemeStore from '../store/useMemeStore';
import { fetchRedditPosts, analyzeSentiment, classifyHypeStage, getPrediction, generateAlert } from '../api/client';

const DEMO_PIPELINE = {
  floki: {
    posts: [
      { title: 'FLOKI partnership with major DeFi protocol just dropped', score: 892, num_comments: 156, created_utc: Math.floor(Date.now() / 1000) - 1800, subreddit: 'CryptoMoonShots', url: '#' },
      { title: 'FLOKI whale wallet accumulated 2.3B tokens', score: 567, num_comments: 89, created_utc: Math.floor(Date.now() / 1000) - 3600, subreddit: 'SatoshiStreetBets', url: '#' },
      { title: 'FLOKI technical setup looks bullish', score: 345, num_comments: 67, created_utc: Math.floor(Date.now() / 1000) - 5400, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'FLOKI could be the next 100x', score: 234, num_comments: 45, created_utc: Math.floor(Date.now() / 1000) - 7200, subreddit: 'memecoins', url: '#' },
      { title: 'FLOKI mentioned by top crypto influencer', score: 178, num_comments: 34, created_utc: Math.floor(Date.now() / 1000) - 14400, subreddit: 'CryptoMoonShots', url: '#' },
      { title: 'Just aped into FLOKI', score: 89, num_comments: 23, created_utc: Math.floor(Date.now() / 1000) - 18000, subreddit: 'dogecoin', url: '#' },
    ],
    velocity: { recent_count: 4, previous_count: 2, velocity_ratio: 2 },
    sentiment: { coin: 'FLOKI', sentiment_score: 91, primary_emotion: 'hype', confidence: 87, themes: ['partnership announcement', 'whale accumulation', 'breakout pattern'], coordinated_flag: false, summary: 'FLOKI is experiencing a surge of organic enthusiasm.' },
    stage: { coin: 'FLOKI', hype_stage: 'early_whisper', stage_confidence: 89, velocity_trend: 'accelerating', estimated_hours_in_stage: 8, signal: 'Sharp mention spike in niche crypto communities.' },
    prediction: { coin: 'FLOKI', direction: 'bullish', confidence: 89, time_window: '24-48 hours', catalyst: 'Partnership announcement and influencer attention', key_signals: ['601% mention spike', 'Sentiment score 91', 'Early Whisper classification'], risk_factors: ['Partnership details may disappoint', 'Marketwide downturn'], prediction_summary: 'FLOKI shows the strongest social signal convergence in 72 hours.' },
    alert: { coin: 'FLOKI', alert_level: 'critical', headline: 'FLOKI - Strongest social signal in 72 hours', body: 'Mention velocity spiked in a tight window while sentiment remained elevated. Organic community expansion continues across multiple crypto subreddits.', emoji: '🚨', timestamp: Date.now(), is_critical: true },
  },
  pepe: {
    posts: [
      { title: 'PEPE volume up 400% in 24 hours', score: 1245, num_comments: 234, created_utc: Math.floor(Date.now() / 1000) - 2400, subreddit: 'CryptoMoonShots', url: '#' },
      { title: 'Elon liked a PEPE meme tweet', score: 2100, num_comments: 456, created_utc: Math.floor(Date.now() / 1000) - 4800, subreddit: 'SatoshiStreetBets', url: '#' },
      { title: 'PEPE ecosystem expanding', score: 567, num_comments: 89, created_utc: Math.floor(Date.now() / 1000) - 7200, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'Weekly PEPE discussion', score: 234, num_comments: 156, created_utc: Math.floor(Date.now() / 1000) - 10800, subreddit: 'memecoins', url: '#' },
      { title: 'PEPE might be overbought short-term', score: 45, num_comments: 67, created_utc: Math.floor(Date.now() / 1000) - 16200, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'Just sold 50% of my PEPE bag', score: 123, num_comments: 45, created_utc: Math.floor(Date.now() / 1000) - 21600, subreddit: 'SatoshiStreetBets', url: '#' },
    ],
    velocity: { recent_count: 4, previous_count: 2, velocity_ratio: 2 },
    sentiment: { coin: 'PEPE', sentiment_score: 78, primary_emotion: 'FOMO', confidence: 82, themes: ['Elon engagement', 'volume explosion', 'exchange listings'], coordinated_flag: false, summary: 'PEPE sentiment is strongly bullish.' },
    stage: { coin: 'PEPE', hype_stage: 'building_momentum', stage_confidence: 84, velocity_trend: 'accelerating', estimated_hours_in_stage: 14, signal: 'Elon engagement combined with rising volume.' },
    prediction: { coin: 'PEPE', direction: 'bullish', confidence: 78, time_window: '24-48 hours', catalyst: 'Elon Musk engagement amplifying FOMO', key_signals: ['Elon liked PEPE meme', 'Volume surge', 'Exchange listing rumors'], risk_factors: ['Overbought conditions', 'Engagement may not sustain'], prediction_summary: 'PEPE is riding a wave of social momentum.' },
    alert: { coin: 'PEPE', alert_level: 'alert', headline: 'PEPE - Elon engagement triggers FOMO wave', body: 'Trading volume surged after a high-visibility social signal. Sentiment remains elevated with multiple listing rumors circulating.', emoji: '🐸', timestamp: Date.now(), is_critical: false },
  },
  doge: {
    posts: [
      { title: 'DOGE integration with X payments confirmed by insider source', score: 3456, num_comments: 567, created_utc: Math.floor(Date.now() / 1000) - 3600, subreddit: 'dogecoin', url: '#' },
      { title: 'Dogecoin transaction volume hits 6-month high', score: 892, num_comments: 123, created_utc: Math.floor(Date.now() / 1000) - 7200, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'DOGE to $1? Updated price model', score: 456, num_comments: 89, created_utc: Math.floor(Date.now() / 1000) - 10800, subreddit: 'SatoshiStreetBets', url: '#' },
      { title: 'Community update: Dogecoin Foundation progress report', score: 234, num_comments: 45, created_utc: Math.floor(Date.now() / 1000) - 14400, subreddit: 'dogecoin', url: '#' },
      { title: 'I converted all my DOGE to BTC', score: 67, num_comments: 234, created_utc: Math.floor(Date.now() / 1000) - 18000, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'Do Only Good Everyday - my DOGE coffee shop now accepts it', score: 345, num_comments: 56, created_utc: Math.floor(Date.now() / 1000) - 21600, subreddit: 'dogecoin', url: '#' },
    ],
    velocity: { recent_count: 3, previous_count: 2, velocity_ratio: 1.5 },
    sentiment: { coin: 'DOGE', sentiment_score: 72, primary_emotion: 'belief', confidence: 79, themes: ['X payments integration', 'adoption growth', 'institutional interest'], coordinated_flag: false, summary: 'Dogecoin community shows strong conviction.' },
    stage: { coin: 'DOGE', hype_stage: 'building_momentum', stage_confidence: 76, velocity_trend: 'stable', estimated_hours_in_stage: 24, signal: 'X payment rumors sustained across multiple communities.' },
    prediction: { coin: 'DOGE', direction: 'bullish', confidence: 72, time_window: '24-48 hours', catalyst: 'X payments integration confirmation', key_signals: ['Transaction volume at 6-month high', 'Mainstream attention', 'Foundation progress'], risk_factors: ['Timeline remains unconfirmed', 'Sell-the-news risk'], prediction_summary: 'Dogecoin is positioned for upward movement.' },
    alert: { coin: 'DOGE', alert_level: 'caution', headline: 'DOGE - X payment integration signals intensify', body: 'Multiple community posts point to continued adoption interest. Transaction activity remains elevated versus the prior period.', emoji: '🐕', timestamp: Date.now(), is_critical: false },
  },
  shib: {
    posts: [
      { title: 'Shibarium L2 hitting record transaction counts', score: 678, num_comments: 89, created_utc: Math.floor(Date.now() / 1000) - 4200, subreddit: 'shib', url: '#' },
      { title: 'SHIB burn rate spikes 1000% in last 24 hours', score: 456, num_comments: 67, created_utc: Math.floor(Date.now() / 1000) - 8400, subreddit: 'CryptoMoonShots', url: '#' },
      { title: 'SHIB metaverse update - first gameplay footage leaked', score: 234, num_comments: 45, created_utc: Math.floor(Date.now() / 1000) - 12600, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'Is SHIB dead? Honest analysis', score: 89, num_comments: 123, created_utc: Math.floor(Date.now() / 1000) - 16800, subreddit: 'memecoins', url: '#' },
      { title: 'SHIB ecosystem token BONE pumping', score: 345, num_comments: 56, created_utc: Math.floor(Date.now() / 1000) - 19200, subreddit: 'SatoshiStreetBets', url: '#' },
      { title: 'Weekly SHIB thread - patience is a virtue', score: 123, num_comments: 34, created_utc: Math.floor(Date.now() / 1000) - 23400, subreddit: 'shib', url: '#' },
    ],
    velocity: { recent_count: 2, previous_count: 3, velocity_ratio: 0.67 },
    sentiment: { coin: 'SHIB', sentiment_score: 45, primary_emotion: 'speculation', confidence: 64, themes: ['Shibarium growth', 'burn rate increase', 'ecosystem expansion'], coordinated_flag: false, summary: 'SHIB sentiment is cautiously optimistic.' },
    stage: { coin: 'SHIB', hype_stage: 'cooling_down', stage_confidence: 68, velocity_trend: 'decelerating', estimated_hours_in_stage: 36, signal: 'Declining mention velocity despite updates.' },
    prediction: { coin: 'SHIB', direction: 'sideways', confidence: 58, time_window: '24-48 hours', catalyst: 'Shibarium activity increase offset by rotation', key_signals: ['Burn rate spike', 'L2 activity', 'Ecosystem interest'], risk_factors: ['Attention rotating away', 'Spikes not sustained'], prediction_summary: 'SHIB is in a consolidation phase with mixed signals.' },
    alert: { coin: 'SHIB', alert_level: 'watch', headline: 'SHIB - Ecosystem development still active', body: 'Activity remains present but momentum is slower than the top meme-coins. Continued ecosystem updates are the main signal to watch.', emoji: '⚪', timestamp: Date.now(), is_critical: false },
  },
  bonk: {
    posts: [
      { title: 'BONK just flipped MYRO as #1 Solana memecoin', score: 567, num_comments: 89, created_utc: Math.floor(Date.now() / 1000) - 3000, subreddit: 'CryptoMoonShots', url: '#' },
      { title: 'Solana memecoin season 2.0 - BONK leading the charge', score: 345, num_comments: 67, created_utc: Math.floor(Date.now() / 1000) - 6000, subreddit: 'SatoshiStreetBets', url: '#' },
      { title: 'BONKbot volume exceeds $100M in 24hrs', score: 234, num_comments: 45, created_utc: Math.floor(Date.now() / 1000) - 9000, subreddit: 'CryptoCurrency', url: '#' },
      { title: 'New BONK NFT collection selling out in minutes', score: 178, num_comments: 34, created_utc: Math.floor(Date.now() / 1000) - 12000, subreddit: 'memecoins', url: '#' },
      { title: 'BONK price prediction: conservative target', score: 89, num_comments: 23, created_utc: Math.floor(Date.now() / 1000) - 18000, subreddit: 'CryptoMoonShots', url: '#' },
      { title: 'Took profits on BONK too early', score: 56, num_comments: 12, created_utc: Math.floor(Date.now() / 1000) - 21600, subreddit: 'SatoshiStreetBets', url: '#' },
    ],
    velocity: { recent_count: 4, previous_count: 1, velocity_ratio: 4 },
    sentiment: { coin: 'BONK', sentiment_score: 85, primary_emotion: 'hype', confidence: 76, themes: ['Solana memecoin leader', 'trading volume surge', 'NFT collection'], coordinated_flag: false, summary: 'BONK is riding high on Solana ecosystem momentum.' },
    stage: { coin: 'BONK', hype_stage: 'building_momentum', stage_confidence: 81, velocity_trend: 'accelerating', estimated_hours_in_stage: 10, signal: 'Solana ecosystem rotation into memecoins.' },
    prediction: { coin: 'BONK', direction: 'bullish', confidence: 82, time_window: '24-48 hours', catalyst: 'Solana memecoin season 2.0', key_signals: ['BONKbot volume', 'Market cap flip', 'Community strength'], risk_factors: ['Network congestion', 'Rotation risk'], prediction_summary: 'BONK is the clear leader in the current Solana memecoin cycle.' },
    alert: { coin: 'BONK', alert_level: 'alert', headline: 'BONK - Solana memecoin throne captured', body: 'Volume and community engagement remain elevated across Solana circles. Social mentions are accelerating versus the previous window.', emoji: '🦴', timestamp: Date.now(), is_critical: false },
  },
};

function getDemoData(coinName) {
  const key = coinName.toLowerCase();
  return DEMO_PIPELINE[key] || DEMO_PIPELINE.pepe;
}

export default function useSentiment() {
  const { selectedCoin, setPosts, setVelocity, setSentiment, setHypeStage, setPrediction, addAlert, setLoading, setError, clearError } = useMemeStore();
  const intervalRef = useRef(null);
  const alertedCoins = useRef(new Set());

  useEffect(() => {
    if (!selectedCoin) return;

    async function runPipeline() {
      const coinName = selectedCoin.name || selectedCoin.symbol;
      clearError('sentiment');
      setLoading('posts', true);
      setLoading('sentiment', true);
      setLoading('prediction', true);

      try {
        // Step 1: Fetch Reddit posts
        const redditData = await fetchRedditPosts(coinName);
        setPosts(redditData.posts);
        setVelocity(redditData.velocity);
        setLoading('posts', false);

        // Step 2: Analyze sentiment
        const sentimentData = await analyzeSentiment(coinName, redditData.posts);
        setSentiment(sentimentData);

        // Step 3: Classify hype stage
        const stageData = await classifyHypeStage(coinName, sentimentData, redditData.velocity);
        setHypeStage(stageData);
        setLoading('sentiment', false);

        // Step 4: Get prediction
        const predictionData = await getPrediction(coinName, sentimentData, redditData.velocity, stageData);
        setPrediction(predictionData);
        setLoading('prediction', false);

        // Step 5: Check alert thresholds
        const vel = redditData.velocity?.velocity_ratio || 0;
        const sent = sentimentData?.sentiment_score || 0;
        const stage = stageData?.hype_stage || '';

        if ((vel > 3 || sent > 70 || stage === 'early_whisper') && !alertedCoins.current.has(coinName)) {
          try {
            const alert = await generateAlert(coinName, sent, stage, vel);
            if (alert) {
              addAlert(alert);
              alertedCoins.current.add(coinName);
            }
          } catch (e) {
            // Alert generation is non-critical
          }
        }
      } catch (err) {
        const demo = getDemoData(coinName);
        setPosts(demo.posts);
        setVelocity(demo.velocity);
        setSentiment(demo.sentiment);
        setHypeStage(demo.stage);
        setPrediction(demo.prediction);

        if (!alertedCoins.current.has(coinName) && demo.alert) {
          addAlert(demo.alert);
          alertedCoins.current.add(coinName);
        }

        setError('sentiment', 'Backend unavailable, using demo analysis');
        setLoading('posts', false);
        setLoading('sentiment', false);
        setLoading('prediction', false);
      }
    }

    runPipeline();

    // Polling every 90 seconds
    intervalRef.current = setInterval(runPipeline, 90000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedCoin]);
}
