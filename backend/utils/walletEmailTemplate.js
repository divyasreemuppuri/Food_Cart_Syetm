// utils/walletEmailTemplate.js
export function walletEmailTemplate({ name, amount, operation, newBalance, reason }) {
  const action = operation === "add" ? "credited" : "debited";
  const subject = `Your wallet has been ${action}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color:#222; line-height:1.5;">
      <h2 style="color:${operation === "add" ? "#1e7e34" : "#c82333"};">
        Wallet ${action.toUpperCase()}
      </h2>
      <p>Hi ${name || "User"},</p>
      <p>Your wallet has been <strong>${action}</strong> by <strong>₹${parseFloat(amount).toFixed(2)}</strong>.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p><strong>New Balance:</strong> ₹${parseFloat(newBalance).toFixed(2)}</p>
      <hr/>
      <p style="font-size:0.9em; color:#666;">If you did not expect this change, contact support immediately.</p>
      <p>— FoodCard Admin</p>
    </div>
  `;
  const text = `Hi ${name || "User"},\nYour wallet has been ${action} by ₹${parseFloat(amount).toFixed(2)}.\nNew balance: ₹${parseFloat(newBalance).toFixed(2)}${reason ? `\nReason: ${reason}` : ""}\n\n— FoodCard Admin`;
  return { subject, html, text };
}
