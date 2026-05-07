import type { Settings } from "react-slick";
import { NextArrow, PrevArrow } from "./CarouselArrows";

export function createCenterCarouselSettings(options: {
  infinite: boolean;
  autoplay: boolean;
  autoplaySpeed: number;
}): Settings {
  return {
    dots: false,
    infinite: options.infinite,
    centerMode: true,
    centerPadding: "28%",
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: options.autoplay,
    autoplaySpeed: options.autoplaySpeed,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 1, centerPadding: "23%" } },
      { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: "18%" } },
      { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: "12%" } },
    ],
  };
}
