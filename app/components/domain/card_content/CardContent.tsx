
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
    <div>
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
              gap: "0.4rem"
            }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.1rem"
              }}>
                <p style={{
                  color: "#111111",
                  fontSize: "0.5rem",
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
        top: "65%",
        left: "10%",
        right: "10%",
        width: "80%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        // backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}>
        {moves.map((move) => (
          <Move key={move.name} name={move.name} damage={move.damage} />
        ))}
      </div>
    </div >
  )
}