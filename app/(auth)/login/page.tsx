import AuthForm from "@/components/AuthForm";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <AuthForm initialMode="signin" />
    </div>
  );
}