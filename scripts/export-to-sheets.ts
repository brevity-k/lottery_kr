/**
 * 로또 6/45 데이터를 Google Sheets로 내보내기 (mise의 gsheet-upload 사용)
 *
 * 사용법:
 *   npx tsx scripts/export-to-sheets.ts                    # 전체 회차 업로드
 *   npx tsx scripts/export-to-sheets.ts --tsv              # TSV만 stdout 출력
 *   npx tsx scripts/export-to-sheets.ts --share user@x.com # 시트 공유
 *   npx tsx scripts/export-to-sheets.ts --last 100         # 최근 100회차만
 *
 * 필요: GSHEET_UPLOAD 환경변수로 gsheet-upload 경로 지정
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFileSync } from "child_process";
import type { LottoResult } from "../src/types/lottery";
import { loadLottoData, getDrawNumbers, formatKoreanAmount } from "./lib/shared";

function drawToRow(draw: LottoResult): string[] {
  const numbers = getDrawNumbers(draw);

  return [
    draw.drwNo.toString(),
    draw.drwNoDate,
    numbers.join(", "),
    draw.bnusNo.toString(),
    draw.firstWinamnt.toString(),
    formatKoreanAmount(draw.firstWinamnt),
    draw.firstPrzwnerCo.toString(),
    draw.totSellamnt.toString(),
    formatKoreanAmount(draw.totSellamnt),
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

  const data = lastN && lastN > 0 ? draws.slice(0, lastN) : draws;

  const rows: string[][] = [headers];
  for (const draw of data) {
    rows.push(drawToRow(draw));
  }

  return rows.map((row) => row.join("\t")).join("\n");
}

function findGsheetUpload(): string {
  if (process.env.GSHEET_UPLOAD) return process.env.GSHEET_UPLOAD;

  throw new Error(
    "gsheet-upload not found. Set GSHEET_UPLOAD env var to the path of the upload tool."
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const tsvOnly = args.includes("--tsv");
  const lastIndex = args.indexOf("--last");
  const lastN = lastIndex !== -1 ? parseInt(args[lastIndex + 1], 10) : undefined;
  const shareIndex = args.indexOf("--share");
  const shareEmail = shareIndex !== -1 ? args[shareIndex + 1] : undefined;

  const data = loadLottoData();
  console.error(`로또 6/45: ${data.draws.length} 회차 (최신: ${data.latestRound}회)`);

  const tsv = buildTsv(data.draws, lastN);

  if (tsvOnly) {
    process.stdout.write(tsv);
    return;
  }

  const tmpFile = path.join(os.tmpdir(), `rottery-kr-export-${Date.now()}.tsv`);
  fs.writeFileSync(tmpFile, tsv);

  try {
    const uploadTool = findGsheetUpload();
    const today = new Date().toISOString().split("T")[0];
    const title = lastN
      ? `로또 6/45 최근 ${lastN}회 (${today})`
      : `로또 6/45 전체 ${data.draws.length}회 (${today})`;

    const totalRows = data.draws.length;
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
