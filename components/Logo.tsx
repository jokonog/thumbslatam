import Image from "next/image";

export default function Logo({ href = "/", height = 32, onClick }: { href?: string; height?: number; onClick?: () => void }) {
  return (
    <a href={href} onClick={onClick} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      <Image src="/logo.png" alt="ThumbsLatam" height={height} width={height * 5.5} style={{ objectFit: "contain" }} />
    </a>
  );
}
