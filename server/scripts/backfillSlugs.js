import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Article from "../models/Article.js";
import Tour from "../models/Tour.js";
import TourCategory from "../models/TourCategory.js";
import ArticleCategory from "../models/ArticleCategory.js";
import { ensureUniqueSlug } from "../utils/slug.js";

async function updateSlugs(label, Model, baseFn) {
    const docs = await Model.find({}).lean();
    let updated = 0;

    for (const doc of docs) {
        const base = baseFn(doc);
        const nextSlug = await ensureUniqueSlug(
            Model,
            base || `${label}-${doc._id}`,
            doc._id
        );

        if (doc.slug !== nextSlug) {
            await Model.updateOne({ _id: doc._id }, { slug: nextSlug });
            updated += 1;
        }
    }

    console.log(`✔ ${label}: checked ${docs.length}, updated ${updated}`);
}

async function main() {
    await connectDB();

    await updateSlugs("articles", Article, (doc) => doc.slug || doc.title);
    await updateSlugs("tours", Tour, (doc) => doc.slug || doc.name);
    await updateSlugs(
        "tour-categories",
        TourCategory,
        (doc) => doc.slug || doc.name
    );
    await updateSlugs(
        "article-categories",
        ArticleCategory,
        (doc) => doc.slug || doc.name
    );

    await mongoose.connection.close();
    console.log("Done.");
}

main().catch((err) => {
    console.error("❌ Backfill failed:", err);
    mongoose.connection.close();
    process.exit(1);
});
