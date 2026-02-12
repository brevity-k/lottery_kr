"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { LottoResult } from "@/types/lottery";
import LottoResultCard from "@/components/lottery/LottoResultCard";
import AdBanner from "@/components/ads/AdBanner";

const PER_PAGE = 20;

interface ResultsClientProps {
  results: LottoResult[];
}

export default function ResultsClient({ results }: ResultsClientProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return results;
    const query = search.trim();
    const num = parseInt(query, 10);
    if (!isNaN(num)) {
      return results.filter((r) => r.drwNo === num);
    }
    return results;
  }, [results, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="회차 번호로 검색 (예: 1210)"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Info */}
      <p className="text-sm text-gray-500 mb-4">
        총 {filtered.length}개 결과 중 {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)}
      </p>

      {/* Results */}
      <div className="space-y-4">
        {paged.map((result, idx) => (
          <div key={result.drwNo}>
            <Link href={`/lotto/results/${result.drwNo}`}>
              <LottoResultCard result={result} showDetails />
            </Link>
            {idx === 4 && (
              <AdBanner slot="results-mid" format="horizontal" className="mt-4" />
            )}
          </div>
        ))}
      </div>

      {paged.length === 0 && (
        <p className="text-center text-gray-400 py-12">
          검색 결과가 없습니다.
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← 이전
          </button>
          <span className="text-sm text-gray-600 px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}
