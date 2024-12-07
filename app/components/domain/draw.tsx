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
      <div className="flex flex-col items-center">
        <button
          onClick={handleClick}
        >
          <img
            src="/pack.png"
            alt="パック"
            className="mx-auto mb-2 w-48"
          />
        </button>
        <p className="text-purple-600">▲ タップしてパックを開封</p>
      </div>
    </div>
  );
}
