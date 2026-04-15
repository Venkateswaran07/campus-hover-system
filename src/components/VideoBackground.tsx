const VideoBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
  </div>
);

export default VideoBackground;
