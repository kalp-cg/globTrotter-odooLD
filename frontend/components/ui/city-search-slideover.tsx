"use client";

import React from "react";
import { SlideOver } from "./slide-over";
import { CitySearch } from "./city-search";
import { City } from "@/lib/api/types";

interface CitySearchSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
}

export function CitySearchSlideover({ isOpen, onClose, onSelectCity }: CitySearchSlideoverProps) {
  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Add a Stop">
      <CitySearch onSelectCity={onSelectCity} className="h-full" />
    </SlideOver>
  );
}
