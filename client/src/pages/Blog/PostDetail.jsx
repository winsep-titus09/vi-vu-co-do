// src/pages/Blog/PostDetail.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
// Correct icon imports: only some come from IconBox, others from individual files
import {
  IconClock,
  IconShare,
  IconBookmark,
  IconStar,
  IconMapPin,
  IconCalendar,
} from "../../icons/IconBox";
import { IconUser } from "../../icons/IconUser";
import IconArrowRight from "../../icons/IconArrowRight";
import BlogCard from "../../components/Cards/BlogCard";

// Import thêm các icon mạng xã hội nếu có (hoặc dùng tạm text)

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Blog post details
const postData = {
  id: 1,
  title:
    "10 trải nghiệm về đêm 'không ngủ' tại Cố đô Huế: Từ Hoàng cung ra Phố thị",
  category: "Kinh nghiệm du lịch",
  date: "15 Tháng 3, 2025",
  author: "Minh Hương",
  readTime: "6 phút đọc",
  image:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg",
  // Nội dung giả lập HTML
  content: `
    <p class="lead">Huế không chỉ trầm mặc với đền đài lăng tẩm. Khi hoàng hôn buông xuống bên dòng Hương Giang, một Huế rất khác sẽ thức giấc - rực rỡ, sống động và đầy mê hoặc.</p>
    
    <h2>1. Dạo thuyền rồng nghe Ca Huế</h2>
    <p>Không thể nói đã đến Huế nếu chưa từng ngồi thuyền rồng trôi nhẹ trên sông Hương. Trong không gian tĩnh mịch của màn đêm, tiếng đàn tranh, đàn bầu hòa quyện cùng giọng hát ngọt ngào của các nghệ sĩ tạo nên một trải nghiệm thính giác khó quên.</p>
    <blockquote>"Tiếng ca Huế trên sông Hương không chỉ là âm nhạc, đó là hồn cốt của vùng đất Cố đô được gửi gắm qua từng nhịp phách."</blockquote>
    <p>Bạn có thể mua vé tại bến Tòa Khâm. Giá vé dao động từ 100.000đ - 150.000đ/người tùy thời điểm.</p>

    <h2>2. Khám phá Đại Nội về đêm</h2>
    <p>Chương trình "Đại Nội về đêm" mở ra một không gian lung linh huyền ảo. Ngọ Môn rực sáng ánh đèn, lầu Ngũ Phụng soi bóng nước hồ sen. Đây là cơ hội tuyệt vời để bạn chiêm ngưỡng vẻ đẹp kiến trúc cung đình dưới một góc nhìn hoàn toàn mới lạ.</p>
    <img src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg" alt="Đại Nội về đêm" />
    <p class="caption">Đại Nội Huế lung linh dưới ánh đèn nghệ thuật.</p>

    <h2>3. Phố đi bộ Phạm Ngũ Lão - Chu Văn An - Võ Thị Sáu</h2>
    <p>Được mệnh danh là "Khu phố Tây" của Huế, nơi đây tập trung nhiều quán bar, pub, nhà hàng nhộn nhịp. Không khí trẻ trung, sôi động khác hẳn với vẻ yên bình thường thấy của thành phố.</p>
    
    <h2>4. Thưởng thức ẩm thực đêm</h2>
    <p>Đừng quên ghé chợ đêm cầu ngói Thanh Toàn hoặc khu vực chân cầu Tràng Tiền để thưởng thức bánh mì o Tho, bún bò mệ Kéo hay chè hẻm. Hương vị cay nồng đặc trưng của món Huế sẽ làm ấm lòng du khách trong tiết trời se lạnh về đêm.</p>
  `,
  relatedTour: {
    id: 1,
    title: "Tour Đêm Hoàng Cung & Trải nghiệm 3D",
    price: 42,
    rating: 4.9,
    reviews: 122,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
  },
};

