const AudioWaveform = () => {
  const bars = Array.from({
    length: 12
  }, (_, i) => i);
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {bars.map((i) => (
        <div
          key={i}
          className="w-1 bg-gradient-to-t from-primary to-accent rounded-full animate-pulse"
          style={{
            height: `${30 + Math.random() * 40}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
export default AudioWaveform;