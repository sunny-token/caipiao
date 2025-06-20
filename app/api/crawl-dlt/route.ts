import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import prismaService from "../../../lib/prismaService";

type DLTResult = {
  issueNumber: string;
  openDate: string;
  openNumbers: string;
  ballOrder: string;
  totalBet: string;
  jackpot: string;
  detail: string;
};

export async function POST(req: NextRequest) {
  try {
    const { year = "all" } = await req.json();
    let currentYear = new Date().getFullYear();
    const results: DLTResult[] = [];

    if (year !== "all") {
      const data = await fetchYearData(parseInt(year));
      results.push(...data);
    } else {
      let hasData = true;
      while (hasData && currentYear >= 2007) {
        // 大乐透从2007年开始
        const yearData = await fetchYearData(currentYear);
        const firstData = yearData[0];
        const firstDataYear = firstData.openDate.split("-")[0];

        if (firstDataYear !== currentYear.toString()) {
          // 没有数据
          console.log("没有数据", currentYear, ",", firstDataYear);
          hasData = false;
        } else {
          console.log("有数据", currentYear, ",", firstDataYear);
          results.push(...yearData);
        }
        currentYear--;
      }
    }

    // 批量写入数据库
    const created = await prismaService.getPrismaClient().dLTResult.createMany({
      data: results.map((item) => ({
        issueNumber: item.issueNumber,
        openDate: new Date(item.openDate),
        openNumbers: item.openNumbers,
        ballOrder: item.ballOrder,
        totalBet: item.totalBet,
        jackpot: item.jackpot,
        detail: item.detail,
      })),
      skipDuplicates: true,
    });
    return NextResponse.json({ success: true, count: created.count });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}

// 抽取获取年份数据的函数
async function fetchYearData(year: number) {
  const res = await fetch("https://www.17500.cn/api/kaijiang/getlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `lotid=dlt&limit=&year=${year}`,
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // 解析表格
  const rows = $("table tr").toArray();
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    // 跳过表头
    const tds = $(rows[i]).find("td");
    if (tds.length < 7) continue;
    const issueNumber = $(tds[0]).text().trim();
    const openDate = $(tds[1]).text().trim();
    const openNumbersRaw = $(tds[2]).text().trim();

    // 大乐透格式：前区+后区
    // 例：01 02 03 04 05+06 07
    const numbers = openNumbersRaw.split(/\s+/);
    const tmpRed = numbers[0] ?? "";
    const red = tmpRed.match(/.{2}/g) || [];
    const tmpBlue = numbers[1] ?? "";
    const blue = tmpBlue.match(/.{2}/g) || [];
    const openNumbers = JSON.stringify({ red, blue });

    const ballOrder = $(tds[3]).text().trim();
    const totalBet = $(tds[4]).text().trim();
    const jackpot = $(tds[5]).text().trim();
    const detail = $(tds[6]).text().trim();
    results.push({
      issueNumber,
      openDate,
      openNumbers,
      ballOrder,
      totalBet,
      jackpot,
      detail,
    });
  }
  return results;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    const [total, results] = await Promise.all([
      prismaService.getPrismaClient().dLTResult.count(),
      prismaService.getPrismaClient().dLTResult.findMany({
        skip,
        take: pageSize,
        orderBy: { issueNumber: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        page,
        pageSize,
        list: results,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
