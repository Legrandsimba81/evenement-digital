"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, BadgeCheck, Lock, Mail, MapPin, Phone, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { registerUser } from "@/actions/auth-actions";

type AuthFormProps = {
    initialMode?: "signin" | "register";
};

export default function AuthForm({ initialMode = "signin" }: AuthFormProps) {
    const [mode, setMode] = useState<"signin" | "register">(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [signinForm, setSigninForm] = useState({ email: "", password: "" });
    const [registerForm, setRegisterForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        cardVisa: "",
    });

    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await signIn("credentials", {
            email: signinForm.email,
            password: signinForm.password,
            redirect: false,
            callbackUrl,
        });

        if (res?.error) {
            setError("Identifiants invalides. Veuillez réessayer.");
        } else {
            // Après connexion, rediriger vers /dashboard qui vérifiera s'il a des événements
            router.push(callbackUrl);
        }

        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        const formData = new FormData();
        formData.append("name", registerForm.name);
        formData.append("email", registerForm.email);
        formData.append("password", registerForm.password);
        formData.append("phone", registerForm.phone);
        formData.append("city", registerForm.city);
        formData.append("cardVisa", registerForm.cardVisa);

        const result = await registerUser(formData);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess("Compte créé avec succès. Vous pouvez maintenant vous connecter.");
            setMode("signin");
            setSigninForm({ email: registerForm.email, password: "" });
        }

        setLoading(false);
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 lg:flex-row">
            {/* Partie gauche */}
            <div className="flex flex-col justify-between bg-primary-500/10 p-8 lg:w-[44%] lg:p-10">
                <div>
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/15 text-primary">
                        <Sparkles size={22} />
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        Gérez vos événements en toute simplicité
                    </h1>
                    <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                        Créez, suivez et partagez vos événements depuis un seul espace moderne et sécurisé.
                    </p>
                </div>

                <div className="mt-8 rounded-2xl border border-primary-500/20 bg-white/70 p-4 text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300">
                    <div className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <BadgeCheck size={16} className="text-primary" />
                        Pourquoi rejoindre ?
                    </div>
                    <ul className="space-y-2">
                        <li>• Créez vos événements en quelques secondes</li>
                        <li>• Suivez les inscriptions et les paiements</li>
                        <li>• Accédez à votre espace depuis n’importe où</li>
                    </ul>
                </div>
            </div>

            {/* Partie droite */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10">
                <div className="mb-6 flex rounded-full border border-gray-200 p-1 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("signin");
                            setError("");
                            setSuccess("");
                        }}
                        className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "signin"
                                ? "bg-primary-500 text-white shadow"
                                : "text-gray-600 hover:text-primary dark:text-gray-300"
                            }`}
                    >
                        Connexion
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode("register");
                            setError("");
                            setSuccess("");
                        }}
                        className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "register"
                                ? "bg-primary-500 text-white shadow"
                                : "text-gray-600 hover:text-primary dark:text-gray-300"
                            }`}
                    >
                        Inscription
                    </button>
                </div>

                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {mode === "signin" ? "Bienvenue à nouveau" : "Créer un compte"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {mode === "signin"
                            ? "Connectez-vous pour continuer votre expérience."
                            : "Inscrivez-vous pour démarrer vos événements."}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                        {success}
                    </div>
                )}

                {mode === "signin" ? (
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="mb-2 block">Email</span>
                            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                <Mail size={16} className="mr-2 text-gray-400" />
                                <input
                                    type="email"
                                    value={signinForm.email}
                                    onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
                                    className="w-full border-none bg-transparent outline-none"
                                    placeholder="vous@example.com"
                                    required
                                />
                            </div>
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="mb-2 block">Mot de passe</span>
                            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                <Lock size={16} className="mr-2 text-gray-400" />
                                <input
                                    type="password"
                                    value={signinForm.password}
                                    onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
                                    className="w-full border-none bg-transparent outline-none"
                                    placeholder="Votre mot de passe"
                                    required
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="mb-2 block">Nom complet</span>
                            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                <UserRound size={16} className="mr-2 text-gray-400" />
                                <input
                                    type="text"
                                    value={registerForm.name}
                                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                    className="w-full border-none bg-transparent outline-none"
                                    placeholder="Jean Dupont"
                                    required
                                />
                            </div>
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="mb-2 block">Email</span>
                            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                <Mail size={16} className="mr-2 text-gray-400" />
                                <input
                                    type="email"
                                    value={registerForm.email}
                                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                    className="w-full border-none bg-transparent outline-none"
                                    placeholder="vous@example.com"
                                    required
                                />
                            </div>
                        </label>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="mb-2 block">Mot de passe</span>
                            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                <Lock size={16} className="mr-2 text-gray-400" />
                                <input
                                    type="password"
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                    className="w-full border-none bg-transparent outline-none"
                                    placeholder="Créez un mot de passe"
                                    required
                                />
                            </div>
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                <span className="mb-2 block">Téléphone</span>
                                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                    <Phone size={16} className="mr-2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={registerForm.phone}
                                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                                        className="w-full border-none bg-transparent outline-none"
                                        placeholder="+225"
                                        required
                                    />
                                </div>
                            </label>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                <span className="mb-2 block">Ville</span>
                                <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                    <MapPin size={16} className="mr-2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={registerForm.city}
                                        onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                                        className="w-full border-none bg-transparent outline-none"
                                        placeholder="Abidjan"
                                        required
                                    />
                                </div>
                            </label>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                            <span className="mb-2 block">Carte Visa (optionnel)</span>
                            <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 focus-within:border-primary focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:bg-gray-950">
                                <BadgeCheck size={16} className="mr-2 text-gray-400" />
                                <input
                                    type="text"
                                    value={registerForm.cardVisa}
                                    onChange={(e) => setRegisterForm({ ...registerForm, cardVisa: e.target.value })}
                                    className="w-full border-none bg-transparent outline-none"
                                    placeholder="XXXX XXXX XXXX"
                                />
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "Inscription..." : "Créer mon compte"}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl })}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {mode === "signin" ? "Se connecter avec Google" : "S'inscrire avec Google"}
                </button>

                <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
                    En continuant, vous acceptez nos{" "}
                    <Link href="/" className="font-medium text-primary hover:underline">
                        conditions d’utilisation
                    </Link>
                </p>
            </div>
        </div>
    );
}