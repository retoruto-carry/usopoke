
type Move = {
  name: string;
  damage: string;
  info?: string;
}

type CardContentProps = {
  imageSrc: string;
  hp: string;
  name: string;
  moves: Move[];
}

const Move = ({ name, damage, info }: Move) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          {(damage || name || info) && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <img src="/images/energy.png" alt="エネルギー" style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "50%",
                border: "1px solid #FFF"
              }} />
              <img src="/images/energy.png" alt="エネルギー" style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "50%",
                border: "1px solid #FFF"
              }} />
            </div>
          )}
          <p style={{
            color: "#111111",
            fontSize: "1.3rem",
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            textShadow: "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF"
          }}>
            {name}
          </p>
        </div>
        <p style={{
          color: "#111111",
          fontSize: "1.3rem",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          textShadow: "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF"
        }}>
          {damage}
        </p>
      </div>
      <p style={{
        color: "#111111",
        fontSize: "0.9rem",
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold",
        textShadow: "-0.5px -0.5px 0 #FFF, 0.5px -0.5px 0 #FFF, -0.5px 0.5px 0 #FFF, 0.5px 0.5px 0 #FFF"
      }}>
        {info}
      </p>
    </div >
  )
}

export const CardContent = ({ imageSrc, hp, name, moves }: CardContentProps) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div style={{
        position: "absolute",
        top: "4%",
        left: "6%",
        right: "6%",
        width: "88%",
        height: "10%",
        // backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}>
            <p style={{
              color: "#111111",
              fontSize: "1.3rem",
              fontFamily: "Arial, sans-serif",
              fontWeight: "bold",
              textShadow: "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF"
            }}>
              {name}
            </p>
          </div>
          {hp && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.2rem"
              }}>
                <p style={{
                  color: "#111111",
                  fontSize: "0.8rem",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "bold",
                  textShadow: "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF"
                }}>
                  HP
                </p>
                <p style={{
                  color: "#111111",
                  fontSize: "1.3rem",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "bold",
                  textShadow: "-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF"
                }}>
                  {hp}
                </p>
              </div>
              <img src="/images/energy.png" alt="エネルギー" style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "50%",
                border: "1px solid #FFF"
              }} />
            </div>
          )}
        </div>
      </div>
      <div style={{
        position: "absolute",
        top: "64.5%",
        left: "10%",
        right: "10%",
        width: "80%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        // backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}>
        <Move key={"move-1"} name={moves[0].name} damage={moves[0].damage} info={moves[0].info} />
        <Move key={moves[1].name} name={moves[1].name} damage={moves[1].damage} info={moves[1].info} />
      </div>
    </div >
  )
}