export const THUMBNAIL_REVALIDATE_SECONDS = 60 * 30;
export const OGP_REFRESH_INTERVAL_MS = 1000 * 60 * 30;
export const OGP_FETCH_WAIT_MS = 350;

export const AMAZON_REDIRECT_MAX_HOPS = 4;
export const AMAZON_PAGE_REQUEST_MAX_HOPS = 5;
export const AMAZON_PAGE_FETCH_TIMEOUT_MS = 10_000;
export const AMAZON_PAGE_FETCH_MAX_BYTES = 4 * 1024 * 1024;
export const AMAZON_SHORT_LINK_HOSTS = new Set(["amzn.asia", "amzn.to", "a.co"]);
export const AMAZON_ASIN_PATTERN = /^[A-Z0-9]{10}$/;
export const AMAZON_ASIN_QUERY_KEYS = ["asin", "ASIN", "creativeASIN"] as const;
export const AMAZON_ASIN_PATH_PATTERNS = [
  /\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/product\/([A-Z0-9]{10})(?:[/?]|$)/i,
  /\/([A-Z0-9]{10})(?:[/?]|$)/i,
] as const;

export const AMAZON_PAGE_REQUEST_HEADERS = {
  "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

export const AMAZON_IMAGE_CANDIDATE_URL_BUILDERS: Array<(asin: string) => string> = [
  (asin) => `https://m.media-amazon.com/images/P/${asin}.09.MAIN._SX640_.jpg`,
  (asin) => `https://m.media-amazon.com/images/P/${asin}.01.MAIN._SX640_.jpg`,
  (asin) => `https://m.media-amazon.com/images/P/${asin}.09.MAIN.jpg`,
  (asin) => `https://m.media-amazon.com/images/P/${asin}.01.MAIN.jpg`,
];

export const AMAZON_LANDING_IMAGE_PATTERNS = [
  /<img[^>]+id=(?:"landingImage"|'landingImage')[^>]+src=(?:"([^"]+)"|'([^']+)')/i,
  /<img[^>]+src=(?:"([^"]+)"|'([^']+)')[^>]+id=(?:"landingImage"|'landingImage')/i,
] as const;

export const AMAZON_BLOCKED_HTML_MARKERS = [
  "api-services-support@amazon.com",
  "service unavailable error",
] as const;
