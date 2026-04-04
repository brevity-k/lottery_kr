import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const SITE_URL = "https://lottery.io.kr";
const OWNER_EMAIL = "rottery0.kr@gmail.com";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.startsWith('re_')) {
    return res.status(503).json({ error: "이메일 서비스가 설정되지 않았습니다." });
  }

  const resend = new Resend(apiKey);
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "모든 항목을 입력해주세요." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "올바른 이메일 주소를 입력해주세요." });
  }

  try {
    await resend.emails.send({
      from: "로또리 문의 <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject: `[로또리 문의] ${subject}`,
      html: `
        <h2>새로운 문의가 접수되었습니다</h2>
        <p><strong>이름:</strong> ${escapeHtml(name)}</p>
        <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
        <p><strong>제목:</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    await resend.emails.send({
      from: "로또리 <onboarding@resend.dev>",
      to: email,
      subject: "[로또리] 문의가 접수되었습니다",
      html: `
        <h2>문의해 주셔서 감사합니다</h2>
        <p>${escapeHtml(name)}님, 안녕하세요.</p>
        <p>로또리에 보내주신 문의가 정상적으로 접수되었습니다.</p>
        <p>내용을 확인한 후 빠른 시일 내에 답변 드리겠습니다. (보통 1~3일 소요)</p>
        <hr />
        <p><strong>접수된 문의 내용:</strong></p>
        <p><strong>제목:</strong> ${escapeHtml(subject)}</p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        <hr />
        <p style="color: #999; font-size: 12px;">
          이 메일은 자동으로 발송된 메일입니다. 추가 문의사항이 있으시면 이 메일에 회신하지 마시고
          <a href="${SITE_URL}/contact">로또리 문의 페이지</a>를 이용해주세요.
        </p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." });
  }
}
