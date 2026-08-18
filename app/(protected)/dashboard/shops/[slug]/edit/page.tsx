// app/(protected)/dashboard/shops/[slug]/edit/page.tsx
import { getShopBySlug, getShopCategories } from "@/actions/shop-actions";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import EditShopForm from "@/components/shops/EditShopForm";

export const dynamic = "force-dynamic";

export default async function EditShopPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shop = await getShopBySlug(params.slug);
  if (!shop) return notFound();

  // Vérification des droits
  if (shop.userId !== session.user.id && session.user.role !== "ADMIN") {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Vous n'êtes pas autorisé à modifier cette boutique.</p>
      </div>
    );
  }

  const categories = await getShopCategories();

  return <EditShopForm shop={shop} categories={categories} />;
}