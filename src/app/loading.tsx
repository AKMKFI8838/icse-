import './loading.css';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="loading-bar-container">
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
      </div>
    </div>
  );
}
