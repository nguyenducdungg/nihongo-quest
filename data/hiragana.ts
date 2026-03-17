import { Character } from "@/types";

export const hiraganaData: Character[] = [
  // --- Nguyên âm ---
  { kana: "あ", romaji: "a", group: "vowels", type: "hiragana" },
  { kana: "い", romaji: "i", group: "vowels", type: "hiragana" },
  { kana: "う", romaji: "u", group: "vowels", type: "hiragana" },
  { kana: "え", romaji: "e", group: "vowels", type: "hiragana" },
  { kana: "お", romaji: "o", group: "vowels", type: "hiragana" },
  // --- Hàng K ---
  { kana: "か", romaji: "ka", group: "k", type: "hiragana" },
  { kana: "き", romaji: "ki", group: "k", type: "hiragana" },
  { kana: "く", romaji: "ku", group: "k", type: "hiragana" },
  { kana: "け", romaji: "ke", group: "k", type: "hiragana" },
  { kana: "こ", romaji: "ko", group: "k", type: "hiragana" },
  // --- Hàng S ---
  { kana: "さ", romaji: "sa", group: "s", type: "hiragana" },
  { kana: "し", romaji: "shi", group: "s", type: "hiragana" },
  { kana: "す", romaji: "su", group: "s", type: "hiragana" },
  { kana: "せ", romaji: "se", group: "s", type: "hiragana" },
  { kana: "そ", romaji: "so", group: "s", type: "hiragana" },
  // --- Hàng T ---
  { kana: "た", romaji: "ta", group: "t", type: "hiragana" },
  { kana: "ち", romaji: "chi", group: "t", type: "hiragana" },
  { kana: "つ", romaji: "tsu", group: "t", type: "hiragana" },
  { kana: "て", romaji: "te", group: "t", type: "hiragana" },
  { kana: "と", romaji: "to", group: "t", type: "hiragana" },
  // --- Hàng N ---
  { kana: "な", romaji: "na", group: "n", type: "hiragana" },
  { kana: "に", romaji: "ni", group: "n", type: "hiragana" },
  { kana: "ぬ", romaji: "nu", group: "n", type: "hiragana" },
  { kana: "ね", romaji: "ne", group: "n", type: "hiragana" },
  { kana: "の", romaji: "no", group: "n", type: "hiragana" },
  // --- Hàng H ---
  { kana: "は", romaji: "ha", group: "h", type: "hiragana" },
  { kana: "ひ", romaji: "hi", group: "h", type: "hiragana" },
  { kana: "ふ", romaji: "fu", group: "h", type: "hiragana" },
  { kana: "へ", romaji: "he", group: "h", type: "hiragana" },
  { kana: "ほ", romaji: "ho", group: "h", type: "hiragana" },
  // --- Hàng M ---
  { kana: "ま", romaji: "ma", group: "m", type: "hiragana" },
  { kana: "み", romaji: "mi", group: "m", type: "hiragana" },
  { kana: "む", romaji: "mu", group: "m", type: "hiragana" },
  { kana: "め", romaji: "me", group: "m", type: "hiragana" },
  { kana: "も", romaji: "mo", group: "m", type: "hiragana" },
  // --- Hàng Y ---
  { kana: "や", romaji: "ya", group: "y", type: "hiragana" },
  { kana: "ゆ", romaji: "yu", group: "y", type: "hiragana" },
  { kana: "よ", romaji: "yo", group: "y", type: "hiragana" },
  // --- Hàng R ---
  { kana: "ら", romaji: "ra", group: "r", type: "hiragana" },
  { kana: "り", romaji: "ri", group: "r", type: "hiragana" },
  { kana: "る", romaji: "ru", group: "r", type: "hiragana" },
  { kana: "れ", romaji: "re", group: "r", type: "hiragana" },
  { kana: "ろ", romaji: "ro", group: "r", type: "hiragana" },
  // --- Hàng W + N ---
  { kana: "わ", romaji: "wa", group: "w", type: "hiragana" },
  { kana: "を", romaji: "wo", group: "w", type: "hiragana" },
  { kana: "ん", romaji: "n", group: "special", type: "hiragana" },

  // ===== ÂM ĐỤC (濁音 Dakuten) =====
  // --- Hàng G (か + ゛) ---
  { kana: "が", romaji: "ga", group: "dakuten-g", type: "hiragana" },
  { kana: "ぎ", romaji: "gi", group: "dakuten-g", type: "hiragana" },
  { kana: "ぐ", romaji: "gu", group: "dakuten-g", type: "hiragana" },
  { kana: "げ", romaji: "ge", group: "dakuten-g", type: "hiragana" },
  { kana: "ご", romaji: "go", group: "dakuten-g", type: "hiragana" },
  // --- Hàng Z (さ + ゛) ---
  { kana: "ざ", romaji: "za", group: "dakuten-z", type: "hiragana" },
  { kana: "じ", romaji: "ji", group: "dakuten-z", type: "hiragana" },
  { kana: "ず", romaji: "zu", group: "dakuten-z", type: "hiragana" },
  { kana: "ぜ", romaji: "ze", group: "dakuten-z", type: "hiragana" },
  { kana: "ぞ", romaji: "zo", group: "dakuten-z", type: "hiragana" },
  // --- Hàng D (た + ゛) ---
  { kana: "だ", romaji: "da", group: "dakuten-d", type: "hiragana" },
  { kana: "ぢ", romaji: "di", group: "dakuten-d", type: "hiragana" },
  { kana: "づ", romaji: "du", group: "dakuten-d", type: "hiragana" },
  { kana: "で", romaji: "de", group: "dakuten-d", type: "hiragana" },
  { kana: "ど", romaji: "do", group: "dakuten-d", type: "hiragana" },
  // --- Hàng B (は + ゛) ---
  { kana: "ば", romaji: "ba", group: "dakuten-b", type: "hiragana" },
  { kana: "び", romaji: "bi", group: "dakuten-b", type: "hiragana" },
  { kana: "ぶ", romaji: "bu", group: "dakuten-b", type: "hiragana" },
  { kana: "べ", romaji: "be", group: "dakuten-b", type: "hiragana" },
  { kana: "ぼ", romaji: "bo", group: "dakuten-b", type: "hiragana" },

  // ===== ÂM NỬA ĐỤC (半濁音 Handakuten) =====
  // --- Hàng P (は + ゜) ---
  { kana: "ぱ", romaji: "pa", group: "handakuten-p", type: "hiragana" },
  { kana: "ぴ", romaji: "pi", group: "handakuten-p", type: "hiragana" },
  { kana: "ぷ", romaji: "pu", group: "handakuten-p", type: "hiragana" },
  { kana: "ぺ", romaji: "pe", group: "handakuten-p", type: "hiragana" },
  { kana: "ぽ", romaji: "po", group: "handakuten-p", type: "hiragana" },

  // ===== ÂM GHÉP (拗音 Yōon) =====
  // --- KY ---
  { kana: "きゃ", romaji: "kya", group: "youon-k", type: "hiragana" },
  { kana: "きゅ", romaji: "kyu", group: "youon-k", type: "hiragana" },
  { kana: "きょ", romaji: "kyo", group: "youon-k", type: "hiragana" },
  // --- SH ---
  { kana: "しゃ", romaji: "sha", group: "youon-s", type: "hiragana" },
  { kana: "しゅ", romaji: "shu", group: "youon-s", type: "hiragana" },
  { kana: "しょ", romaji: "sho", group: "youon-s", type: "hiragana" },
  // --- CH ---
  { kana: "ちゃ", romaji: "cha", group: "youon-t", type: "hiragana" },
  { kana: "ちゅ", romaji: "chu", group: "youon-t", type: "hiragana" },
  { kana: "ちょ", romaji: "cho", group: "youon-t", type: "hiragana" },
  // --- NY ---
  { kana: "にゃ", romaji: "nya", group: "youon-n", type: "hiragana" },
  { kana: "にゅ", romaji: "nyu", group: "youon-n", type: "hiragana" },
  { kana: "にょ", romaji: "nyo", group: "youon-n", type: "hiragana" },
  // --- HY ---
  { kana: "ひゃ", romaji: "hya", group: "youon-h", type: "hiragana" },
  { kana: "ひゅ", romaji: "hyu", group: "youon-h", type: "hiragana" },
  { kana: "ひょ", romaji: "hyo", group: "youon-h", type: "hiragana" },
  // --- MY ---
  { kana: "みゃ", romaji: "mya", group: "youon-m", type: "hiragana" },
  { kana: "みゅ", romaji: "myu", group: "youon-m", type: "hiragana" },
  { kana: "みょ", romaji: "myo", group: "youon-m", type: "hiragana" },
  // --- RY ---
  { kana: "りゃ", romaji: "rya", group: "youon-r", type: "hiragana" },
  { kana: "りゅ", romaji: "ryu", group: "youon-r", type: "hiragana" },
  { kana: "りょ", romaji: "ryo", group: "youon-r", type: "hiragana" },
  // --- GY (đục) ---
  { kana: "ぎゃ", romaji: "gya", group: "youon-g", type: "hiragana" },
  { kana: "ぎゅ", romaji: "gyu", group: "youon-g", type: "hiragana" },
  { kana: "ぎょ", romaji: "gyo", group: "youon-g", type: "hiragana" },
  // --- J (đục) ---
  { kana: "じゃ", romaji: "ja", group: "youon-j", type: "hiragana" },
  { kana: "じゅ", romaji: "ju", group: "youon-j", type: "hiragana" },
  { kana: "じょ", romaji: "jo", group: "youon-j", type: "hiragana" },
  // --- BY (đục) ---
  { kana: "びゃ", romaji: "bya", group: "youon-b", type: "hiragana" },
  { kana: "びゅ", romaji: "byu", group: "youon-b", type: "hiragana" },
  { kana: "びょ", romaji: "byo", group: "youon-b", type: "hiragana" },
  // --- PY (nửa đục) ---
  { kana: "ぴゃ", romaji: "pya", group: "youon-p", type: "hiragana" },
  { kana: "ぴゅ", romaji: "pyu", group: "youon-p", type: "hiragana" },
  { kana: "ぴょ", romaji: "pyo", group: "youon-p", type: "hiragana" },
];

