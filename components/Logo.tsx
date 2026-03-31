import Link from "next/link";
import Image from "next/image";

export default function Logo({ href = "/dashboard", height = 32 }: { href?: string; height?: number }) {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      <Image src="/logo.png" alt="ThumbsLatam" height={height} width={height * 5.5} style={{ objectFit: "contain" }} />
    </Link>
  );
}
