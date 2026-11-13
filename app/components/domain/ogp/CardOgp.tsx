export const CARD_WIDTH = 400;
export const CARD_HEIGHT = CARD_WIDTH * 14 / 10;
export const CARD_RADIUS = 15;
export const OGP_WIDTH = 1200;
export const OGP_HEIGHT = 630;

export const CardOgp = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <div style={{
      width: `${OGP_WIDTH}px`,
      height: `${OGP_HEIGHT}px`,
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
          borderRadius: `${CARD_RADIUS}px`,
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 10)"
        }}
      />
    </div>
  );
};