export const hiraganaGroups = [
  // Cơ bản
  { key: "vowels", label: "Nguyên âm (あいうえお)", category: "basic" },
  { key: "k", label: "Hàng K (かきくけこ)", category: "basic" },
  { key: "s", label: "Hàng S (さしすせそ)", category: "basic" },
  { key: "t", label: "Hàng T (たちつてと)", category: "basic" },
  { key: "n", label: "Hàng N (なにぬねの)", category: "basic" },
  { key: "h", label: "Hàng H (はひふへほ)", category: "basic" },
  { key: "m", label: "Hàng M (まみむめも)", category: "basic" },
  { key: "y", label: "Hàng Y (やゆよ)", category: "basic" },
  { key: "r", label: "Hàng R (らりるれろ)", category: "basic" },
  { key: "w", label: "Hàng W (わを)", category: "basic" },
  { key: "special", label: "Đặc biệt (ん)", category: "basic" },
  // Âm đục
  { key: "dakuten-g", label: "Âm G (がぎぐげご)", category: "dakuten" },
  { key: "dakuten-z", label: "Âm Z (ざじずぜぞ)", category: "dakuten" },
  { key: "dakuten-d", label: "Âm D (だぢづでど)", category: "dakuten" },
  { key: "dakuten-b", label: "Âm B (ばびぶべぼ)", category: "dakuten" },
  // Âm nửa đục
  { key: "handakuten-p", label: "Âm P (ぱぴぷぺぽ)", category: "handakuten" },
  // Âm ghép cơ bản
  { key: "youon-k", label: "KY (きゃきゅきょ)", category: "youon" },
  { key: "youon-s", label: "SH (しゃしゅしょ)", category: "youon" },
  { key: "youon-t", label: "CH (ちゃちゅちょ)", category: "youon" },
  { key: "youon-n", label: "NY (にゃにゅにょ)", category: "youon" },
  { key: "youon-h", label: "HY (ひゃひゅひょ)", category: "youon" },
  { key: "youon-m", label: "MY (みゃみゅみょ)", category: "youon" },
  { key: "youon-r", label: "RY (りゃりゅりょ)", category: "youon" },
  // Âm ghép đục / nửa đục
  { key: "youon-g", label: "GY (ぎゃぎゅぎょ)", category: "youon" },
  { key: "youon-j", label: "J (じゃじゅじょ)", category: "youon" },
  { key: "youon-b", label: "BY (びゃびゅびょ)", category: "youon" },
  { key: "youon-p", label: "PY (ぴゃぴゅぴょ)", category: "youon" },
];
