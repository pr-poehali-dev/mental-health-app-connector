export type OrgCategory =
  | "healthcare"
  | "nko"
  | "social"
  | "education"
  | "sport"
  | "culture"
  | "crisis";

export type AgeGroup = "children" | "adults" | "elderly" | "all";

export type SpecialNeed =
  | "ras"
  | "tmnr"
  | "mental"
  | "intellectual"
  | "zpr"
  | "deviant"
  | "any";

export type ServiceType =
  | "housing"
  | "rehabilitation"
  | "consultation"
  | "day_center"
  | "hotline"
  | "online"
  | "group";

export type PaymentType = "free" | "paid" | "oms" | "mixed";

export type VerificationStatus = "verified" | "pending" | "outdated";

export interface Organization {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  simpleDescription: string;
  whoHelps: string;
  whenToContact: string;
  category: OrgCategory;
  ageGroups: AgeGroup[];
  specialNeeds: SpecialNeed[];
  serviceTypes: ServiceType[];
  paymentTypes: PaymentType[];
  region: string;
  city: string;
  address?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  website?: string;
  vk?: string;
  telegram?: string;
  workingHours?: string;
  verificationStatus: VerificationStatus;
  updatedAt: string;
  isUrgent?: boolean;
  rating?: number;
  lat?: number;
  lng?: number;
}

export const CATEGORY_META: Record<OrgCategory, { label: string; color: string; bg: string; icon: string }> = {
  healthcare: { label: "Здравоохранение", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: "🏥" },
  nko: { label: "Некоммерческий сектор", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "🤝" },
  social: { label: "Соцзащита", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: "🏛" },
  education: { label: "Образование", color: "text-violet-700", bg: "bg-violet-50 border-violet-200", icon: "📚" },
  sport: { label: "Спорт", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: "⚽" },
  culture: { label: "Культура", color: "text-pink-700", bg: "bg-pink-50 border-pink-200", icon: "🎭" },
  crisis: { label: "Кризисная помощь", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: "🆘" },
};

// Маппинг реальных значений category из БД → ключ CATEGORY_META
export function dbCategoryToKey(category: string | null | undefined): OrgCategory {
  const c = (category ?? "").toLowerCase();
  if (c.includes("медицин") || c.includes("санатор") || c.includes("психотерап") || c.includes("наркол")) return "healthcare";
  if (c.includes("некоммерч") || c.includes("нко") || c.includes("благотворит") || c.includes("автономн") || c.includes("ано ") || c.includes("общественн")) return "nko";
  if (
    c.includes("соц") || c.includes("дом-интернат") || c.includes("интернат") ||
    c.includes("реабилитац") || c.includes("абилитац") || c.includes("центр дневн") ||
    c.includes("тренировочн") || c.includes("сопровождаем") || c.includes("трудов") ||
    c.includes("государствен") || c.includes("ранн")
  ) return "social";
  if (c.includes("образов") || c.includes("школа") || c.includes("информационн")) return "education";
  if (c.includes("спорт") || c.includes("физическ")) return "sport";
  if (c.includes("культур") || c.includes("искусств")) return "culture";
  if (c.includes("кризис")) return "crisis";
  return "social";
}

export const AGE_META: Record<AgeGroup, { label: string; icon: string }> = {
  children: { label: "Дети", icon: "👦" },
  adults: { label: "Взрослые", icon: "👤" },
  elderly: { label: "Пожилые", icon: "👴" },
  all: { label: "Все возрасты", icon: "👨‍👩‍👧‍👦" },
};

export const NEED_META: Record<SpecialNeed, { label: string; short: string }> = {
  ras: { label: "Расстройства аутистического спектра (РАС)", short: "РАС" },
  tmnr: { label: "Тяжёлые множественные нарушения развития (ТМНР)", short: "ТМНР" },
  mental: { label: "Психические расстройства", short: "Психические расстройства" },
  intellectual: { label: "Интеллектуальные нарушения", short: "Интел. нарушения" },
  zpr: { label: "Задержка психического развития (ЗПР)", short: "ЗПР" },
  deviant: { label: "Девиантное поведение", short: "Девиантное поведение" },
  any: { label: "Любые нарушения", short: "Любые" },
};

export const SERVICE_META: Record<ServiceType, { label: string; icon: string }> = {
  housing: { label: "Проживание", icon: "🏠" },
  rehabilitation: { label: "Реабилитация", icon: "🔄" },
  consultation: { label: "Консультации", icon: "💬" },
  day_center: { label: "Дневной центр", icon: "☀️" },
  hotline: { label: "Горячая линия", icon: "📞" },
  online: { label: "Онлайн-помощь", icon: "💻" },
  group: { label: "Групповая работа", icon: "👥" },
};

export const PAYMENT_META: Record<PaymentType, { label: string; color: string }> = {
  free: { label: "Бесплатно", color: "text-emerald-700 bg-emerald-50" },
  paid: { label: "Платно", color: "text-gray-700 bg-gray-100" },
  oms: { label: "По ОМС", color: "text-blue-700 bg-blue-50" },
  mixed: { label: "Частично бесплатно", color: "text-amber-700 bg-amber-50" },
};

export const REGIONS = [
  "Вся Россия",
  "Москва",
  "Санкт-Петербург",
  "Московская область",
  "Краснодарский край",
  "Свердловская область",
  "Новосибирская область",
  "Татарстан",
  "Нижегородская область",
  "Самарская область",
  "Ростовская область",
];