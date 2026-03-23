import { useEffect, useRef } from 'react';
import useMemeStore from '../store/useMemeStore';
import { fetchSocialPosts, fetchSocialData, analyzeSentiment, classifyHypeStage, getPrediction, generateAlert } from '../api/client';

const DEMO_PIPELINE = {
  floki: {
    posts: [
      { title: 'FLOKI partnership with major DeFi protocol just dropped', score: 892, source: 'CoinDesk', published_at: new Date(Date.now() - 1800000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'FLOKI whale wallet accumulated 2.3B tokens', score: 567, source: 'Decrypt', published_at: new Date(Date.now() - 3600000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'FLOKI technical setup looks bullish', score: 345, source: 'CryptoSlate', published_at: new Date(Date.now() - 5400000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'FLOKI could be the next 100x', score: 234, source: 'The Block', published_at: new Date(Date.now() - 7200000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'FLOKI mentioned by top crypto influencer', score: 178, source: 'BeInCrypto', published_at: new Date(Date.now() - 14400000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Just aped into FLOKI', score: 89, source: 'CoinDesk', published_at: new Date(Date.now() - 18000000).toISOString(), sentiment: 'neutral', url: '#' },
    ],
    velocity: { recent_count: 4, previous_count: 2, velocity_ratio: 2 },
    sentiment: { coin: 'FLOKI', sentiment_score: 91, primary_emotion: 'hype', confidence: 87, themes: ['partnership announcement', 'whale accumulation', 'breakout pattern'], coordinated_flag: false, summary: 'FLOKI is experiencing a surge of organic enthusiasm.' },
    stage: { coin: 'FLOKI', hype_stage: 'early_whisper', stage_confidence: 89, velocity_trend: 'accelerating', estimated_hours_in_stage: 8, signal: 'Sharp mention spike in niche crypto communities.' },
    prediction: { coin: 'FLOKI', direction: 'bullish', confidence: 89, time_window: '24-48 hours', catalyst: 'Partnership announcement and influencer attention', key_signals: ['601% mention spike', 'Sentiment score 91', 'Early Whisper classification'], risk_factors: ['Partnership details may disappoint', 'Marketwide downturn'], prediction_summary: 'FLOKI shows the strongest social signal convergence in 72 hours.' },
    alert: { coin: 'FLOKI', alert_level: 'critical', headline: 'FLOKI - Strongest social signal in 72 hours', body: 'Mention velocity spiked in a tight window while sentiment remained elevated. Organic community expansion continues across multiple crypto news sources.', emoji: '🚨', timestamp: Date.now(), is_critical: true },
  },
  pepe: {
    posts: [
      { title: 'PEPE volume up 400% in 24 hours', score: 1245, source: 'CoinDesk', published_at: new Date(Date.now() - 2400000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Elon liked a PEPE meme tweet', score: 2100, source: 'Decrypt', published_at: new Date(Date.now() - 4800000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'PEPE ecosystem expanding', score: 567, source: 'CryptoSlate', published_at: new Date(Date.now() - 7200000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Weekly PEPE discussion', score: 234, source: 'The Block', published_at: new Date(Date.now() - 10800000).toISOString(), sentiment: 'neutral', url: '#' },
      { title: 'PEPE might be overbought short-term', score: 45, source: 'BeInCrypto', published_at: new Date(Date.now() - 16200000).toISOString(), sentiment: 'bearish', url: '#' },
      { title: 'Just sold 50% of my PEPE bag', score: 123, source: 'CoinDesk', published_at: new Date(Date.now() - 21600000).toISOString(), sentiment: 'bearish', url: '#' },
    ],
    velocity: { recent_count: 4, previous_count: 2, velocity_ratio: 2 },
    sentiment: { coin: 'PEPE', sentiment_score: 78, primary_emotion: 'FOMO', confidence: 82, themes: ['Elon engagement', 'volume explosion', 'exchange listings'], coordinated_flag: false, summary: 'PEPE sentiment is strongly bullish.' },
    stage: { coin: 'PEPE', hype_stage: 'building_momentum', stage_confidence: 84, velocity_trend: 'accelerating', estimated_hours_in_stage: 14, signal: 'Elon engagement combined with rising volume.' },
    prediction: { coin: 'PEPE', direction: 'bullish', confidence: 78, time_window: '24-48 hours', catalyst: 'Elon Musk engagement amplifying FOMO', key_signals: ['Elon liked PEPE meme', 'Volume surge', 'Exchange listing rumors'], risk_factors: ['Overbought conditions', 'Engagement may not sustain'], prediction_summary: 'PEPE is riding a wave of social momentum.' },
    alert: { coin: 'PEPE', alert_level: 'alert', headline: 'PEPE - Elon engagement triggers FOMO wave', body: 'Trading volume surged after a high-visibility social signal. Sentiment remains elevated with multiple listing rumors circulating.', emoji: '🐸', timestamp: Date.now(), is_critical: false },
  },
  doge: {
    posts: [
      { title: 'DOGE integration with X payments confirmed by insider source', score: 3456, source: 'CoinDesk', published_at: new Date(Date.now() - 3600000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Dogecoin transaction volume hits 6-month high', score: 892, source: 'CryptoSlate', published_at: new Date(Date.now() - 7200000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'DOGE to $1? Updated price model', score: 456, source: 'Decrypt', published_at: new Date(Date.now() - 10800000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Community update: Dogecoin Foundation progress report', score: 234, source: 'The Block', published_at: new Date(Date.now() - 14400000).toISOString(), sentiment: 'neutral', url: '#' },
      { title: 'I converted all my DOGE to BTC', score: 67, source: 'BeInCrypto', published_at: new Date(Date.now() - 18000000).toISOString(), sentiment: 'bearish', url: '#' },
      { title: 'Do Only Good Everyday - my DOGE coffee shop now accepts it', score: 345, source: 'CoinDesk', published_at: new Date(Date.now() - 21600000).toISOString(), sentiment: 'bullish', url: '#' },
    ],
    velocity: { recent_count: 3, previous_count: 2, velocity_ratio: 1.5 },
    sentiment: { coin: 'DOGE', sentiment_score: 72, primary_emotion: 'belief', confidence: 79, themes: ['X payments integration', 'adoption growth', 'institutional interest'], coordinated_flag: false, summary: 'Dogecoin community shows strong conviction.' },
    stage: { coin: 'DOGE', hype_stage: 'building_momentum', stage_confidence: 76, velocity_trend: 'stable', estimated_hours_in_stage: 24, signal: 'X payment rumors sustained across multiple communities.' },
    prediction: { coin: 'DOGE', direction: 'bullish', confidence: 72, time_window: '24-48 hours', catalyst: 'X payments integration confirmation', key_signals: ['Transaction volume at 6-month high', 'Mainstream attention', 'Foundation progress'], risk_factors: ['Timeline remains unconfirmed', 'Sell-the-news risk'], prediction_summary: 'Dogecoin is positioned for upward movement.' },
    alert: { coin: 'DOGE', alert_level: 'caution', headline: 'DOGE - X payment integration signals intensify', body: 'Multiple community posts point to continued adoption interest. Transaction activity remains elevated versus the prior period.', emoji: '🐕', timestamp: Date.now(), is_critical: false },
  },
  shib: {
    posts: [
      { title: 'Shibarium L2 hitting record transaction counts', score: 678, source: 'CoinDesk', published_at: new Date(Date.now() - 4200000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'SHIB burn rate spikes 1000% in last 24 hours', score: 456, source: 'Decrypt', published_at: new Date(Date.now() - 8400000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'SHIB metaverse update - first gameplay footage leaked', score: 234, source: 'CryptoSlate', published_at: new Date(Date.now() - 12600000).toISOString(), sentiment: 'neutral', url: '#' },
      { title: 'Is SHIB dead? Honest analysis', score: 89, source: 'The Block', published_at: new Date(Date.now() - 16800000).toISOString(), sentiment: 'bearish', url: '#' },
      { title: 'SHIB ecosystem token BONE pumping', score: 345, source: 'BeInCrypto', published_at: new Date(Date.now() - 19200000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Weekly SHIB thread - patience is a virtue', score: 123, source: 'CoinDesk', published_at: new Date(Date.now() - 23400000).toISOString(), sentiment: 'neutral', url: '#' },
    ],
    velocity: { recent_count: 2, previous_count: 3, velocity_ratio: 0.67 },
    sentiment: { coin: 'SHIB', sentiment_score: 45, primary_emotion: 'speculation', confidence: 64, themes: ['Shibarium growth', 'burn rate increase', 'ecosystem expansion'], coordinated_flag: false, summary: 'SHIB sentiment is cautiously optimistic.' },
    stage: { coin: 'SHIB', hype_stage: 'cooling_down', stage_confidence: 68, velocity_trend: 'decelerating', estimated_hours_in_stage: 36, signal: 'Declining mention velocity despite updates.' },
    prediction: { coin: 'SHIB', direction: 'sideways', confidence: 58, time_window: '24-48 hours', catalyst: 'Shibarium activity increase offset by rotation', key_signals: ['Burn rate spike', 'L2 activity', 'Ecosystem interest'], risk_factors: ['Attention rotating away', 'Spikes not sustained'], prediction_summary: 'SHIB is in a consolidation phase with mixed signals.' },
    alert: { coin: 'SHIB', alert_level: 'watch', headline: 'SHIB - Ecosystem development still active', body: 'Activity remains present but momentum is slower than the top meme-coins. Continued ecosystem updates are the main signal to watch.', emoji: '⚪', timestamp: Date.now(), is_critical: false },
  },
  bonk: {
    posts: [
      { title: 'BONK just flipped MYRO as #1 Solana memecoin', score: 567, source: 'CoinDesk', published_at: new Date(Date.now() - 3000000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Solana memecoin season 2.0 - BONK leading the charge', score: 345, source: 'Decrypt', published_at: new Date(Date.now() - 6000000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'BONKbot volume exceeds $100M in 24hrs', score: 234, source: 'CryptoSlate', published_at: new Date(Date.now() - 9000000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'New BONK NFT collection selling out in minutes', score: 178, source: 'The Block', published_at: new Date(Date.now() - 12000000).toISOString(), sentiment: 'neutral', url: '#' },
      { title: 'BONK price prediction: conservative target', score: 89, source: 'BeInCrypto', published_at: new Date(Date.now() - 18000000).toISOString(), sentiment: 'bullish', url: '#' },
      { title: 'Took profits on BONK too early', score: 56, source: 'CoinDesk', published_at: new Date(Date.now() - 21600000).toISOString(), sentiment: 'bearish', url: '#' },
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

function getDemoTrends(coinName) {
  const key = String(coinName || '').trim().toUpperCase();
  const trends = {
    PEPE: {
      current_score: 72,
      peak_score: 88,
      rising: true,
      velocity: 12,
      breakout: true,
      top_countries: [
        { country: 'India', score: 100 },
        { country: 'Philippines', score: 84 },
        { country: 'United States', score: 71 },
        { country: 'Nigeria', score: 68 },
        { country: 'Vietnam', score: 55 },
      ],
      related_queries: [
        'pepe coin price',
        'pepe coin buy',
        'pepe coin binance',
        'pepe coin prediction',
        'pepe coin wallet',
      ],
      keyword_used: `${coinName} coin`,
    },
    FLOKI: {
      current_score: 81,
      peak_score: 91,
      rising: true,
      velocity: 18,
      breakout: true,
      top_countries: [
        { country: 'Nigeria', score: 100 },
        { country: 'India', score: 92 },
        { country: 'Vietnam', score: 78 },
        { country: 'Philippines', score: 74 },
        { country: 'Indonesia', score: 61 },
      ],
      related_queries: [
        'floki coin price',
        'floki inu',
        'floki binance listing',
        'floki coin buy',
        'floki coin prediction',
      ],
      keyword_used: `${coinName} coin`,
    },
    DOGE: {
      current_score: 55,
      peak_score: 65,
      rising: false,
      velocity: -3,
      breakout: false,
      top_countries: [
        { country: 'United States', score: 100 },
        { country: 'United Kingdom', score: 71 },
        { country: 'Canada', score: 64 },
        { country: 'Australia', score: 58 },
        { country: 'Germany', score: 42 },
      ],
      related_queries: [
        'dogecoin price',
        'dogecoin elon musk',
        'dogecoin wallet',
        'dogecoin prediction',
        'dogecoin coinbase',
      ],
      keyword_used: `${coinName} coin`,
    },
    SHIB: {
      current_score: 28,
      peak_score: 55,
      rising: false,
      velocity: -8,
      breakout: false,
      top_countries: [
        { country: 'United States', score: 100 },
        { country: 'Japan', score: 68 },
        { country: 'India', score: 55 },
        { country: 'South Korea', score: 44 },
        { country: 'Brazil', score: 38 },
      ],
      related_queries: [
        'shiba inu price',
        'shib coin burn',
        'shib vs doge',
        'shib coin sell',
        'shib coin future',
      ],
      keyword_used: `${coinName} coin`,
    },
    BONK: {
      current_score: 61,
      peak_score: 74,
      rising: true,
      velocity: 9,
      breakout: false,
      top_countries: [
        { country: 'United States', score: 100 },
        { country: 'South Korea', score: 88 },
        { country: 'Vietnam', score: 72 },
        { country: 'Philippines', score: 65 },
        { country: 'India', score: 58 },
      ],
      related_queries: [
        'bonk coin solana',
        'bonk price',
        'bonk coin buy',
        'bonk coin prediction',
        'bonk coin exchange',
      ],
      keyword_used: `${coinName} coin`,
    },
  };

  return trends[key] || {
    current_score: 30,
    peak_score: 45,
    rising: false,
    velocity: 0,
    breakout: false,
    top_countries: [],
    related_queries: [],
    keyword_used: `${coinName} coin`,
  };
}

export default function useSentiment() {
  const { selectedCoin, socialSource, setPosts, setVelocity, setSocial, setTrends, setSentiment, setHypeStage, setPrediction, addAlert, setLoading, setError, clearError, setScanSummary } = useMemeStore();
  const intervalRef = useRef(null);
  const alertedCoins = useRef(new Set());
  const lastRunRef = useRef(new Map());

  const shouldSkipRun = (sourceName, coinName, posts) => {
    const now = Date.now();
    const signature = JSON.stringify({
      source: sourceName,
      name: coinName,
      titles: (posts || []).slice(0, 5).map((post) => post.title),
    });
    const cacheKey = `${sourceName}:${coinName}`;
    const previous = lastRunRef.current.get(cacheKey);

    if (previous && previous.signature === signature && now - previous.at < 5 * 60 * 1000) {
      return true;
    }

    lastRunRef.current.set(cacheKey, { signature, at: now });
    return false;
  };

  useEffect(() => {
    if (!selectedCoin) return;

    async function runPipeline() {
      const coinName = selectedCoin.name || selectedCoin.symbol;
      clearError('sentiment');
      setLoading('posts', true);
      setLoading('sentiment', true);
      setLoading('prediction', true);

      try {
        const [socialData, trendsData] = await Promise.all([
          fetchSocialPosts(socialSource, coinName),
          fetchSocialData(coinName),
        ]);
        if (socialData.social) {
          setSocial(socialData.social);
        }
        if (trendsData?.trends) {
          setTrends(trendsData.trends);
        }
        if (shouldSkipRun(socialSource, coinName, socialData.posts)) {
          setPosts(socialData.posts);
          setVelocity(socialData.velocity);
          setScanSummary({ at: Date.now(), count: socialData.posts.length });
          setLoading('posts', false);
          setLoading('sentiment', false);
          setLoading('prediction', false);
          return;
        }

        setPosts(socialData.posts);
        setVelocity(socialData.velocity);
        setScanSummary({ at: Date.now(), count: socialData.posts.length });
        setLoading('posts', false);

        const sentimentData = await analyzeSentiment(coinName, socialData.posts);
        setSentiment(sentimentData);

        const stageData = await classifyHypeStage(coinName, sentimentData, socialData.velocity);
        setHypeStage(stageData);
        setLoading('sentiment', false);

        const predictionData = await getPrediction(coinName, sentimentData, socialData.velocity, stageData);
        setPrediction(predictionData);
        setLoading('prediction', false);

        const vel = socialData.velocity?.velocity_ratio || 0;
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
          }
        }
      } catch (err) {
        const demo = getDemoData(coinName);
        setPosts(demo.posts);
        setVelocity(demo.velocity);
        setScanSummary({ at: Date.now(), count: demo.posts.length });
        setSentiment(demo.sentiment);
        setHypeStage(demo.stage);
        setPrediction(demo.prediction);

        if (!alertedCoins.current.has(coinName) && demo.alert) {
          addAlert(demo.alert);
          alertedCoins.current.add(coinName);
        }

        setError('sentiment', 'Backend unavailable, using demo analysis');
        setTrends(getDemoTrends(coinName));
        setLoading('posts', false);
        setLoading('sentiment', false);
        setLoading('prediction', false);
      }
    }

    runPipeline();

    intervalRef.current = setInterval(runPipeline, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedCoin?.id, socialSource]);
}
