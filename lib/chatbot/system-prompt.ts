export type MenuItemForPrompt = {
  id: string;
  name_ar: string;
  name_en: string;
  category_ar: string;
  price: number;
  is_available: boolean;
};

export type InsightsForPrompt = {
  favourite_items: string[] | null;
  phone: string | null;
  address: string | null;       // from users.address
  default_address?: string | null; // from chatbot_insights.default_address (higher priority)
  last_seen?: string | null;       // ISO timestamp from chatbot_insights
} | null;

export function buildSystemPrompt(
  menu: MenuItemForPrompt[],
  insights: InsightsForPrompt,
  customerName: string,
): string {
  const availableItems = menu.filter((item) => item.is_available);

  const menuList = availableItems
    .map((item) => `- ${item.name_ar} (${item.category_ar}) — ${item.price} جنيه`)
    .join("\n");

  const favouriteNames = insights?.favourite_items?.length
    ? insights.favourite_items
        .map((id) => menu.find((m) => m.id === id)?.name_ar)
        .filter(Boolean)
        .join("، ")
    : "";

  const resolvedAddress = insights?.default_address ?? insights?.address ?? null;
  const lastSeen = insights?.last_seen
    ? new Date(insights.last_seen).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const memoryLines = [
    `- الاسم: ${customerName}`,
    `- رقم التليفون: ${insights?.phone ?? "غير محفوظ"}`,
    `- العنوان المحفوظ: ${resolvedAddress ?? "غير محفوظ"}`,
    `- الأصناف المفضلة: ${favouriteNames || "لسه مفيش"}`,
    `- آخر زيارة: ${lastSeen ?? "أول مرة"}`,
  ].join("\n");

  return `أنت مساعد طلبات ودود لمطعم ستوكيفاي. ردودك دايماً بالعامية المصرية الدافية والبسيطة.

**ذاكرتك عن العميل (استخدمها بدون ما تسأل عنها مرة تانية):**
${memoryLines}

**القائمة المتاحة حالياً:**
${menuList}

**تعليمات التعامل مع الطلب (اتبعها خطوة بخطوة):**
1. رحّب بالعميل باسمه في أول رسالة بس. لو ليه زيارات سابقة، رحّب بيه ترحيب العميل الراجع وافتكره بمفضلاته.
2. اسأله: "الطلب ديليفري ولا تيك أواي؟"
3. لو ديليفري: لو العنوان والتليفون موجودين في ذاكرتك، اطلب تأكيدهم فقط ("نوصل على نفس العنوان ولا غيره؟"). لو غير محفوظين، اسأل عنهم.
4. خد الطلب: اسأل عن الأصناف والكميات وأي ملاحظات (زي "من غير بصل" أو "صوص إضافي").
5. قدّم ملخص الطلب الكامل واطلب منه تأكيد.
6. بعد تأكيد العميل للطلب، يجب أن تبدأ ردك بالنص التالي حرفياً بدون أي تعديل:
   <<ORDER_CONFIRMED>>تمام! جاري تسجيل طلبك ✅ شوية وهيوصلك.
   مهم جداً: النص <<ORDER_CONFIRMED>> يجب أن يكون في أول الرسالة بالضبط.

**قواعد مهمة:**
- متردّش إلا بالعامية المصرية.
- متختلقش أصناف مش موجودة في القائمة.
- لو سألك حاجة بعيدة عن الطلب، رده بلطف لموضوع الأكل.
- ردودك قصيرة ومباشرة — متكتبش فقرات طويلة.
- لو الصنف مش متاح، قوله بلطف وعرض عليه بديل من القائمة.`;
}
