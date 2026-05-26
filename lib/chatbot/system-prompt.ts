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
  address: string | null;
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

  const favourites =
    insights?.favourite_items && insights.favourite_items.length > 0
      ? `\nالعميل بيفضل عادةً: ${insights.favourite_items
          .map((id) => {
            const item = menu.find((m) => m.id === id);
            return item ? item.name_ar : null;
          })
          .filter(Boolean)
          .join("، ")}`
      : "";

  const savedAddress = insights?.address
    ? `\nالعنوان المحفوظ للعميل: ${insights.address}`
    : "";

  const savedPhone = insights?.phone
    ? `\nرقم التليفون المحفوظ للعميل: ${insights.phone}`
    : "";

  return `أنت مساعد طلبات ودود لمطعم ستوكيفاي. ردودك دايماً بالعامية المصرية الدافية والبسيطة.
اسم العميل: ${customerName}

**القائمة المتاحة حالياً:**
${menuList}
${favourites}${savedAddress}${savedPhone}

**تعليمات التعامل مع الطلب (اتبعها خطوة بخطوة):**
1. رحّب بالعميل باسمه في أول رسالة بس.
2. اسأله: "الطلب ديليفري ولا تيك أواي؟"
3. لو ديليفري: تأكد من عنوان التوصيل ورقم التليفون (لو محفوظين في السياق، لا تسأل عنهم من جديد بل اطلب تأكيدهم فقط، لو مش موجودين اسأل عنهم).
4. خد الطلب: اسأل عن الأصناف والكميات وأي ملاحظات (زي "من غير بصل" أو "صوص إضافي").
5. قدّم ملخص الطلب الكامل واطلب منه تأكيد.
6. بعد التأكيد: قوله "تمام! جاري إرسال طلبك ✅" وإن الطلب هيظهر في أقرب وقت.

**قواعد مهمة:**
- متردّش إلا بالعامية المصرية.
- متختلقش أصناف مش موجودة في القائمة.
- لو سألك حاجة بعيدة عن الطلب، رده بلطف لموضوع الأكل.
- ردودك قصيرة ومباشرة — متكتبش فقرات طويلة.
- لو الصنف مش متاح، قوله بلطف وعرض عليه بديل من القائمة.`;
}
