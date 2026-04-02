/**
 * 로또 6/45 데이터를 Google Sheets로 내보내기 (mise의 gsheet-upload 사용)
 *
 * 사용법:
 *   npx tsx scripts/export-to-sheets.ts                    # 전체 회차 업로드
 *   npx tsx scripts/export-to-sheets.ts --tsv              # TSV만 stdout 출력
 *   npx tsx scripts/export-to-sheets.ts --share user@x.com # 시트 공유
 *   npx tsx scripts/export-to-sheets.ts --last 100         # 최근 100회차만
 *
 * 필요: mise의 gsheet-upload 도구 (PATH 또는 GSHEET_UPLOAD 환경변수)
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";
import type { LottoResult } from "../src/types/lottery";

const DATA_PATH = path.join(process.cwd(), "src/data/lotto.json");

interface LottoData {
  lottery: string;
  lastUpdated: string;
  latestRound: number;
  draws: LottoResult[];
}

function loadData(): LottoData {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만원`;
  }
  return `${amount}원`;
}

function drawToRow(draw: LottoResult): string[] {
  const numbers = [
    draw.drwtNo1,
    draw.drwtNo2,
    draw.drwtNo3,
    draw.drwtNo4,
    draw.drwtNo5,
    draw.drwtNo6,
  ];

  return [
    draw.drwNo.toString(),
    draw.drwNoDate,
    numbers.join(", "),
    draw.bnusNo.toString(),
    draw.firstWinamnt.toString(),
    formatAmount(draw.firstWinamnt),
    draw.firstPrzwnerCo.toString(),
    draw.totSellamnt.toString(),
    formatAmount(draw.totSellamnt),
  ];
}

function buildTsv(draws: LottoResult[], lastN?: number): string {
  const headers = [
    "회차",
    "추첨일",
    "당첨번호",
    "보너스",
    "1등 당첨금(원)",
    "1등 당첨금",
    "1등 당첨자 수",
    "총 판매금액(원)",
    "총 판매금액",
  ];

  let data = draws;
  if (lastN && lastN > 0) {
    data = draws.slice(0, lastN);
  }

  const rows: string[][] = [headers];
  for (const draw of data) {
    rows.push(drawToRow(draw));
  }

  return rows.map((row) => row.join("\t")).join("\n");
}

function findGsheetUpload(): string {
  if (process.env.GSHEET_UPLOAD) return process.env.GSHEET_UPLOAD;

  const candidates = [
    path.join(os.homedir(), "project/brevity1swos/mise/py/gsheet-upload"),
    path.join(os.homedir(), "mise/py/gsheet-upload"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error(
    "gsheet-upload not found. Set GSHEET_UPLOAD env var or add mise/py to PATH."
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const tsvOnly = args.includes("--tsv");
  const lastIndex = args.indexOf("--last");
  const lastN = lastIndex !== -1 ? parseInt(args[lastIndex + 1], 10) : undefined;
  const shareIndex = args.indexOf("--share");
  const shareEmail = shareIndex !== -1 ? args[shareIndex + 1] : undefined;

  const data = loadData();
  console.error(`로또 6/45: ${data.draws.length} 회차 (최신: ${data.latestRound}회)`);

  const tsv = buildTsv(data.draws, lastN);
  const totalRows = tsv.split("\n").length - 1;

  if (tsvOnly) {
    process.stdout.write(tsv);
    return;
  }

  // Write TSV to temp file for safe subprocess invocation
  const tmpFile = path.join(os.tmpdir(), `rottery-kr-export-${Date.now()}.tsv`);
  fs.writeFileSync(tmpFile, tsv);

  try {
    const uploadTool = findGsheetUpload();
    const today = new Date().toISOString().split("T")[0];
    const title = lastN
      ? `로또 6/45 최근 ${lastN}회 (${today})`
      : `로또 6/45 전체 ${data.draws.length}회 (${today})`;

    console.error(`${totalRows}행 Google Sheets 업로드 중...`);

    const uploadArgs = [uploadTool, tmpFile, "--title", title, "--sheet-name", "로또 6/45"];
    if (shareEmail) {
      uploadArgs.push("--share", shareEmail);
    }

    const result = execFileSync("python3", uploadArgs, {
      encoding: "utf-8",
      maxBuffer: 50 * 1024 * 1024,
    });

    const url = result.trim();
    console.log(`✅ 시트 생성: ${url}`);
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

main().catch((err) => {
  console.error("❌ 실패:", err);
  process.exit(1);
});
