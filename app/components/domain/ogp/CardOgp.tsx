export const CardOgp = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <div style={{ width: "1200px", height: "630px", backgroundColor: "red", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p>test</p>
      <img src={imageUrl} alt="aa" width="100px" height="100px" />
    </div>
  );
};

