// scripts/seedGuideArticles.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Article from "../models/Article.js";
import ArticleCategory from "../models/ArticleCategory.js";

dotenv.config();

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function seedGuideArticles() {
  try {
    await connectDB();

    // Get guide role
    const guideRole = await Role.findOne({ name: "guide" }).lean();
    if (!guideRole) {
      console.log("⚠️ Guide role not found.");
      process.exit(0);
    }

    // Get test guide (guide@example.com)
    const testGuide = await User.findOne({ email: "guide@example.com" }).lean();
    if (!testGuide) {
      console.log("⚠️ Test guide (guide@example.com) not found.");
      process.exit(0);
    }

    console.log(`📋 Found guide: ${testGuide.name} (${testGuide.email})`);

    // Get or create categories
    const categoryNames = [
      "Ẩm thực",
      "Kinh nghiệm",
      "Văn hóa",
      "Địa điểm",
      "Mẹo du lịch",
    ];
    const categories = [];

    for (const name of categoryNames) {
      let cat = await ArticleCategory.findOne({ name }).lean();
      if (!cat) {
        cat = await ArticleCategory.create({ name, slug: slugify(name) });
        console.log(`  ✅ Created category: ${name}`);
      }
      categories.push(cat);
    }

    // Sample articles data
    const articlesData = [
      {
        title: "5 quán bún bò Huế 'núp hẻm' chỉ thổ địa mới biết",
        category: "Ẩm thực",
        status: "approved",
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
        content_html: `<p>Huế không chỉ nổi tiếng với Đại Nội, lăng tẩm mà còn là thiên đường ẩm thực với món bún bò đặc trưng.</p>
<h2>1. Bún bò Bà Phượng</h2>
<p>Nằm sâu trong con hẻm nhỏ đường Nguyễn Du, quán bún bò này đã tồn tại hơn 30 năm...</p>
<h2>2. Bún bò Huế O Phụng</h2>
<p>Với nước dùng đậm đà, thịt bò mềm ngọt, quán này luôn đông khách vào buổi sáng...</p>`,
        views: 1240,
      },
      {
        title:
          "Hướng dẫn tham quan Đại Nội Huế: Lộ trình 4 tiếng không mỏi chân",
        category: "Kinh nghiệm",
        status: "pending",
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
        content_html: `<p>Đại Nội Huế rộng hơn 500 hecta, nếu không có lộ trình hợp lý, bạn sẽ rất mệt.</p>
<h2>Lộ trình đề xuất</h2>
<p>Bắt đầu từ Ngọ Môn → Điện Thái Hòa → Tử Cấm Thành → Duyệt Thị Đường...</p>`,
        views: 0,
      },
      {
        title: "Những điều cấm kỵ khi vào Lăng tẩm",
        category: "Văn hóa",
        status: "draft",
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
        content_html: `<p>Khi tham quan các lăng tẩm vua chúa triều Nguyễn, du khách cần lưu ý một số điều...</p>`,
        views: 0,
      },
      {
        title: "Top 10 địa điểm check-in đẹp nhất Huế 2025",
        category: "Địa điểm",
        status: "approved",
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_1.jpg",
        content_html: `<p>Huế có rất nhiều góc check-in đẹp mà không phải ai cũng biết.</p>
<h2>1. Cầu Trường Tiền về đêm</h2>
<p>Ánh đèn lung linh phản chiếu trên sông Hương tạo nên khung cảnh lãng mạn...</p>`,
        views: 856,
      },
      {
        title: "Mẹo tiết kiệm chi phí khi du lịch Huế",
        category: "Mẹo du lịch",
        status: "approved",
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_2.jpg",
        content_html: `<p>Du lịch Huế không hề tốn kém nếu bạn biết cách.</p>
<h2>1. Đặt vé combo</h2>
<p>Vé tham quan trọn gói các điểm di tích sẽ rẻ hơn mua lẻ từng nơi...</p>`,
        views: 432,
      },
      {
        title: "Lễ hội Festival Huế 2025: Những điều cần biết",
        category: "Văn hóa",
        status: "inactive", // rejected = inactive with approval.status = rejected
        approvalStatus: "rejected",
        cover_image: null,
        content_html: `<p>Festival Huế 2025 dự kiến diễn ra vào tháng 4...</p>`,
        views: 0,
      },
    ];

    // Create articles
    let created = 0;
    for (const data of articlesData) {
      const category = categories.find((c) => c.name === data.category);

      // Check if already exists
      const exists = await Article.findOne({
        title: data.title,
        authorId: testGuide._id,
      }).lean();

      if (exists) {
        console.log(`  ⏭️ Skipped (exists): ${data.title}`);
        continue;
      }

      // Map status for Article model (draft, pending, active, inactive)
      let articleStatus = data.status;
      if (data.status === "approved") articleStatus = "active";

      // Determine approval status
      let approvalStatus = data.approvalStatus || data.status;
      if (data.status === "approved" || articleStatus === "active")
        approvalStatus = "approved";

      const article = await Article.create({
        title: data.title,
        slug: slugify(data.title) + "-" + Date.now(),
        content_html: data.content_html,
        excerpt: data.content_html.replace(/<[^>]*>/g, "").substring(0, 200),
        cover_image: data.cover_image,
        categoryId: category?._id,
        authorId: testGuide._id,
        createdBy: testGuide._id,
        status: articleStatus,
        approval: {
          status: approvalStatus,
          reviewed_at: approvalStatus !== "pending" ? new Date() : null,
        },
        views: data.views,
        publishedAt: articleStatus === "active" ? new Date() : null,
      });

      created++;
      console.log(`  ✅ Created: ${data.title} (${data.status})`);
    }

    console.log(
      `\n✅ Done! Created ${created} articles for guide ${testGuide.name}.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedGuideArticles();
