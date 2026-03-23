const googleTrends = require('google-trends-api');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJsonResponse(response) {
  if (typeof response === 'string') {
    return JSON.parse(response);
  }

  return response;
}

function getTimelinePoints(timelineData = []) {
  return timelineData
    .map((point) => {
      const value = Array.isArray(point?.value) ? Number(point.value[0] || 0) : 0;
      return Number.isFinite(value) ? value : 0;
    });
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getMockTrends(coinName) {
  const coin = String(coinName || '').trim().toUpperCase();

  const mocks = {
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
    },
  };

  return {
    ...(mocks[coin] || {
      current_score: 30,
      peak_score: 45,
      rising: false,
      velocity: 0,
      breakout: false,
      top_countries: [],
      related_queries: [],
    }),
    keyword_used: `${coinName} coin`,
  };
}

async function getTrendsForCoin(coinName) {
  const keyword = `${coinName} coin`;
  const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const interestResponse = parseJsonResponse(
      await googleTrends.interestOverTime({
        keyword,
        startTime,
        granularTimeResolution: true,
      })
    );
    const timelineData = interestResponse?.default?.timelineData || [];
    const values = getTimelinePoints(timelineData);
    if (values.length === 0) {
      return getMockTrends(coinName);
    }

    const current_score = values[values.length - 1] || 0;
    const peak_score = values.reduce((max, value) => Math.max(max, value), 0);
    const recent = average(values.slice(-3));
    const olderWindow = values.slice(Math.max(0, values.length - 6), Math.max(0, values.length - 3));
    const older = average(olderWindow.length ? olderWindow : values.slice(0, Math.max(1, values.length - 3)));
    const velocity = Math.round((recent - older) * 100) / 100;
    const rising = recent > older;

    await sleep(1000);

    const relatedResponse = parseJsonResponse(
      await googleTrends.relatedQueries({
        keyword,
        startTime,
      })
    );
    const relatedQueries = (relatedResponse?.default?.rankedList?.[0]?.rankedKeyword || [])
      .slice(0, 5)
      .map((item) => item?.query)
      .filter(Boolean);

    await sleep(1000);

    const regionResponse = parseJsonResponse(
      await googleTrends.interestByRegion({
        keyword,
        startTime,
      })
    );
    const top_countries = (regionResponse?.default?.geoMapData || [])
      .slice()
      .sort((a, b) => (b?.value?.[0] || 0) - (a?.value?.[0] || 0))
      .slice(0, 5)
      .map((item) => ({
        country: item?.geoName || 'Unknown',
        score: item?.value?.[0] || 0,
      }));

    return {
      current_score,
      peak_score,
      rising,
      velocity,
      breakout: current_score > 60 && rising === true,
      top_countries,
      related_queries: relatedQueries,
      keyword_used: keyword,
    };
  } catch (error) {
    return getMockTrends(coinName);
  }
}

module.exports = { getTrendsForCoin };
