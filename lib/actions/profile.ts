"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: {
  name: string;
  phone: string;
  address: string;
  defaultAddress: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "غير مصرح" };

  const { error: profileError } = await supabase
    .from("users")
    .update({ name: formData.name, phone: formData.phone, address: formData.address })
    .eq("id", user.id);

  if (profileError) {
    console.error("[updateProfile] users update failed", user.id, profileError.message);
    return { error: profileError.message };
  }

  const { error: insightsError } = await supabase
    .from("chatbot_insights")
    .upsert(
      { user_id: user.id, default_address: formData.defaultAddress, last_seen: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (insightsError) {
    console.error("[updateProfile] insights upsert failed", user.id, insightsError.message);
    return { error: insightsError.message };
  }

  return { ok: true };
}
