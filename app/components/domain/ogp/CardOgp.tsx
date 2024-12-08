const CARD_WIDTH = 400;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

export const CardOgp = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <div style={{
      width: "1200px",
      height: "630px",
      backgroundColor: "#f0f0f0",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    }}>
      <img
        src={imageUrl}
        alt=""
        style={{
          borderRadius: "15px",
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 10)"
        }}
      />
    </div>
  );
};

