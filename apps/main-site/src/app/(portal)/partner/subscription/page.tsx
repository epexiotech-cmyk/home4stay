import { redirect } from "next/navigation";

export default function SubscriptionRedirectPage() {
  redirect("/partner/dashboard/billing");
}
