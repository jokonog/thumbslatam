import Link from "next/link";

export default function Logo({ href = "/dashboard", size = "1.8rem" }: { href?: string; size?: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <span style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.02em", color: "white", fontFamily: "var(--font-syne)" }}>
        Thumbs<span style={{ color: "#FF4D00" }}>Latam</span>
      </span>
    </Link>
  );
}
