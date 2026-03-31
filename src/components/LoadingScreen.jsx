function LoadingScreen({
  title = 'กำลังโหลด',
  message = 'ระบบกำลังเตรียมข้อมูลให้คุณ',
  fullScreen = false,
}) {
  return (
    <div className={`loading-screen ${fullScreen ? 'loading-screen--full' : ''}`}>
      <div className="loading-screen__orb" />
      <div className="loading-screen__content">
        <div className="loading-spinner" />
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
