import AuthForm from "@/components/AuthForm";

export const dynamic = 'force-dynamic'; // 👈 Ajoutez cette ligne

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AuthForm initialMode="register" />
    </div>
  );
}