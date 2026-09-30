// Plain CommonJS on purpose: this standalone Vercel function sits outside the
// Next.js static export, and compiling it with the project's TypeScript 6 broke
// it at load time (FUNCTION_INVOCATION_FAILED). No build step, no dependencies.
"use strict";

const SITE_URL = "https://lottery.io.kr";
const OWNER_EMAIL = "rottery0.kr@gmail.com";
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
// Best-effort per-IP limit: state lives per function instance (Fluid Compute reuses instances)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const recentRequests = new Map();
function isRateLimited(ip) {
    const now = Date.now();
    const hits = (recentRequests.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (hits.length >= RATE_LIMIT_MAX) {
        recentRequests.set(ip, hits);
        return true;
    }
    hits.push(now);
    recentRequests.set(ip, hits);
    if (recentRequests.size > 1000) {
        for (const [key, times] of recentRequests) {
            if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS))
                recentRequests.delete(key);
        }
    }
    return false;
}
// Direct Resend REST call (no SDK) keeps this standalone function dependency-free
async function sendEmail(apiKey, payload) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (res.ok)
        return null;
    const detail = await res.text().catch(() => '');
    return `${res.status} ${detail}`.trim();
}
function asTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}
/**
 * @param {import('http').IncomingMessage & { body?: Record<string, unknown> }} req
 * @param {{ status(code: number): { json(body: unknown): unknown } }} res
 */
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !apiKey.startsWith('re_')) {
        return res.status(503).json({ error: "이메일 서비스가 설정되지 않았습니다." });
    }
    const body = req.body || {};
    // Honeypot: hidden field real users never fill — pretend success so bots don't adapt
    if (asTrimmedString(body.website)) {
        return res.status(200).json({ success: true });
    }
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." });
    }
    // Reject non-string fields (e.g. an array email would coerce into multiple recipients)
    const name = asTrimmedString(body.name);
    const email = asTrimmedString(body.email);
    const subject = asTrimmedString(body.subject).replace(/[\r\n]+/g, ' ');
    const message = asTrimmedString(body.message);
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "모든 항목을 입력해주세요." });
    }
    if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email)) {
        return res.status(400).json({ error: "올바른 이메일 주소를 입력해주세요." });
    }
    if (name.length > 100 || email.length > 254 || subject.length > 200 || message.length > 5000) {
        return res.status(400).json({ error: "입력 내용이 너무 깁니다." });
    }
    try {
        const ownerError = await sendEmail(apiKey, {
            from: "로또리 문의 <onboarding@resend.dev>",
            to: OWNER_EMAIL,
            reply_to: email,
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
        if (ownerError) {
            console.error('Contact email to owner failed:', ownerError);
            return res.status(502).json({ error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." });
        }
        // Auto-reply is best-effort: the inquiry already reached the owner
        const replyError = await sendEmail(apiKey, {
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
        if (replyError) {
            console.warn('Contact auto-reply failed:', replyError);
        }
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Contact handler error:', err);
        return res.status(500).json({ error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." });
    }
}

module.exports = handler;
