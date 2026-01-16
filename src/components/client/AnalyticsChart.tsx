import { useMemo } from 'react';

interface ChartLine {
  key: string;
  color: string;
  name: string;
}

interface ChartBar {
  key: string;
  color: string;
  name: string;
}

interface AnalyticsChartProps {
  data: any[];
  type: 'line' | 'bar';
  xKey: string;
  lines?: ChartLine[];
  bars?: ChartBar[];
  xAxisFormatter?: (value: any) => string;
  height?: number;
}

export default function AnalyticsChart({ 
  data, 
  type, 
  xKey, 
  lines = [], 
  bars = [],
  xAxisFormatter,
  height = 300
}: AnalyticsChartProps) {
  const maxValue = useMemo(() => {
    if (data.length === 0) return 100;
    
    let max = 0;
    data.forEach(item => {
      if (type === 'line') {
        lines.forEach(line => {
          max = Math.max(max, item[line.key] || 0);
        });
      } else {
        bars.forEach(bar => {
          max = Math.max(max, item[bar.key] || 0);
        });
      }
    });
    
    return max * 1.1; // Add 10% padding
  }, [data, type, lines, bars]);

  const yAxisTicks = useMemo(() => {
    const ticks = [];
    const step = Math.ceil(maxValue / 5);
    for (let i = 0; i <= 5; i++) {
      ticks.push(i * step);
    }
    return ticks;
  }, [maxValue]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 justify-end">
        {type === 'line' && lines.map(line => (
          <div key={line.key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: line.color }}
            />
            <span className="text-sm text-gray-600">{line.name}</span>
          </div>
        ))}
        {type === 'bar' && bars.map(bar => (
          <div key={bar.key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: bar.color }}
            />
            <span className="text-sm text-gray-600">{bar.name}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 w-12">
          {yAxisTicks.reverse().map((tick, idx) => (
            <div key={idx} className="text-right pr-2">
              {tick}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-8 border-l border-b border-gray-200">
          {/* Horizontal grid lines */}
          {yAxisTicks.map((_, idx) => (
            <div 
              key={idx}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${(idx / (yAxisTicks.length - 1)) * 100}%` }}
            />
          ))}

          {/* Data visualization */}
          <div className="absolute inset-0 flex items-end">
            {data.map((item, idx) => {
              const width = `${100 / data.length}%`;
              const left = `${(idx / data.length) * 100}%`;

              if (type === 'bar') {
                return (
                  <div 
                    key={idx}
                    className="absolute bottom-0 flex items-end justify-center px-1"
                    style={{ width, left }}
                  >
                    {bars.map(bar => {
                      const value = item[bar.key] || 0;
                      const barHeight = `${(value / maxValue) * 100}%`;
                      
                      return (
                        <div
                          key={bar.key}
                          className="rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                          style={{ 
                            width: '80%',
                            height: barHeight,
                            backgroundColor: bar.color,
                          }}
                          title={`${bar.name}: ${value}`}
                        />
                      );
                    })}
                  </div>
                );
              }

              // Line chart
              return null;
            })}

            {/* Line chart paths */}
            {type === 'line' && lines.map(line => {
              const points = data.map((item, idx) => {
                const x = ((idx + 0.5) / data.length) * 100;
                const value = item[line.key] || 0;
                const y = 100 - ((value / maxValue) * 100);
                return `${x},${y}`;
              }).join(' ');

              return (
                <svg 
                  key={line.key}
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '100%', height: '100%' }}
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <polyline
                    points={points}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {data.map((item, idx) => {
                    const x = ((idx + 0.5) / data.length) * 100;
                    const value = item[line.key] || 0;
                    const y = 100 - ((value / maxValue) * 100);
                    
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="0.8"
                        fill={line.color}
                        className="pointer-events-auto cursor-pointer hover:r-1.5"
                      >
                        <title>{`${line.name}: ${value}`}</title>
                      </circle>
                    );
                  })}
                </svg>
              );
            })}
          </div>
        </div>

        {/* X-axis */}
        <div className="absolute left-14 right-0 bottom-0 h-8 flex items-start pt-2">
          {data.map((item, idx) => {
            // Show every nth label to avoid crowding
            const showLabel = data.length <= 12 || idx % Math.ceil(data.length / 12) === 0;
            if (!showLabel) return null;

            const value = item[xKey];
            const label = xAxisFormatter ? xAxisFormatter(value) : value;

            return (
              <div 
                key={idx}
                className="text-xs text-gray-500 text-center"
                style={{ 
                  width: `${100 / data.length}%`,
                  marginLeft: `${(idx / data.length) * 100}%`,
                  position: 'absolute',
                  transform: 'translateX(-50%)'
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
