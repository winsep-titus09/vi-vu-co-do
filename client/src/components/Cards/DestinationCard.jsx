import React from "react";
import { Link } from "react-router-dom";
import { IconMapPin } from "../../icons/IconBox";
import IconArrowRight from "../../icons/IconArrowRight";

export default function DestinationCard({ place }) {
  const { id, name, category, image, address, description } = place;

  return (
    <Link
      to={`/places/${id}`}
      className="group relative block h-80 w-full overflow-hidden rounded-3xl cursor-pointer"
    >
      {/* Image Background */}
      <img
        src={image}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90"></div>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        {/* Category Badge */}
        <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-3 py-1 rounded-full bg-secondary/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-black shadow-sm">
            {category}
          </span>
        </div>

        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl font-heading font-bold mb-1 leading-tight">
            {name}
          </h3>

          <div className="flex items-start gap-1.5 text-white/80 text-sm mb-3">
            <IconMapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>

          <p className="text-sm text-white/70 line-clamp-2 mb-4 opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-500">
            {description}
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary border-b border-secondary/30 pb-0.5 hover:text-white hover:border-white transition-colors">
            Khám phá ngay <IconArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
