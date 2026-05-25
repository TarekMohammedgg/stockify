"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
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

  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "cashier") redirect("/cashier");
  if (profile?.profile_complete === false) redirect("/complete-profile");

  redirect("/");
}

export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("users").update({ phone, profile_complete: true }).eq("id", user.id);
  }

  redirect("/");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
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
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("users")
    .update({ phone, address, profile_complete: true })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}
