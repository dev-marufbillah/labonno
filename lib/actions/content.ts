"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { col } from "@/lib/db/mongo";
import { bannerSchema, pageSchema, sectionSchema } from "@/lib/validations";
import type { BannerDoc, FaqDoc, HomepageSectionDoc, PageDoc, SiteSettingsDoc } from "@/lib/db/types";
import { saveSiteSettings } from "@/lib/services/settings";
import { audit, fail, requireActor, type ActionState } from "./helpers";

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/faq");
  revalidatePath("/contact");
}

export async function saveBanner(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Please check the banner fields.",
        fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])),
      };
    }
    const banners = col<BannerDoc>("banners");
    if (id) {
      await banners.updateOne({ _id: new ObjectId(id) }, { $set: { ...parsed.data, updatedAt: new Date() } });
    } else {
      await banners.insertOne({ ...parsed.data, createdAt: new Date(), updatedAt: new Date() } as BannerDoc);
    }
    await audit(actor.email, id ? "banner.update" : "banner.create", `banner:${id ?? parsed.data.title}`);
    revalidateSite();
    revalidatePath("/admin/banners");
    return { ok: true, message: id ? "Banner updated." : "Banner created." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteBanner(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    await col<BannerDoc>("banners").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "banner.delete", `banner:${id}`);
    revalidateSite();
    return { ok: true, message: "Banner deleted." };
  } catch (error) {
    return fail(error);
  }
}

export async function saveSection(input: unknown, key: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = sectionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: "Please check the section fields." };
    await col<HomepageSectionDoc>("homepage_sections").updateOne(
      { key },
      {
        $set: {
          title: parsed.data.title,
          subtitle: parsed.data.subtitle,
          visible: parsed.data.visible,
          order: parsed.data.order,
          data: parsed.data.data as Record<string, unknown>,
          updatedAt: new Date(),
        },
      }
    );
    await audit(actor.email, "homepage.section.update", `section:${key}`);
    revalidateSite();
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Section saved." };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleSection(key: string, visible: boolean): Promise<ActionState> {
  try {
    const actor = await requireActor();
    await col<HomepageSectionDoc>("homepage_sections").updateOne(
      { key },
      { $set: { visible, updatedAt: new Date() } }
    );
    await audit(actor.email, "homepage.section.visibility", `section:${key}`, { visible });
    revalidateSite();
    revalidatePath("/admin/homepage");
    return { ok: true, message: visible ? "Section shown." : "Section hidden." };
  } catch (error) {
    return fail(error);
  }
}

export async function moveSection(key: string, direction: "up" | "down"): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const sections = await col<HomepageSectionDoc>("homepage_sections").find({}).sort({ order: 1 }).toArray();
    const index = sections.findIndex((section) => section.key === key);
    if (index === -1) return { ok: false, message: "Section not found." };
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= sections.length) return { ok: false, message: "Section is already at the edge." };
    await Promise.all([
      col<HomepageSectionDoc>("homepage_sections").updateOne(
        { _id: sections[index]._id },
        { $set: { order: sections[swapWith].order === sections[index].order ? sections[index].order + (direction === "up" ? -1 : 1) : sections[swapWith].order } }
      ),
      col<HomepageSectionDoc>("homepage_sections").updateOne(
        { _id: sections[swapWith]._id },
        { $set: { order: sections[index].order } }
      ),
    ]);
    // Normalise ordering so repeated moves stay predictable.
    const normalised = await col<HomepageSectionDoc>("homepage_sections").find({}).sort({ order: 1 }).toArray();
    await Promise.all(
      normalised.map((section, i) =>
        col<HomepageSectionDoc>("homepage_sections").updateOne({ _id: section._id }, { $set: { order: i + 1 } })
      )
    );
    await audit(actor.email, "homepage.section.move", `section:${key}`, { direction });
    revalidateSite();
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Section order updated." };
  } catch (error) {
    return fail(error);
  }
}

export async function savePage(input: unknown, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    const parsed = pageSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: "Please check the page fields.",
        fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])),
      };
    }
    const pages = col<PageDoc>("content_pages");
    const payload = { ...parsed.data, updatedAt: new Date() };
    if (id) {
      await pages.updateOne({ _id: new ObjectId(id) }, { $set: payload });
    } else {
      const exists = await pages.findOne({ slug: payload.slug });
      if (exists) return { ok: false, message: "A page with that slug already exists." };
      await pages.insertOne({ ...payload, createdAt: new Date() } as PageDoc);
    }
    await audit(actor.email, id ? "page.update" : "page.create", `page:${payload.slug}`);
    revalidatePath(`/p/${payload.slug}`);
    revalidatePath(`/${payload.slug}`);
    revalidatePath("/admin/pages");
    return { ok: true, message: id ? "Page updated." : "Page created." };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePage(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    await col<PageDoc>("content_pages").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "page.delete", `page:${id}`);
    revalidatePath("/admin/pages");
    return { ok: true, message: "Page deleted." };
  } catch (error) {
    return fail(error);
  }
}

export async function saveFaq(input: { question: string; answer: string; category: string; order: number; visible: boolean }, id?: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    if (!input.question.trim() || !input.answer.trim()) return { ok: false, message: "Question and answer are required." };
    const faqs = col<FaqDoc>("faqs");
    const payload = { ...input, updatedAt: new Date() };
    if (id) await faqs.updateOne({ _id: new ObjectId(id) }, { $set: payload });
    else await faqs.insertOne(payload as FaqDoc);
    await audit(actor.email, id ? "faq.update" : "faq.create", `faq:${id ?? input.question}`);
    revalidatePath("/faq");
    revalidatePath("/admin/pages");
    return { ok: true, message: "FAQ saved." };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFaq(id: string): Promise<ActionState> {
  try {
    const actor = await requireActor();
    await col<FaqDoc>("faqs").deleteOne({ _id: new ObjectId(id) });
    await audit(actor.email, "faq.delete", `faq:${id}`);
    revalidatePath("/faq");
    return { ok: true, message: "FAQ deleted." };
  } catch (error) {
    return fail(error);
  }
}

type SettingsPatch = Partial<Omit<SiteSettingsDoc, "_id" | "updatedAt">>;

export async function saveSettings(patch: SettingsPatch): Promise<ActionState> {
  try {
    const actor = await requireActor();
    // Deep-merge each provided group over the stored settings.
    const { readSiteSettings } = await import("@/lib/services/settings");
    const current = await readSiteSettings();
    const merged = { ...current, ...patch } as SiteSettingsDoc;
    for (const key of Object.keys(patch) as (keyof SettingsPatch)[]) {
      const value = patch[key];
      if (value && typeof value === "object" && !Array.isArray(value) && current[key] && typeof current[key] === "object") {
        (merged as unknown as Record<string, unknown>)[key as string] = {
          ...(current[key] as object),
          ...(value as object),
        };
      }
    }
    await saveSiteSettings(merged, actor.email);
    await audit(actor.email, "settings.update", "site_settings", { groups: Object.keys(patch) });
    revalidateSite();
    revalidatePath("/admin/settings");
    return { ok: true, message: "Settings saved." };
  } catch (error) {
    return fail(error);
  }
}
