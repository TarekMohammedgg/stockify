"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const CUSTOMER_HOME = "/menu";

function toArabicError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password"))
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  if (m.includes("email not confirmed"))
    return "يرجى تأكيد بريدك الإلكتروني أولاً";
  if (m.includes("too many requests"))
    return "محاولات كثيرة، انتظر قليلاً ثم حاول مجدداً";
  if (m.includes("user not found"))
    return "لا يوجد حساب بهذا البريد الإلكتروني";
  return "حدث خطأ في تسجيل الدخول، حاول مجدداً";
}

function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  if (!value.startsWith("/") || value.startsWith("//")) return CUSTOMER_HOME;
  return value;
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = safeNext(formData.get("next"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: toArabicError(error.message) };
  }

  // Fetch role from users table
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "فشل تسجيل الدخول" };

  const { data: profile } = await supabase
    .from("users")
    .select("role, profile_complete")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (role === "admin") redirect("/admin");
  if (role === "cashier") redirect("/cashier");
  if (role === "delivery") redirect("/delivery");

  redirect(next);
}

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, phone },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Update phone in users table (trigger creates the row)
  const user = data?.user;

  if (user) {
    await supabase.from("users").update({ phone, profile_complete: true }).eq("id", user.id);
  }

  redirect(CUSTOMER_HOME);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const origin = `${proto}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function completeProfile(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("users")
    .update({ name, phone, address, profile_complete: true })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  const { error: insightsError } = await supabase
    .from("users_insights")
    .upsert(
      { user_id: user.id, user_phone: phone, user_address: address, last_seen: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (insightsError) {
    console.error("[completeProfile] users_insights upsert failed", insightsError.message);
  }

  return { ok: true };
}
