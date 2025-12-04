// src/pages/Home/Heritage3DSection.jsx

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import Spinner from "../../components/Loaders/Spinner";
import { useModels3D } from "../../features/places/hooks";
import Icon360 from "../../icons/Icon360.jsx";
import IconMouse from "../../icons/IconMouse.jsx";
import { IconX } from "../../icons/IconX";
import { IconLoader } from "../../icons/IconCommon";

// Photo Sphere Viewer Component
function PanoramaViewer({ imageUrl, isActive }) {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!viewerRef.current || !imageUrl || !isActive) return;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { Viewer } = await import("@photo-sphere-viewer/core");
        await import("@photo-sphere-viewer/core/index.css");

        if (viewerInstance.current) {
          viewerInstance.current.destroy();
        }

        viewerInstance.current = new Viewer({
          container: viewerRef.current,
          panorama: imageUrl,
          navbar: false,
          defaultZoomLvl: 50,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          loadingTxt: "",
          minFov: 30,
          maxFov: 90,
        });

        viewerInstance.current.addEventListener("ready", () => {
          setIsLoading(false);
        });

        viewerInstance.current.addEventListener("error", () => {
          setError("Không thể tải ảnh panorama");
          setIsLoading(false);
        });

      } catch (err) {
        console.error("Failed to init viewer:", err);
        setError("Không thể khởi tạo trình xem 360°");
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [imageUrl, isActive]);

  return (
    <div className="relative w-full h-full">
      <div ref={viewerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <IconLoader className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <p className="text-white/70 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

// Fullscreen Modal
function FullscreenPanoramaModal({ model, onClose }) {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!viewerRef.current || !model?.file_url) return;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        const { Viewer } = await import("@photo-sphere-viewer/core");
        await import("@photo-sphere-viewer/core/index.css");

        viewerInstance.current = new Viewer({
          container: viewerRef.current,
          panorama: model.file_url,
          navbar: ["zoom", "fullscreen"],
          defaultZoomLvl: 50,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          loadingTxt: "Đang tải ảnh 360°...",
        });

        viewerInstance.current.addEventListener("ready", () => {
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Failed to init fullscreen viewer:", err);
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [model?.file_url]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-100 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-linear-to-b from-black/80 to-transparent p-4">
        <div className="flex items-start justify-between">
          <div className="text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon360 className="w-5 h-5" />
              {model?.name || "Panorama 360°"}
            </h3>
            {model?.description && (
              <p className="text-sm text-white/70 mt-1 max-w-lg">{model.description}</p>
            )}
            {model?.locationId?.name && (
              <p className="text-xs text-white/50 mt-1">{model.locationId.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div ref={viewerRef} className="flex-1 w-full" />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="text-center text-white">
            <IconLoader className="w-10 h-10 animate-spin mx-auto mb-2" />
            <p className="text-sm">Đang tải ảnh 360°...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <p className="text-white/50 text-xs text-center bg-black/50 px-4 py-2 rounded-full">
          Kéo để xoay 360° • Cuộn để zoom • ESC để đóng
        </p>
      </div>
    </div>
  );
}

export default function Heritage3DSection() {
  const { models, isLoading } = useModels3D({ limit: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isViewerActive, setIsViewerActive] = useState(false);

  const featuredModel = useMemo(() => {
    if (!models || models.length === 0) return null;
    const model = models[0];
    return {
      ...model,
      name: model.name,
      description: model.description,
      thumbnail: model.thumbnail_url || model.file_url,
      file_url: model.file_url,
      file_type: model.file_type,
      locationName: model.locationId?.name || "Di sản",
      locationSlug: model.locationId?.slug || model.locationId?._id,
      locationImage: model.locationId?.images?.[0] || model.thumbnail_url,
    };
  }, [models]);

  const isPanorama = featuredModel?.file_type === "panorama";

  // Activate viewer when section is visible
  useEffect(() => {
    if (!isPanorama) return;
    
    const timer = setTimeout(() => {
      setIsViewerActive(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isPanorama]);

  const handleOpenFullscreen = useCallback(() => {
    if (isPanorama) {
      setIsFullscreen(true);
    }
  }, [isPanorama]);

  return (
    <section className="relative py-24 overflow-hidden bg-text-primary">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src={
            featuredModel?.locationImage ||
            "/images/placeholders/3d-model-placeholder.jpg"
          }
          alt={featuredModel?.locationName || "Di sản 3D"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-text-primary via-text-primary/80 to-transparent"></div>
      </div>

      <div className="container-main relative z-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column: Content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
                <Icon360 className="w-4 h-4" />
                <span>Trải nghiệm 360°</span>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <h2 className="text-3xl lg:text-5xl xl:text-6xl font-heading font-bold text-white leading-tight">
                  Khám phá di sản
                </h2>
                <h2 className="text-3xl lg:text-5xl xl:text-6xl font-heading font-bold leading-tight">
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary via-[#f3e5ab] to-secondary">
                    trong không gian ảo
                  </span>
                </h2>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-base lg:text-lg max-w-lg leading-relaxed">
                {featuredModel?.description ||
                  "Trải nghiệm không gian 360° sống động. Xoay, phóng to và khám phá từng góc của các di tích lịch sử ngay trên màn hình."}
              </p>

              {/* Location info if available */}
              {featuredModel?.locationName && featuredModel.locationName !== "Di sản" && (
                <div className="flex items-center gap-3 text-white/60">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon360 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Đang xem</p>
                    <p className="text-sm font-bold text-white">{featuredModel.name || featuredModel.locationName}</p>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <ButtonSvgMask href="/tours" className="inline-flex">
                  Khám phá tour
                </ButtonSvgMask>

                <button 
                  onClick={handleOpenFullscreen}
                  className="group flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <Icon360 className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Xem toàn màn hình</span>
                </button>
              </div>

              {/* Instruction hint */}
              <div className="flex items-center gap-3 text-gray-500 text-sm pt-2">
                <IconMouse className="w-5 h-5 animate-bounce" />
                <span>Kéo chuột để xoay • Cuộn để phóng to</span>
              </div>
            </div>

            {/* Right Column: Interactive 3D/Panorama Viewer */}
            <div 
              className="relative w-full aspect-square lg:aspect-4/3 rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black group cursor-pointer"
              onClick={handleOpenFullscreen}
            >
              {isPanorama && featuredModel?.file_url ? (
                // Photo Sphere Viewer for Panorama
                <PanoramaViewer 
                  imageUrl={featuredModel.file_url} 
                  isActive={isViewerActive}
                />
              ) : (
                // Static image fallback
                <img
                  src={
                    featuredModel?.thumbnail ||
                    "/images/placeholders/3d-model-preview.png"
                  }
                  alt={featuredModel?.name || "3D Model Preview"}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                />
              )}

              {/* Top left badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-white text-xs font-medium">Live 360°</span>
                </div>
              </div>

              {/* Bottom controls bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center">
                      <Icon360 className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold line-clamp-1">
                        {featuredModel?.name || "Panorama 360°"}
                      </p>
                      <p className="text-white/50 text-xs">
                        {featuredModel?.locationName || "Di sản Huế"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs">
                      <IconMouse className="w-3.5 h-3.5" />
                      <span>Kéo để xoay</span>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-secondary transition-colors">
                      Mở rộng
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Icon360 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && featuredModel && (
        <FullscreenPanoramaModal 
          model={featuredModel} 
          onClose={() => setIsFullscreen(false)} 
        />
      )}
    </section>
  );
}
