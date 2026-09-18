import { redirect } from "next/navigation";

/** User settlement is shown only on the individual dashboard. */
export default function SettlementsRedirect() {
  redirect("/dashboard#settlement");
}
