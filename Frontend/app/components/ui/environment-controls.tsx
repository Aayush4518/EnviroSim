"use client";
import { AngleSlider } from "@ark-ui/react/angle-slider";
import { useState } from "react";
import { Thermometer, Wind, Cloud, Zap } from "lucide-react";

const width = 150;
const thickness = 16;

interface EnvironmentValue {
  temperature: number;
  pollution: number;
  rainfall: number;
  windSpeed: number;
}

interface EnvironmentControlsProps {
  onValuesChange?: (values: EnvironmentValue) => void;
  className?: string;
}

export default function EnvironmentControls({
  onValuesChange,
  className = "",
}: EnvironmentControlsProps) {
  const [values, setValues] = useState<EnvironmentValue>({
    temperature: (25 / 50) * 360,
    pollution: (30 / 100) * 360,
    rainfall: 45,
    windSpeed: (60 / 100) * 360,
  });

  const handleValueChange = (key: keyof EnvironmentValue, value: number) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onValuesChange?.(newValues);
  };

  const environmentParams = [
    {
      key: "temperature" as const,
      label: "Temperature",
      unit: "°C",
      icon: Thermometer,
      color: "from-red-600 to-orange-500",
      darkColor: "dark:from-red-400 dark:to-orange-400",
      min: 0,
      max: 50,
    },
    {
      key: "pollution" as const,
      label: "Pollution Level",
      unit: "%",
      icon: Wind,
      color: "from-orange-500 to-red-600",
      darkColor: "dark:from-orange-400 dark:to-red-500",
      min: 0,
      max: 100,
    },
    {
      key: "rainfall" as const,
      label: "Rainfall",
      unit: "mm",
      icon: Cloud,
      color: "from-blue-500 to-cyan-400",
      darkColor: "dark:from-blue-400 dark:to-cyan-300",
      min: 0,
      max: 360,
    },
    {
      key: "windSpeed" as const,
      label: "Wind Speed",
      unit: "km/h",
      icon: Zap,
      color: "from-green-400 to-cyan-500",
      darkColor: "dark:from-green-300 dark:to-cyan-400",
      min: 0,
      max: 100,
    },
  ];

  return (
    <div
      className={`bg-white/10 dark:bg-slate-900/30 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/50 p-4 space-y-3 shadow-2xl ${className}`}
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          🌍 Environment Simulator
        </h2>
        <p className="text-sm text-gray-300">
          Adjust environmental parameters to simulate scenarios
        </p>
      </div>

      <div className="space-y-2">
        {environmentParams.map((param) => {
          const Icon = param.icon;
          const sliderValue = values[param.key];
          const percentValue = (sliderValue / 360) * 100;
          const displayValue = (sliderValue / 360) * param.max;

          return (
            <div
              key={param.key}
              className="bg-white/5 dark:bg-slate-800/30 rounded-xl p-3 border border-white/10 dark:border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-white" />
                  <div>
                    <h3 className="font-semibold text-white">{param.label}</h3>
                    <p className="text-xs text-gray-400">
                      {Math.round(displayValue)} {param.unit}
                    </p>
                  </div>
                </div>
              </div>

              <AngleSlider.Root
                value={sliderValue}
                onValueChange={(details) => {
                  handleValueChange(param.key, details.value);
                }}
                className="relative w-[150px] h-[150px] flex items-center justify-center mx-auto"
              >
                <AngleSlider.Control className="absolute inset-0">
                  <svg
                    width={width}
                    height={width}
                    viewBox={`0 0 ${width} ${width}`}
                    className={`[--gradient-start:var(--color-start)] [--gradient-end:var(--color-end)]`}
                    style={
                      {
                        "--size": `${width}px`,
                        "--thickness": `${thickness}px`,
                        "--percent": `${percentValue}`,
                        "--color-start": `rgb(${param.key === "temperature" ? "255, 0, 0" : param.key === "pollution" ? "139, 69, 19" : param.key === "rainfall" ? "0, 150, 255" : "173, 216, 230"})`,
                        "--color-end": `rgb(${param.key === "temperature" ? "255, 255, 0" : param.key === "pollution" ? "139, 139, 139" : param.key === "rainfall" ? "0, 255, 255" : "255, 255, 255"})`,
                      } as React.CSSProperties
                    }
                  >
                    <title>{param.label}</title>
                    {/* Track circle */}
                    <circle
                      className="stroke-gray-400 dark:stroke-gray-600 fill-transparent"
                      style={
                        {
                          "--radius": `calc(var(--size) / 2 - var(--thickness) / 2)`,
                          cx: "calc(var(--size) / 2)",
                          cy: "calc(var(--size) / 2)",
                          r: "var(--radius)",
                          strokeWidth: "var(--thickness)",
                        } as React.CSSProperties
                      }
                    />
                    {/* Progress circle */}
                    <circle
                      className="fill-transparent"
                      style={
                        {
                          "--radius": `calc(var(--size) / 2 - var(--thickness) / 2)`,
                          cx: "calc(var(--size) / 2)",
                          cy: "calc(var(--size) / 2)",
                          r: "var(--radius)",
                          strokeWidth: "var(--thickness)",
                          "--circumference": `calc(2 * 3.14159 * var(--radius))`,
                          "--offset": `calc(var(--circumference) * (100 - var(--percent)) / 100)`,
                          strokeDashoffset: `calc(var(--circumference) * (100 - var(--percent)) / 100)`,
                          strokeDasharray: "var(--circumference)",
                          strokeLinecap: "round",
                          transformOrigin: "center",
                          transform: "rotate(-90deg)",
                          stroke: `url(#gradient-${param.key})`,
                        } as React.CSSProperties
                      }
                    />
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient
                        id={`gradient-${param.key}`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-start)"
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-end)"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                  <AngleSlider.Thumb className="absolute top-0 right-0 bottom-0 left-[calc(50%-1.5px)] pointer-events-none h-full w-[3px] flex items-start outline-hidden">
                    <span
                      className={`bg-gradient-to-br ${param.color} ${param.darkColor} w-4 h-4 rounded-full shrink-0 scale-100 shadow-lg border-2 border-white dark:border-gray-800`}
                    />
                  </AngleSlider.Thumb>
                </AngleSlider.Control>
                <AngleSlider.HiddenInput />
              </AngleSlider.Root>

              <div className="mt-1 flex justify-between items-center text-xs text-gray-400">
                <span>{param.min}{param.unit}</span>
                <span>{Math.round(displayValue)}{param.unit}</span>
                <span>{param.max}{param.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
