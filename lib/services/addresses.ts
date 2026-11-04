import "server-only";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import type { AddressDoc } from "@/lib/db/types";

/** A customer can keep a handful of addresses — enough to cover home, office and gifts. */
const MAX_ADDRESSES = 6;

export interface AddressInput {
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  area: string;
  district: string;
  postcode?: string;
}

export async function listAddresses(userId: string): Promise<AddressDoc[]> {
  return col<AddressDoc>("addresses").find({ userId }).sort({ isDefault: -1, updatedAt: -1 }).toArray();
}

export async function getDefaultAddress(userId: string): Promise<AddressDoc | null> {
  const addresses = await listAddresses(userId);
  return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
}

export class AddressError extends Error {}

export async function saveAddress(userId: string, input: AddressInput): Promise<AddressDoc> {
  const collection = col<AddressDoc>("addresses");
  const now = new Date();
  const existing = await collection.countDocuments({ userId });

  const doc: Omit<AddressDoc, "_id"> = {
    userId,
    label: input.label?.trim() || "Home",
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    area: input.area.trim(),
    district: input.district.trim(),
    postcode: input.postcode?.trim() || "",
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  if (input.id && ObjectId.isValid(input.id)) {
    const _id = new ObjectId(input.id);
    const { createdAt: _ignored, ...rest } = doc;
    const result = await collection.findOneAndUpdate(
      { _id, userId },
      { $set: { ...rest, updatedAt: now } },
      { returnDocument: "after" }
    );
    if (!result) throw new AddressError("That address no longer exists.");
    return result;
  }

  if (existing >= MAX_ADDRESSES) {
    throw new AddressError(`You can save up to ${MAX_ADDRESSES} addresses. Delete one first.`);
  }

  // The first address becomes the default automatically.
  doc.isDefault = existing === 0;
  const result = await collection.insertOne(doc as AddressDoc);
  return { ...doc, _id: result.insertedId };
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new AddressError("Unknown address.");
  const collection = col<AddressDoc>("addresses");
  const removed = await collection.findOneAndDelete({ _id: new ObjectId(id), userId });
  if (!removed) throw new AddressError("That address no longer exists.");

  // Keep one default at all times.
  if (removed.isDefault) {
    const next = await collection.find({ userId }).sort({ updatedAt: -1 }).limit(1).next();
    if (next?._id) await collection.updateOne({ _id: next._id }, { $set: { isDefault: true } });
  }
}

export async function makeDefaultAddress(userId: string, id: string): Promise<void> {
  if (!ObjectId.isValid(id)) throw new AddressError("Unknown address.");
  const collection = col<AddressDoc>("addresses");
  const owned = await collection.findOne({ _id: new ObjectId(id), userId });
  if (!owned) throw new AddressError("That address no longer exists.");
  await collection.updateMany({ userId }, { $set: { isDefault: false } });
  await collection.updateOne({ _id: owned._id }, { $set: { isDefault: true, updatedAt: new Date() } });
}
