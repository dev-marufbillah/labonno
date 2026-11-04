import type { Metadata } from "next";
import { requireCustomer } from "@/lib/auth/server";
import { listAddresses } from "@/lib/services/addresses";
import { AddressBook, type AddressView } from "@/components/site/address-book";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Addresses", robots: { index: false, follow: false } };

export default async function AddressesPage() {
  const user = await requireCustomer("/account/addresses");
  const addresses = await listAddresses(user.id);

  const views: AddressView[] = addresses.map((address) => ({
    id: String(address._id),
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    address: address.address,
    area: address.area,
    district: address.district,
    postcode: address.postcode ?? "",
    isDefault: address.isDefault,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light">Addresses</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Saved delivery addresses — used at checkout so you never retype them.
        </p>
      </div>
      <AddressBook addresses={views} defaultName={user.name} defaultPhone={user.phone ?? ""} />
    </div>
  );
}
