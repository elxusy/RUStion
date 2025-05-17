import { auth } from "../server/auth";
import { redirect } from "next/navigation";
import { SignIn } from "../components/auth/SignIn";

export default async function HomePage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-zinc-800 p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Войдите в свой аккаунт
          </h2>
        </div>
        <SignIn />
      </div>
    </div>
  );
}