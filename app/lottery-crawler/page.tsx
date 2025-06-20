"use client";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { formatDate } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";
import { trpc } from "../../server/client";

export default function LotteryCrawlerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const pageSize = 10;

  // trpc hooks
  const {
    data,
    isLoading: listLoading,
    refetch,
  } = trpc.ssq.getList.useQuery({ page: currentPage, pageSize });
  const mutation = trpc.ssq.fetchAndSave.useMutation();

  useEffect(() => {
    if (data?.data?.total) {
      setTotalPages(Math.ceil(data.data.total / pageSize));
    }
  }, [data, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStart = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await mutation.mutateAsync({ year: selectedYear });
      if (res.success) {
        setResult(`爬取并写入成功，新增 ${res.count} 条数据。`);
        refetch();
      } else {
        setResult("失败");
      }
    } catch (e) {
      setResult(`请求异常: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <Button
        variant="outline"
        className="mb-4 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 hover:scale-105 border-0"
        onClick={() => router.push("/lottery-dlt-crawler")}
      >
        去大乐透爬虫
      </Button>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>双色球开奖爬虫</h1>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: "8px 12px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #e2e8f0",
            outline: "none",
          }}
        >
          <option value="all">所有年份</option>
          {Array.from(
            { length: new Date().getFullYear() - 1999 },
            (_, i) => new Date().getFullYear() - i,
          ).map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>
        <button
          onClick={handleStart}
          disabled={loading}
          style={{
            padding: "8px 24px",
            fontSize: 18,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "正在爬取..." : "启动爬虫"}
        </button>
      </div>
      {result && <div style={{ marginTop: 24, fontSize: 16 }}>{result}</div>}

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>开奖历史</h2>
        {listLoading ? (
          <div>加载中...</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>期号</TableHead>
                    <TableHead>开奖日期</TableHead>
                    <TableHead>开奖号码</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.list.map((item) => (
                    <TableRow key={item.issueNumber}>
                      <TableCell>{item.issueNumber}</TableCell>
                      <TableCell>{formatDate(item.openDate)}</TableCell>
                      <TableCell>
                        {item.openNumbers?.red?.map(
                          (num: string, idx: number) => (
                            <span
                              key={num + idx}
                              style={{
                                display: "inline-block",
                                width: 28,
                                height: 28,
                                lineHeight: "28px",
                                borderRadius: "50%",
                                background: "#e53e3e",
                                color: "#fff",
                                textAlign: "center",
                                marginRight: 4,
                                fontWeight: 600,
                              }}
                            >
                              {num}
                            </span>
                          ),
                        )}
                        {item.openNumbers?.blue && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 28,
                              height: 28,
                              lineHeight: "28px",
                              borderRadius: "50%",
                              background: "#2563eb",
                              color: "#fff",
                              textAlign: "center",
                              marginLeft: 8,
                              fontWeight: 600,
                            }}
                          >
                            {item.openNumbers.blue}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      size="default"
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      style={{
                        cursor: currentPage > 1 ? "pointer" : "not-allowed",
                        opacity: currentPage > 1 ? 1 : 0.5,
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      size="default"
                      onClick={() => handlePageChange(1)}
                      isActive={currentPage === 1}
                      style={{ cursor: "pointer" }}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationLink size="default">...</PaginationLink>
                    </PaginationItem>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page !== 1 &&
                        page !== totalPages &&
                        page >= currentPage - 1 &&
                        page <= currentPage + 1,
                    )
                    .map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          size="default"
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          style={{ cursor: "pointer" }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <PaginationLink size="default">...</PaginationLink>
                    </PaginationItem>
                  )}
                  {totalPages > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        size="default"
                        onClick={() => handlePageChange(totalPages)}
                        isActive={currentPage === totalPages}
                        style={{ cursor: "pointer" }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      size="default"
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      style={{
                        cursor:
                          currentPage < totalPages ? "pointer" : "not-allowed",
                        opacity: currentPage < totalPages ? 1 : 0.5,
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
