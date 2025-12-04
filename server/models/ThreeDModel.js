import mongoose from "mongoose";

const ThreeDModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    file_url: { type: String, required: true },
    file_type: {
      type: String,
      enum: ["glb", "gltf", "panorama"],
      required: true,
    },
    thumbnail_url: { type: String },
    hotspots: [{ x: Number, y: Number, z: Number, label: String }],
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  },
  { timestamps: true }
);

export default mongoose.model("ThreeDModel", ThreeDModelSchema, "three_d_models");
