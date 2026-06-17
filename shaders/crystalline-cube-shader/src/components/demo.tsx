import { useState } from "react";
import InteractiveShader from "@/components/ui/crystalline-cube";

/**
 * DemoOne — the reference demo straight from the integration prompt. It mounts
 * the verbatim `InteractiveShader` and wires its four props to range sliders.
 *
 * The polished showcase the app actually renders lives in `App.tsx`; this file
 * is kept as the canonical, minimal usage example so anyone copy-pasting the
 * component has a known-good starting point.
 */
export default function DemoOne() {
  // State variables to hold the shader parameters, controlled by sliders
  const [complexity, setComplexity] = useState(4.0);
  const [colorShift, setColorShift] = useState(0.3);
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [mouseInfluence, setMouseInfluence] = useState(0.5);

  return (
    <div className="relative w-full h-screen font-sans bg-black">
      {/* The main shader component that renders the visual effect */}
      <InteractiveShader
        complexity={complexity}
        colorShift={colorShift}
        lightIntensity={lightIntensity}
        mouseInfluence={mouseInfluence}
      />

      {/* UI controls panel with a new "Crystalline Core" theme */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 backdrop-blur-md text-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-gray-700">
        <h1 className="text-xl font-bold mb-4 tracking-wider text-center">Crystalline Core</h1>

        <div className="space-y-4">
          {/* Slider for Complexity */}
          <div>
            <label htmlFor="complexity" className="block mb-2 text-sm font-medium">
              Complexity: {complexity.toFixed(2)}
            </label>
            <input
              id="complexity"
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              value={complexity}
              onChange={(e) => setComplexity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Slider for Color Shift */}
          <div>
            <label htmlFor="colorShift" className="block mb-2 text-sm font-medium">
              Color Shift: {colorShift.toFixed(2)}
            </label>
            <input
              id="colorShift"
              type="range"
              min="0"
              max="1.0"
              step="0.01"
              value={colorShift}
              onChange={(e) => setColorShift(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Slider for Light Intensity */}
          <div>
            <label htmlFor="lightIntensity" className="block mb-2 text-sm font-medium">
              Light Intensity: {lightIntensity.toFixed(2)}
            </label>
            <input
              id="lightIntensity"
              type="range"
              min="0.5"
              max="3.0"
              step="0.01"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Slider for Mouse Influence */}
          <div>
            <label htmlFor="mouseInfluence" className="block mb-2 text-sm font-medium">
              Mouse Influence: {mouseInfluence.toFixed(2)}
            </label>
            <input
              id="mouseInfluence"
              type="range"
              min="0"
              max="1.0"
              step="0.01"
              value={mouseInfluence}
              onChange={(e) => setMouseInfluence(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
