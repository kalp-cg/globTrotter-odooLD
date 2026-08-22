import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GlobTrotter Trip Postcard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { shareSlug: string } }) {
  const { shareSlug } = params;
  
  // Notice we use the same public fetcher to get the data safely
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://globtrotter-odoold-lgh6.onrender.com/api";
  const apiUrl = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;
  let tripData = null;

  try {
    const res = await fetch(`${apiUrl}/trips/public/${shareSlug}`);
    if (res.ok) {
      const json = await res.json();
      tripData = json.data?.trip;
    }
  } catch (err) {
    // Graceful fallback
  }

  const title = tripData?.name || "A globetrotter trip";
  const coverUrl = tripData?.cover_photo_url || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80";
  const author = tripData?.user_name || "A Traveler";

  // We are returning a JSX-based SVG converted to PNG by next/og
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#D9CDBF", // Kraft color fallback
          backgroundImage: "linear-gradient(to bottom right, #D9CDBF, #F4F1EA)",
          padding: "40px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "1120px",
            height: "550px",
            backgroundColor: "#F4F1EA", // Paper color
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            border: "8px solid #F4F1EA",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Postcard Image Left */}
          <div
            style={{
              display: "flex",
              width: "50%",
              height: "100%",
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          
          {/* Postcard Message Right */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "50%",
              height: "100%",
              padding: "60px 40px",
              borderLeft: "2px dashed #9E9E9E",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "32px", color: "#2A2A2A", opacity: 0.6, marginBottom: "10px" }}>
                A Postcard from
              </span>
              <span style={{ fontSize: "48px", color: "#2A2A2A", fontWeight: "bold" }}>
                {author}
              </span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
              <span style={{ fontSize: "64px", color: "#D3422E", fontWeight: "bold", lineHeight: 1.1 }}>
                {title}
              </span>
            </div>
          </div>

          {/* Stamp Top Right */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "120px",
              height: "140px",
              border: "4px solid #D3422E",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(12deg)",
            }}
          >
            <span style={{ color: "#D3422E", fontSize: "24px", fontWeight: "bold" }}>
              STAMP
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
