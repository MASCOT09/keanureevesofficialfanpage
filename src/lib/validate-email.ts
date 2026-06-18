const EMAIL_FORMAT =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** ISO 3166-1 alpha-2 country-code TLDs (also used by many ccTLDs like .io, .co) */
const COUNTRY_CODE_TLDS = new Set([
  "ac", "ad", "ae", "af", "ag", "ai", "al", "am", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az",
  "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bl", "bm", "bn", "bo", "bq", "br", "bs", "bt",
  "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr",
  "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er",
  "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy",
  "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it",
  "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb",
  "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mf", "mg", "mh", "mk",
  "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc",
  "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk",
  "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc",
  "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "sv",
  "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv",
  "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws",
  "ye", "yt", "za", "zm", "zw",
]);

const GENERIC_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "mil", "int", "info", "biz", "name", "pro", "museum", "coop", "aero",
  "jobs", "mobi", "travel", "tel", "cat", "asia", "post", "xxx", "app", "dev", "io", "ai", "online", "site",
  "store", "shop", "blog", "cloud", "email", "live", "news", "tech", "today", "world", "space", "digital",
  "media", "company", "group", "network", "solutions", "services", "support", "systems", "tools", "website",
  "wiki", "zone", "center", "community", "directory", "education", "finance", "health", "legal", "marketing",
  "photography", "photos", "social", "software", "studio", "team", "ventures", "video", "watch", "works",
  "fan", "art", "club", "fun", "life", "love", "one", "top", "xyz",
]);

const TLD_TYPOS: Record<string, string> = {
  cmo: "com",
  con: "com",
  comm: "com",
  coom: "com",
  vom: "com",
  cpom: "com",
};

export type EmailValidationResult =
  | { valid: true; email: string }
  | { valid: false; error: string };

function isValidTld(tld: string): boolean {
  const lower = tld.toLowerCase();
  if (COUNTRY_CODE_TLDS.has(lower)) return true;
  if (GENERIC_TLDS.has(lower)) return true;
  return false;
}

export function validateEmail(raw: string): EmailValidationResult {
  const email = raw.trim().toLowerCase();

  if (!email) {
    return { valid: false, error: "Email is required." };
  }

  if (email.length > 254) {
    return { valid: false, error: "Email address is too long." };
  }

  if (!EMAIL_FORMAT.test(email)) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  const [, domain] = email.split("@");
  if (!domain || domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  const tld = domain.split(".").pop()?.toLowerCase() ?? "";
  if (!tld || !isValidTld(tld)) {
    const suggestion = TLD_TYPOS[tld];
    if (suggestion) {
      const correctedDomain = domain.slice(0, -(tld.length)) + suggestion;
      return {
        valid: false,
        error: `Invalid email domain ".${tld}". Did you mean ${email.split("@")[0]}@${correctedDomain}?`,
      };
    }
    return { valid: false, error: "Please enter a valid email address with a recognized domain." };
  }

  return { valid: true, email };
}
