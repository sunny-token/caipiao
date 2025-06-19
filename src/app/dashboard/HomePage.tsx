"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">
        欢迎来到双色球开奖爬虫
      </h1>
      <p className="mb-6 text-gray-600">
        点击下方按钮进入爬虫页面，获取最新的双色球开奖信息。
      </p>
      <Link href="/lottery-crawler">
        <Button variant="default" className="text-lg px-8 py-4">
          进入爬虫页面
        </Button>
      </Link>
    </section>
  );
}