const relatedPosts = [
  {
    id: 2,
    title: "Truy tìm quán Bún Bò Huế chuẩn vị người bản địa",
    slug: "quan-bun-bo-hue-chuan-vi",
    date: "12 Th3, 2025",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
    category: "Ẩm thực",
    categoryId: "food",
    author: "Trần Văn",
  },
  {
    id: 5,
    title: "Check-in làng hương Thủy Xuân rực rỡ sắc màu",
    slug: "lang-huong-thuy-xuan",
    date: "05 Th3, 2025",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
    category: "Điểm đến",
    categoryId: "tips",
    author: "Minh Anh",
  },
];

export default function PostDetail() {
  const { slug } = useParams();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Logic tính toán thanh tiến trình đọc
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-main pb-20 pt-0">
      {/* 1. READING PROGRESS BAR (Fixed Top) */}
      <div className="fixed top-0 left-0 h-1 bg-border-light z-50 w-full">
        <div
          className="h-full bg-secondary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* 2. HERO SECTION (Ảnh bìa lớn) */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group">
        <img
          src={postData.image}
          alt={postData.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full pb-12 md:pb-16">
          <div className="container-main">
            <div className="max-w-4xl">
              {/* Breadcrumbs on Image */}
              <div className="text-white/80 mb-4 text-sm font-medium flex items-center gap-2">
                <Link
                  to="/blog"
                  className="hover:text-secondary transition-colors"
                >
                  Cẩm nang
                </Link>
                <span>/</span>
                <span className="text-secondary font-bold uppercase tracking-wider">
                  {postData.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight mb-6 drop-shadow-md">
                {postData.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                    <IconUser className="w-4 h-4" />
                  </div>
                  <span>{postData.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-4 h-4" />
                  <span>{postData.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock className="w-4 h-4" />
                  <span>{postData.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT LAYOUT */}
      <div className="container-main pt-10 md:pt-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT COLUMN: SOCIAL SHARE (Desktop Sticky) --- */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-4 items-center">
              <button
                className="w-10 h-10 rounded-full bg-white border border-border-light text-text-secondary hover:text-primary hover:border-primary flex items-center justify-center transition-all shadow-sm tooltip"
                data-tip="Chia sẻ"
              >
                <IconShare className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white border border-border-light text-text-secondary hover:text-secondary hover:border-secondary flex items-center justify-center transition-all shadow-sm">
                <IconBookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* --- CENTER COLUMN: ARTICLE CONTENT --- */}
          <div className="col-span-1 lg:col-span-7">
            <article
              className="
              prose prose-lg prose-slate max-w-none 
              
              /* Typography Spacing Optimized */
              prose-headings:mt-8 prose-headings:mb-3
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-primary 
              prose-p:my-3 prose-p:text-text-secondary prose-p:leading-relaxed
              
              /* Links & Strong */
              prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-primary prose-strong:font-bold
              
              /* Blockquotes */
              prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-secondary 
              prose-blockquote:bg-secondary/10 prose-blockquote:py-3 prose-blockquote:px-5 
              prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-text-primary
              
              /* Images */
              prose-img:my-6 prose-img:rounded-3xl prose-img:shadow-lg prose-img:w-full
              prose-figcaption:mt-2 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-text-secondary prose-figcaption:italic
              
              /* Lead Paragraph */
              prose-lead:text-xl prose-lead:text-text-primary prose-lead:font-medium prose-lead:mb-6
            "
            >
              <div dangerouslySetInnerHTML={{ __html: postData.content }} />
            </article>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-border-light">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-bold text-text-primary mr-2 py-1">
                  Tags:
                </span>
                {["Huế về đêm", "Ca Huế", "Ẩm thực", "Di sản"].map((tag) => (
                  <Link
                    key={tag}
                    to="#"
                    className="px-4 py-1.5 rounded-full bg-white border border-border-light text-text-secondary text-sm hover:border-primary hover:text-primary transition-colors shadow-sm"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 md:p-8 rounded-3xl bg-white border border-border-light flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left shadow-sm">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-md shrink-0">
                <img
                  src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/guides/guide_female_1.jpg"
                  alt={postData.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Tác giả
                </p>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-2">
                  {postData.author}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Hướng dẫn viên tự do với 5 năm kinh nghiệm tại Huế. Đam mê
                  lịch sử triều Nguyễn và nhiếp ảnh đường phố.
                </p>
                <Link
                  to="/guides/1"
                  className="text-sm font-bold text-primary hover:underline mt-3 inline-flex items-center gap-1"
                >
                  Xem hồ sơ & Tour của tôi{" "}
                  <IconArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* --- NEW SECTION: BÀI VIẾT LIÊN QUAN --- */}
            <div className="mt-16 pt-10 border-t border-border-light">
              <h3 className="text-2xl font-heading font-bold text-text-primary mb-6">
                Có thể bạn quan tâm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((post) => (
                  <BlogCard key={post.id} post={post} layout="vertical" />
                ))}
              </div>
            </div>

            {/* --- NEW SECTION: BÌNH LUẬN --- */}
            <div className="mt-12">
              <h3 className="text-2xl font-heading font-bold text-text-primary mb-6">
                Thảo luận (3)
              </h3>

              {/* Form Bình luận */}
              <div className="bg-white p-6 rounded-3xl border border-border-light mb-8 shadow-sm">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    Bạn
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Bạn nghĩ sao về bài viết này? Hãy để lại bình luận..."
                      className="w-full p-3 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-24 transition-all text-sm"
                    ></textarea>
                    <div className="flex justify-end mt-3">
                      <button className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        Gửi bình luận
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List Bình luận (Demo) */}
              <div className="space-y-6">
                {[
                  {
                    name: "Hoàng Nam",
                    date: "2 giờ trước",
                    content:
                      "Bài viết rất chi tiết! Mình dự định đi Huế tháng sau, chắc chắn sẽ thử trải nghiệm Ca Huế trên sông Hương.",
                    avatar: "H",
                  },
                  {
                    name: "Thu Thảo",
                    date: "1 ngày trước",
                    content:
                      "Cho mình hỏi vé tham quan Đại Nội ban đêm mua ở đâu vậy ạ? Có cần đặt trước không?",
                    avatar: "T",
                  },
                ].map((comment, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-text-secondary font-bold shrink-0">
                      {comment.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-text-primary">
                          {comment.name}
                        </h4>
                        <span className="text-xs text-text-secondary">
                          • {comment.date}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed bg-white p-3 rounded-xl border border-border-light rounded-tl-none inline-block shadow-sm">
                        {comment.content}
                      </p>
                      <div className="flex gap-4 mt-1 ml-1">
                        <button className="text-xs font-medium text-text-secondary hover:text-primary transition-colors">
                          Trả lời
                        </button>
                        <button className="text-xs font-medium text-text-secondary hover:text-primary transition-colors">
                          Thích
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR (Tour Upsell) --- */}
          <div className="col-span-1 lg:col-span-4 lg:pl-8">
            <div className="sticky top-32 space-y-8">
              {/* Widget: Tour Liên Quan (Conversion Focus) */}
              <div className="rounded-3xl border border-border-light bg-white p-5 shadow-xl shadow-primary/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary"></div>

                <p className="text-xs font-bold uppercase text-text-secondary mb-4 tracking-wider">
                  Trải nghiệm đề xuất
                </p>

                <div className="relative h-52 rounded-2xl overflow-hidden mb-4 cursor-pointer">
                  <img
                    src={postData.relatedTour.image}
                    alt={postData.relatedTour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="text-xs font-medium opacity-90">
                      Khởi hành hàng ngày
                    </p>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-bold text-primary shadow-sm">
                    ${postData.relatedTour.price}
                  </div>
                </div>

                <Link to={`/tours/${postData.relatedTour.id}`}>
                  <h4 className="text-xl font-heading font-bold text-text-primary mb-2 group-hover:text-primary transition-colors leading-tight">
                    {postData.relatedTour.title}
                  </h4>
                </Link>

                <div className="flex items-center justify-between text-sm text-text-secondary mb-5">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-text-primary">
                      {postData.relatedTour.rating}
                    </span>
                    <IconStar className="w-4 h-4 text-secondary fill-current" />
                  </div>
                  <span>({postData.relatedTour.reviews} đánh giá)</span>
                </div>

                <Link
                  to={`/tours/${postData.relatedTour.id}`}
                  className="flex items-center justify-center w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                  Đặt ngay hôm nay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
