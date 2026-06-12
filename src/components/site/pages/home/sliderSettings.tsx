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
    centerPadding: "0px",
    variableWidth: true,
    speed: 600,
    cssEase: "ease",
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: options.autoplay,
    autoplaySpeed: options.autoplaySpeed,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };
}
