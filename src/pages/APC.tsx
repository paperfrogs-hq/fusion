import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CopyBlock } from "@/components/ui/copy-block";
import { Note } from "@/components/ui/note";
import { SectionNumber } from "@/components/ui/section-number";

const hashSnippet = `$ apc hash interview.wav
9f2c6a1b8e3d7f4a2c5b9e1d0f6a3c8b
2e7d4f1a9c6b3e8d5f2a7c1b9e4d6f3a
8c2b5e9d1f4a7c3b6e2d9f5a1c8b4e7d`;

const signSnippet = `use fusion_apc::{sign, Keypair};

let key = Keypair::from_pem("publisher.pem")?;
let receipt = sign("interview.wav", &key)?;

// receipt carries:
// - sha256 of the file
// - ed25519 signature
// - publisher id, timestamp, model tag`;

const verifySnippet = `curl -X POST https://api.fusion.paperfrogs.dev/v1/verify \\
  -H "Content-Type: application/octet-stream" \\
  --data-binary @interview.wav

# {
#   "verified": true,
#   "publisher": "ada@paperfrogs.dev",
#   "signed_at": "2026-03-04T14:22:08Z",
#   "fingerprint": "9f2c6a1b...4e7d"
# }`;

const APC = () => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />

      <main className="relative z-10 pb-24 pt-32 sm:pt-36 lg:pt-44">
        <section className="relative">
          <Container>
            <div className="max-w-[12ch]">
              <p className="font-serif text-sm italic text-muted-foreground">
                02 <span className="mx-3 inline-block h-px w-6 align-middle bg-rule" /> APC
              </p>
            </div>

            <h1 className="mt-6 max-w-[18ch] font-serif text-[clamp(2.75rem,5vw,4.5rem)] font-light leading-[1.02] tracking-[-0.025em] text-foreground">
              The engine that signs{" "}
              <span className="font-serif italic text-foreground/95">the audio.</span>
            </h1>

            <p className="mt-7 max-w-measure-70 text-prose text-muted-foreground">
              APC is the cryptographic engine inside Fusion. It does one thing. Given an audio
              file, it produces a signature that proves the file is what its publisher says it
              is. The signature travels with the file, in the file, so it survives the journey
              from your studio to wherever the listener is.
            </p>
          </Container>
        </section>

        <div className="hairline mx-auto mt-20 max-w-[1240px] sm:mt-28" />

        <section className="relative py-20 sm:py-28 lg:py-36">
          <Container>
            <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="mx-auto max-w-measure-70 lg:mx-0">
                <SectionNumber n="01" label="Hash" />
                <p className="mt-4 text-prose text-muted-foreground">
                  The audio is hashed with SHA-256. The hash is short enough to embed and stable
                  enough to be the canonical identifier for the clip.
                </p>
                <div className="mt-6">
                  <CopyBlock code={hashSnippet} language="shell" filename="cli" />
                </div>
              </div>

              <aside className="hidden lg:block">
                <div className="sticky top-32">
                  <Note marker="tl;dr">
                    APC is a small, fast Rust core. It hashes, signs, and watermarks audio with
                    the same primitives used in modern package managers and certificate
                    authorities. If you can verify a TLS certificate, you can verify an APC
                    receipt.
                  </Note>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        <div className="hairline mx-auto max-w-[1240px]" />

        <section className="relative py-20 sm:py-28 lg:py-36">
          <Container>
            <div className="mx-auto max-w-measure-70">
              <SectionNumber n="02" label="Sign" />
              <p className="mt-4 text-prose text-muted-foreground">
                The hash is signed with an Ed25519 key tied to a publisher. A watermark is laid
                into the audio at the same time. Both go back into the file.
              </p>
              <div className="mt-6">
                <CopyBlock code={signSnippet} language="rust" filename="apc.rs" />
              </div>
            </div>
          </Container>
        </section>

        <div className="hairline mx-auto max-w-[1240px]" />

        <section className="relative py-20 sm:py-28 lg:py-36">
          <Container>
            <div className="mx-auto max-w-measure-70">
              <SectionNumber n="03" label="Verify" />
              <p className="mt-4 text-prose text-muted-foreground">
                Anyone with the publisher's public key can verify the file, including offline. No
                Fusion login, no Fusion server in the loop. Just the key, the file, and a short
                curl.
              </p>
              <div className="mt-6">
                <CopyBlock code={verifySnippet} language="http" filename="verify.sh" />
              </div>
            </div>
          </Container>
        </section>

        <div className="hairline mx-auto max-w-[1240px]" />

        <section className="relative py-20 sm:py-28 lg:py-36">
          <Container>
            <div className="mx-auto max-w-measure-64">
              <p className="font-serif text-xs italic uppercase tracking-[0.22em] text-muted-foreground/80">
                Waitlist
              </p>
              <h2 className="mt-3 font-serif text-3xl font-light leading-tight text-foreground sm:text-4xl">
                We are not shipping yet.
              </h2>
              <p className="mt-5 text-prose text-muted-foreground">
                APC is in private testing. We will email the waitlist when there is something
                worth trying. No demo calls, no SDR funnel.
              </p>
              <div className="mt-8">
                <Button asChild variant="default">
                  <Link to="/waitlist" className="link-underline">
                    Join the waitlist
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default APC;