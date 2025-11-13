#!/bin/bash

echo "🚀 安装 PDF 导出依赖..."
echo ""

# 基础依赖（html2pdf 已内置在项目中）
echo "📦 安装客户端依赖..."
pnpm add html2canvas jspdf

echo ""
echo "📦 安装 pdfmake（可选）..."
pnpm add pdfmake

echo ""
echo "📦 安装 Playwright（可选，服务端导出）..."
pnpm add -D playwright

echo ""
echo "🌐 安装 Playwright 浏览器..."
pnpx playwright install chromium

echo ""
echo "✅ 安装完成！"
echo ""
echo "💡 使用说明："
echo "   1. 访问 /pdf-export 页面"
echo "   2. 输入要导出的页面 URL"
echo "   3. 选择导出方式（推荐 html2pdf 或 playwright）"
echo "   4. 点击'导出 PDF'按钮"
echo ""
echo "📚 详细文档："
echo "   docs/PDF_EXPORT_GUIDE.md"
echo ""
