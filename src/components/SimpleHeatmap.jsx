import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function SimpleHeatmap(props) {
  const {
    points,
    width,
    height,
    defaultRadius,
    defaultGradient,
    max,
    minOpacity,
  } = props;

  const canvasRef = useRef(null);

  const drawCircle = (r, blur = 15) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const r2 = r + blur;

    ctx.width = r2 * 2;
    ctx.height = r2 * 2;

    ctx.shadowOffsetX = r2 * 2;
    ctx.shadowOffsetY = r2 * 2;
    ctx.shadowBlur = blur;
    ctx.shadowColor = 'black';

    ctx.beginPath();
    ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    return canvas.toDataURL();
  };

  const drawGradient = (grad) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;
    // eslint-disable-next-line
    for (let i in grad) {
      gradient.addColorStop(+i, grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    return ctx.getImageData(0, 0, 1, 256).data;
  };

  const colorize = (gradient, pixelsParam = []) => {
    const pixels = [...pixelsParam];
    const { length } = pixels;
    for (let i = 0; i < length; i += 4) {
      const j = pixels[i + 3] * 4;
      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  };

  const draw = () => {
    const circle = drawCircle(defaultRadius);
    const grad = drawGradient(defaultGradient);
    const _r = defaultRadius + 15;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const { length } = points;
    for (let i = 0; i < length; i += 1) {
      const p = points[i];
      ctx.globalAlpha = Math.min(
        Math.max(p[2] / max, minOpacity === undefined ? 0.05 : minOpacity),
        1
      );
      ctx.drawImage(circle, p[0] - _r, p[1] - _r);
    }

    const colored = ctx.getImageData(0, 0, width, height);
    colorize(grad, colored.data);
    ctx.putImageData(colored, 0, 0);
  };

  useEffect(() => {
    draw();
  }, []);

  return <canvas ref={canvasRef} width={width} height={height} />;
}

SimpleHeatmap.defaultProps = {
  width: 300,
  height: 300,
  defaultRadius: 25,
  defaultGradient: {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red',
  },
  max: 3.0,
  minOpacity: 0.01,
};
SimpleHeatmap.propTypes = {
  points: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  defaultRadius: PropTypes.number,
  defaultGradient: PropTypes.object,
  max: PropTypes.number,
  minOpacity: PropTypes.number,
};
export default SimpleHeatmap;
