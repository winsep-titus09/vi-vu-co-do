// server/scripts/seedArticles.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Article from "../models/Article.js";
import ArticleCategory from "../models/ArticleCategory.js";
import User from "../models/User.js";

async function seedArticles() {
  try {
    await connectDB();
    console.log("🌱 Seeding articles...");

    // Get categories and a guide user
    const categories = await ArticleCategory.find().lean();
    if (categories.length === 0) {
      console.log(
        "❌ No categories found. Run seedArticleCategories.js first!"
      );
      process.exit(1);
    }

    // Find guide users
    const guides = await User.find({ role: "guide" }).limit(3).lean();
    if (guides.length === 0) {
      console.log(
        "⚠️ No guide users found. Articles will be created without authors."
      );
    }

    const articles = [
      {
        title: "10 trải nghiệm về đêm 'không ngủ' tại Cố đô Huế",
        slug: "10-trai-nghiem-ve-dem-khong-ngu-tai-co-do-hue",
        summary:
          "Huế không chỉ trầm mặc với đền đài lăng tẩm. Khi hoàng hôn buông xuống, một Huế rất khác sẽ thức giấc.",
        content_html: `
          <p class="lead">Huế không chỉ trầm mặc với đền đài lăng tẩm. Khi hoàng hôn buông xuống bên dòng Hương Giang, một Huế rất khác sẽ thức giấc - rực rỡ, sống động và đầy mê hoặc.</p>
          
          <h2>1. Dạo thuyền rồng nghe Ca Huế</h2>
          <p>Không thể nói đã đến Huế nếu chưa từng ngồi thuyền rồng trôi nhẹ trên sông Hương. Trong không gian tĩnh mịch của màn đêm, tiếng đàn tranh, đàn bầu hòa quyện cùng giọng hát ngọt ngào của các nghệ sĩ tạo nên một trải nghiệm thính giác khó quên.</p>
          <blockquote>"Tiếng ca Huế trên sông Hương không chỉ là âm nhạc, đó là hồn cốt của vùng đất Cố đô được gửi gắm qua từng nhịp phách."</blockquote>
          <p>Bạn có thể mua vé tại bến Tòa Khâm. Giá vé dao động từ 100.000đ - 150.000đ/người tùy thời điểm.</p>

          <h2>2. Khám phá Đại Nội về đêm</h2>
          <p>Chương trình "Đại Nội về đêm" mở ra một không gian lung linh huyền ảo. Ngọ Môn rực sáng ánh đèn, lầu Ngũ Phụng soi bóng nước hồ sen.</p>
          <img src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg" alt="Đại Nội về đêm" />

          <h2>3. Phố đi bộ Phạm Ngũ Lão</h2>
          <p>Được mệnh danh là "Khu phố Tây" của Huế, nơi đây tập trung nhiều quán bar, pub, nhà hàng nhộn nhịp.</p>
        `,
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg",
        categoryId: categories.find((c) => c.slug === "kinh-nghiem-du-lich")
          ?._id,
        authorId: guides[0]?._id || null,
        status: "active",
        approval: { status: "approved" },
        publishedAt: new Date("2025-03-15"),
      },
      {
        title: "Truy tìm quán Bún Bò Huế chuẩn vị người bản địa",
        slug: "truy-tim-quan-bun-bo-hue-chuan-vi",
        summary:
          "Hành trình khám phá những quán bún bò Huế được người dân địa phương yêu thích nhất.",
        content_html: `
          <p class="lead">Bún bò Huế không chỉ là một món ăn, đó là cả một nền văn hóa ẩm thực đậm đà bản sắc xứ Huế.</p>
          
          <h2>Bún bò Đông Ba - Hương vị truyền thống</h2>
          <p>Nằm gần chợ Đông Ba, quán bún bò này đã có tuổi đời hơn 30 năm. Nước lèo được ninh từ xương ống, xương đuôi bò cùng với sả, tỏi, ớt tạo nên hương vị đậm đà khó quên.</p>
          
          <h2>Bún bò Mẹ Kéo - Đặc sản đêm khuya</h2>
          <p>Hoạt động từ 9h tối đến 3h sáng, quán bún bò Mẹ Kéo là điểm đến quen thuộc của giới trẻ Huế sau những buổi tiệc tùng.</p>
          
          <img src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg" alt="Bún bò Huế" />
        `,
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
        categoryId: categories.find((c) => c.slug === "am-thuc-hue")?._id,
        authorId: guides[1]?._id || guides[0]?._id || null,
        status: "active",
        approval: { status: "approved" },
        publishedAt: new Date("2025-03-12"),
      },
      {
        title: "Bí ẩn phong thủy lăng Tự Đức: Khi kiến trúc kể chuyện",
        slug: "bi-an-phong-thuy-lang-tu-duc",
        summary:
          "Lăng Tự Đức không chỉ là nơi an nghỉ của vị vua tài hoa, mà còn ẩn chứa những bí mật phong thủy độc đáo.",
        content_html: `
          <p class="lead">Lăng Tự Đức được xây dựng từ năm 1864 đến 1867, là một trong những công trình kiến trúc lăng tẩm đẹp nhất triều Nguyễn.</p>
          
          <h2>Vị trí phong thủy tuyệt hảo</h2>
          <p>Lăng được xây dựng tại thôn Dương Xuân Thượng, cách trung tâm Huế khoảng 6km về phía tây nam. Nơi đây có núi non bao bọc, sông nước uốn khúc - một địa thế "tụ khí" rất tốt theo quan niệm phong thủy.</p>
          
          <h2>Kiến trúc hài hòa với thiên nhiên</h2>
          <p>Khác với các lăng tẩm khác, lăng Tự Đức được thiết kế như một khu vườn thơ mộng với ao sen, đình, đài, lầu, các. Mỗi công trình đều được bố trí theo nguyên tắc âm dương ngũ hành.</p>
          
          <img src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg" alt="Lăng Tự Đức" />
        `,
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
        categoryId: categories.find((c) => c.slug === "van-hoa-di-san")?._id,
        authorId: guides[2]?._id || guides[0]?._id || null,
        status: "active",
        approval: { status: "approved" },
        publishedAt: new Date("2025-03-10"),
      },
      {
        title: "Check-in làng hương Thủy Xuân rực rỡ sắc màu",
        slug: "check-in-lang-huong-thuy-xuan",
        summary:
          "Khám phá nghề làm hương truyền thống và những góc check-in cực chất tại làng hương Thủy Xuân.",
        content_html: `
          <p class="lead">Làng hương Thủy Xuân cách trung tâm Huế khoảng 7km, là nơi lưu giữ nghề làm hương truyền thống hàng trăm năm tuổi.</p>
          
          <h2>Nghề làm hương truyền thống</h2>
          <p>Đến làng hương vào mùa nắng (từ tháng 3 đến tháng 8), bạn sẽ được chứng kiến cảnh tượng hàng nghìn bó hương đủ màu sắc phơi khắp sân nhà, tạo nên một bức tranh sống động đầy màu sắc.</p>
          
          <h2>Trải nghiệm làm hương</h2>
          <p>Du khách có thể tham gia trải nghiệm làm hương cùng các nghệ nhân. Từ việc nhào bột, cán hương, nhuộm màu đến phơi hương, mỗi công đoạn đều mang đến những khoảnh khắc thú vị.</p>
          
          <img src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg" alt="Làng hương Thủy Xuân" />
        `,
        cover_image:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
        categoryId: categories.find((c) => c.slug === "kinh-nghiem-du-lich")
          ?._id,
        authorId: guides[0]?._id || null,
        status: "active",
        approval: { status: "approved" },
        publishedAt: new Date("2025-03-05"),
      },
    ];

    // Clear existing articles
    await Article.deleteMany({});
    console.log("✅ Cleared existing articles");

    // Insert new articles
    const created = await Article.insertMany(articles);
    console.log(`✅ Created ${created.length} articles:`);
    created.forEach((article) => {
      console.log(`   - ${article.title}`);
    });

    console.log("✅ Articles seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding articles:", error);
    process.exit(1);
  }
}

seedArticles();
