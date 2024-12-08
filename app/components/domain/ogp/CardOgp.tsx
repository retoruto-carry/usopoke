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
          width: "400px",
          height: "auto",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 10)"
        }}
      />
    </div>
  );
};

