import React from 'react';

const DonutChart = ({ data, colors, width, height, innerRadius, outerRadius }) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let startAngle = 0;

  return (
    <svg width={width} height={height}>
      {data.map((item, index) => {
        const value = item.value;
        const percentage = (value / total) * 100;
        const endAngle = startAngle + (percentage * 3.6); // 3.6 = 360 / 100

        // Рассчитываем координаты для дуги
        const startX = centerX + outerRadius * Math.cos((Math.PI / 180) * (startAngle - 90));
        const startY = centerY + outerRadius * Math.sin((Math.PI / 180) * (startAngle - 90));
        const endX = centerX + outerRadius * Math.cos((Math.PI / 180) * (endAngle - 90));
        const endY = centerY + outerRadius * Math.sin((Math.PI / 180) * (endAngle - 90));

        const largeArcFlag = percentage > 50 ? 1 : 0;

        // Путь для дуги
        const pathData = `
          M ${centerX} ${centerY}
          L ${startX} ${startY}
          A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
          L ${centerX} ${centerY}
          Z
        `;

        // Путь для внутреннего радиуса (дырка в пончике)
        const innerPathData = `
          M ${centerX} ${centerY}
          L ${startX} ${startY}
          A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
          L ${centerX} ${centerY}
          Z
        `;

        startAngle = endAngle;

        return (
          <g key={index}>
            <path
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="#212429" // Цвет обводки
              strokeWidth="2" // Толщина обводки
            />
            <path
              d={innerPathData}
              fill="#212429" // Цвет дырки
            />
          </g>
        );
      })}
    </svg>
  );
};

export default DonutChart;