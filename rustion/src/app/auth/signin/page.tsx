import { SignIn } from "../../../components/auth/SignIn";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-gray-800 p-6 shadow-lg">
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