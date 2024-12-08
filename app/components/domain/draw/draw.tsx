import { useNavigate } from "@remix-run/react";

export default function Draw() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/draw");
  };

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      <div className="mt-6 bg-purple-400 p-4 text-white text-center">
        もう一度カードを引く（ランダム）
      </div>
      <div className="flex flex-col items-center bg-slate-100 pt-2 pb-6">
        <div className="relative w-full overflow-hidden mt-4">
          <div className="flex animate-scroll-infinite gap-4">
            {[...Array(3)].map((_, i) => (
              <button key={i} onClick={handleClick} className="flex-shrink-0">
                <img
                  src="/images/pack.gif"
                  loading="lazy"
                  alt="パック"
                  className="w-56"
                />
              </button>
            ))}
          </div>
        </div>
        <p className="text-purple-600 mt-1">▲ タップしてパックを開封</p>
      </div>
    </div>
  );
}
