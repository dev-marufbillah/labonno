import type { Metadata } from "next";
import Link from "next/link";
import { getAllPages, getAllFaqs } from "@/lib/services/content";
import { AdminPageTitle, Panel, TableEmpty } from "@/components/admin/ui";
import { Table, THead, TH, TD, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FaqDialog, PageDialog } from "@/components/admin/page-forms";
import { ActionButton } from "@/components/admin/action-button";
import { deleteFaq, deletePage } from "@/lib/actions/content";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Content pages" };

export default async function AdminPagesPage() {
  const [pages, faqs] = await Promise.all([getAllPages(), getAllFaqs()]);

  return (
    <div className="space-y-6">
      <div>
        <AdminPageTitle title="Content pages" description="Policies, about, FAQ entries and any editorial page on the site." action={<PageDialog />} />
        <Panel>
          <Table>
            <THead>
              <TR>
                <TH>Page</TH>
                <TH>Slug</TH>
                <TH>Status</TH>
                <TH>Updated</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <tbody>
              {pages.map((page) => (
                <TR key={String(page._id)}>
                  <TD className="font-medium text-ink">{page.title}</TD>
                  <TD>
                    {["about", "faq", "size-guide", "shipping-policy", "return-policy", "privacy-policy", "terms", "contact"].includes(page.slug) ? (
                      <Link href={`/${page.slug}`} className="text-[11.5px] hover:text-gold-dark">/{page.slug}</Link>
                    ) : (
                      <Link href={`/p/${page.slug}`} className="text-[11.5px] hover:text-gold-dark">/p/{page.slug}</Link>
                    )}
                  </TD>
                  <TD>{page.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</TD>
                  <TD>{formatDate(page.updatedAt)}</TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1.5">
                      <PageDialog page={page} />
                      <ActionButton
                        action={async () => deletePage(String(page._id))}
                        label="Delete"
                        destructive
                        confirmTitle="Delete this page?"
                        confirmDescription="Any links to this page will 404."
                        confirmLabel="Delete"
                      />
                    </div>
                  </TD>
                </TR>
              ))}
              {pages.length === 0 ? <TableEmpty colSpan={5} message="No content pages yet." /> : null}
            </tbody>
          </Table>
        </Panel>
      </div>

      <div>
        <AdminPageTitle title="FAQ entries" description="Answers shown on the FAQ page, grouped by category." action={<FaqDialog />} />
        <Panel>
          <Table>
            <THead>
              <TR>
                <TH>Question</TH>
                <TH>Category</TH>
                <TH>Order</TH>
                <TH>Visibility</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <tbody>
              {faqs.map((faq) => (
                <TR key={String(faq._id)}>
                  <TD className="max-w-[380px] truncate font-medium text-ink">{faq.question}</TD>
                  <TD>{faq.category}</TD>
                  <TD>{faq.order}</TD>
                  <TD>{faq.visible ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>}</TD>
                  <TD>
                    <div className="flex items-center justify-end gap-1.5">
                      <FaqDialog faq={faq} />
                      <ActionButton
                        action={async () => deleteFaq(String(faq._id))}
                        label="Delete"
                        destructive
                        confirmTitle="Delete this FAQ?"
                        confirmLabel="Delete"
                      />
                    </div>
                  </TD>
                </TR>
              ))}
              {faqs.length === 0 ? <TableEmpty colSpan={5} message="No FAQ entries yet." /> : null}
            </tbody>
          </Table>
        </Panel>
      </div>
    </div>
  );
}
