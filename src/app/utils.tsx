export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function linearClamped(value: number, inputMin: number, inputMax: number, outputMin: number, outputMax: number): number {
  const normalized = (value - inputMin) / (inputMax - inputMin);
  return clamp(outputMin + normalized * (outputMax - outputMin), outputMin, outputMax);
}

export const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const url = part.replace(/[<>]/g, "");
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:text-highlight underline"
          onClick={(e) => e.stopPropagation()}
          style={{
            wordBreak: 'break-all'
          }}
        >
          {url}
        </a>
      );
    }
    return part;
  });
};