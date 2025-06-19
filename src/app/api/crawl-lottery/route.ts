import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import * as cheerio from "cheerio";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // 请求目标接口，获取 HTML
    const res = await fetch("https://www.17500.cn/api/kaijiang/getlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "lotid=ssq&limit=&year=2024",
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
      // 判断是否有空格分隔
      let numbers: string[];
      let red: string[];
      let blue: string;
      numbers = openNumbersRaw.split(/\s+/);
      const tmpRed = numbers[0];
      red = tmpRed.match(/.{2}/g) || [];
      blue = numbers[1];

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
    // 批量写入数据库
    const created = await prisma.lotteryResult.createMany({
      data: results,
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // 获取总数
    const total = await prisma.lotteryResult.count();

    // 获取分页数据
    const results = await prisma.lotteryResult.findMany({
      skip,
      take: pageSize,
      orderBy: {
        issueNumber: "desc",
      },
    });

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
