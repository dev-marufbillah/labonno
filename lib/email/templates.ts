import type { OrderDoc } from "@/lib/db/types";
import { formatMoney } from "@/lib/utils/format";

/** Shared shell: table-based, inline styles, works in Gmail/Outlook/Apple Mail. */
function shell(title: string, body: string, footer: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F6F1EA;font-family:Georgia,'Times New Roman',serif;color:#1C1B18">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EA;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E7DED1">
        <tr><td style="padding:28px 30px 6px;text-align:center">
          <div style="font-size:19px;letter-spacing:0.34em;text-transform:uppercase">LABONNO</div>
          <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#8A8375;margin-top:6px">The art of elegance</div>
        </td></tr>
        <tr><td style="padding:10px 30px 26px">
          <h1 style="font-size:23px;font-weight:400;margin:18px 0 4px">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:16px 30px 26px;border-top:1px solid #EFE8DC;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7;color:#8A8375">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemRows(order: OrderDoc) {
  return order.items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F2ECE2;font-family:Helvetica,Arial,sans-serif;font-size:12.5px">
          ${item.name}<br><span style="color:#8A8375;font-size:11px">${item.size} · ${item.color} · ×${item.quantity}</span>
        </td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid #F2ECE2;font-family:Helvetica,Arial,sans-serif;font-size:12.5px">${formatMoney(item.lineTotal)}</td>
      </tr>`
    )
    .join("");
}

export function orderConfirmationEmail(order: OrderDoc, siteName = "Labonno", paymentLabel = "your chosen method") {
  const body = `
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.7;color:#4A463E">
      Dear ${order.customer.name.split(" ")[0]}, thank you for your order. We have received it and our studio will
      confirm it shortly. Keep this email — the order number below is all you need to track it.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:12.5px">
      <tr><td style="padding:4px 0;color:#8A8375">Order</td><td align="right">${order.orderNumber}</td></tr>
      <tr><td style="padding:4px 0;color:#8A8375">Payment</td><td align="right">${paymentLabel}</td></tr>
      <tr><td style="padding:4px 0;color:#8A8375">Status</td><td align="right">${order.status}</td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px">
      ${itemRows(order)}
      <tr><td style="padding:8px 0;color:#8A8375;font-family:Helvetica,Arial,sans-serif;font-size:12px">Subtotal</td><td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px">${formatMoney(order.subtotal)}</td></tr>
      ${order.discount ? `<tr><td style="padding:2px 0;color:#8A8375;font-family:Helvetica,Arial,sans-serif;font-size:12px">Discount</td><td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px">−${formatMoney(order.discount)}</td></tr>` : ""}
      <tr><td style="padding:2px 0;color:#8A8375;font-family:Helvetica,Arial,sans-serif;font-size:12px">Delivery</td><td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px">${formatMoney(order.deliveryCharge)}</td></tr>
      <tr><td style="padding:10px 0 0;font-size:14px">Total</td><td align="right" style="padding:10px 0 0;font-size:14px">${formatMoney(order.total)}</td></tr>
    </table>
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#4A463E;margin-top:18px">
      Delivering to<br><strong>${order.customer.name}</strong><br>
      ${order.shippingAddress.address}, ${order.shippingAddress.area}, ${order.shippingAddress.district}
      ${order.shippingAddress.postcode ? ` ${order.shippingAddress.postcode}` : ""}<br>
      ${order.customer.phone}
    </p>`;
  return shell(
    `Thank you, ${order.customer.name.split(" ")[0]}`,
    body,
    `Questions? Reply to this email or message us on WhatsApp.<br>${siteName} · Handcrafted in Dhaka, Bangladesh.`
  );
}

export function orderStatusEmail(order: OrderDoc, heading: string, message: string, siteName = "Labonno") {
  const body = `
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.7;color:#4A463E">${message}</p>
    <p style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:#8A8375;margin-top:16px">
      Order <strong style="color:#1C1B18">${order.orderNumber}</strong> · ${formatMoney(order.total)}
    </p>`;
  return shell(heading, body, `${siteName} · Handcrafted in Dhaka, Bangladesh.`);
}
