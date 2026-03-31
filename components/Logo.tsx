import Image from "next/image";

export default function Logo({ height = 32, href, onClick }: { height?: number; href?: string; onClick?: () => void }) {
  if (href) {
    return (
      <a href={href} onClick={onClick} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
        <Image src="/logo.png" alt="ThumbsLatam" height={height} width={Math.round(height * 5.5)} style={{ objectFit: "contain" }} />
      </a>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <Image src="/logo.png" alt="ThumbsLatam" height={height} width={Math.round(height * 5.5)} style={{ objectFit: "contain" }} />
    </span>
  );
}
