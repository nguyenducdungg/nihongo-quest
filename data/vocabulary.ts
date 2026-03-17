import { VocabItem } from "@/types";

export const vocabularyData: VocabItem[] = [
  // Greetings
  {
    japanese: "こんにちは",
    reading: "konnichiwa",
    meaning: "Xin chào (buổi trưa)",
    topic: "greetings",
    level: 1,
  },
  {
    japanese: "おはよう",
    reading: "ohayou",
    meaning: "Chào buổi sáng",
    topic: "greetings",
    level: 1,
  },
  {
    japanese: "こんばんは",
    reading: "konbanwa",
    meaning: "Chào buổi tối",
    topic: "greetings",
    level: 1,
  },
  { japanese: "ありがとう", reading: "arigatou", meaning: "Cảm ơn", topic: "greetings", level: 1 },
  {
    japanese: "すみません",
    reading: "sumimasen",
    meaning: "Xin lỗi / Excuse me",
    topic: "greetings",
    level: 1,
  },
  { japanese: "はい", reading: "hai", meaning: "Vâng / Có", topic: "greetings", level: 1 },
  { japanese: "いいえ", reading: "iie", meaning: "Không", topic: "greetings", level: 1 },
  {
    japanese: "さようなら",
    reading: "sayounara",
    meaning: "Tạm biệt",
    topic: "greetings",
    level: 1,
  },

  // Numbers
  { japanese: "いち", reading: "ichi", meaning: "Một (1)", topic: "numbers", level: 1 },
  { japanese: "に", reading: "ni", meaning: "Hai (2)", topic: "numbers", level: 1 },
  { japanese: "さん", reading: "san", meaning: "Ba (3)", topic: "numbers", level: 1 },
  { japanese: "し / よん", reading: "shi / yon", meaning: "Bốn (4)", topic: "numbers", level: 1 },
  { japanese: "ご", reading: "go", meaning: "Năm (5)", topic: "numbers", level: 1 },
  { japanese: "ろく", reading: "roku", meaning: "Sáu (6)", topic: "numbers", level: 1 },
  {
    japanese: "しち / なな",
    reading: "shichi / nana",
    meaning: "Bảy (7)",
    topic: "numbers",
    level: 1,
  },
  { japanese: "はち", reading: "hachi", meaning: "Tám (8)", topic: "numbers", level: 1 },
  {
    japanese: "きゅう / く",
    reading: "kyuu / ku",
    meaning: "Chín (9)",
    topic: "numbers",
    level: 1,
  },
  { japanese: "じゅう", reading: "juu", meaning: "Mười (10)", topic: "numbers", level: 1 },

  // Colors
  { japanese: "あか", reading: "aka", meaning: "Màu đỏ", topic: "colors", level: 1 },
  { japanese: "あお", reading: "ao", meaning: "Màu xanh lam", topic: "colors", level: 1 },
  { japanese: "きいろ", reading: "kiiro", meaning: "Màu vàng", topic: "colors", level: 1 },
  { japanese: "みどり", reading: "midori", meaning: "Màu xanh lá", topic: "colors", level: 1 },
  { japanese: "しろ", reading: "shiro", meaning: "Màu trắng", topic: "colors", level: 1 },
  { japanese: "くろ", reading: "kuro", meaning: "Màu đen", topic: "colors", level: 1 },

  // Food
  { japanese: "ごはん", reading: "gohan", meaning: "Cơm / bữa ăn", topic: "food", level: 1 },
  { japanese: "みず", reading: "mizu", meaning: "Nước", topic: "food", level: 1 },
  { japanese: "おちゃ", reading: "ocha", meaning: "Trà", topic: "food", level: 1 },
  { japanese: "パン", reading: "pan", meaning: "Bánh mì", topic: "food", level: 1 },
  { japanese: "さかな", reading: "sakana", meaning: "Cá", topic: "food", level: 1 },
  { japanese: "にく", reading: "niku", meaning: "Thịt", topic: "food", level: 1 },
  { japanese: "たまご", reading: "tamago", meaning: "Trứng", topic: "food", level: 1 },
  { japanese: "やさい", reading: "yasai", meaning: "Rau củ", topic: "food", level: 1 },

  // Family
  { japanese: "おかあさん", reading: "okaasan", meaning: "Mẹ", topic: "family", level: 2 },
  { japanese: "おとうさん", reading: "otousan", meaning: "Bố", topic: "family", level: 2 },
  { japanese: "おにいさん", reading: "oniisan", meaning: "Anh trai", topic: "family", level: 2 },
  { japanese: "おねえさん", reading: "oneesan", meaning: "Chị gái", topic: "family", level: 2 },
  { japanese: "おとうと", reading: "otouto", meaning: "Em trai", topic: "family", level: 2 },
  { japanese: "いもうと", reading: "imouto", meaning: "Em gái", topic: "family", level: 2 },

  // Adjectives
  { japanese: "おおきい", reading: "ookii", meaning: "To, lớn", topic: "adjectives", level: 2 },
  { japanese: "ちいさい", reading: "chiisai", meaning: "Nhỏ, bé", topic: "adjectives", level: 2 },
  { japanese: "たかい", reading: "takai", meaning: "Cao / đắt", topic: "adjectives", level: 2 },
  { japanese: "やすい", reading: "yasui", meaning: "Rẻ", topic: "adjectives", level: 2 },
  { japanese: "あたらしい", reading: "atarashii", meaning: "Mới", topic: "adjectives", level: 2 },
  { japanese: "ふるい", reading: "furui", meaning: "Cũ", topic: "adjectives", level: 2 },
];

export const vocabTopics = [
  { key: "greetings", label: "Lời chào", emoji: "👋", level: 1 },
  { key: "numbers", label: "Số đếm", emoji: "🔢", level: 1 },
  { key: "colors", label: "Màu sắc", emoji: "🎨", level: 1 },
  { key: "food", label: "Thức ăn", emoji: "🍱", level: 1 },
  { key: "family", label: "Gia đình", emoji: "👨‍👩‍👧", level: 2 },
  { key: "adjectives", label: "Tính từ", emoji: "✨", level: 2 },
];
