import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image
  output: "standalone",
  serverExternalPackages: ["mongoose", "mongodb", "nodemailer", "imapflow", "mailparser"],
};

export default nextConfig;
