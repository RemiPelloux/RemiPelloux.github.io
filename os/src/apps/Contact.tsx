// Contact card. No form on purpose: there is no backend, and LinkedIn already does messages well.
// Each channel opens in a new tab or copies its address.
import type { AppProps } from "./registry";
import { Badge, CopyButton, Ext, openApp } from "./kit";
import "./apps.css";

const CHANNELS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/remipelloux/", primary: true },
  { name: "GitHub", href: "https://github.com/RemiPelloux" },
  { name: "GitHub Sponsors", href: "https://github.com/sponsors/RemiPelloux" },
];

function Channel({ name, href, primary }: (typeof CHANNELS)[number]) {
  const short = href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
  return (
    <div className="channel">
      <span className="channel-name">{name}{primary && <em>fastest way</em>}</span>
      <span className="channel-actions">
        <CopyButton text={href} label={`${name} link`} />
        <Ext href={href} className={`btn btn-small${primary ? " primary" : " ghost"}`}>Open</Ext>
      </span>
      <Ext href={href}>{short}</Ext>
    </div>
  );
}

export default function Contact(_: AppProps) {
  return (
    <div className="app-pad">
      <article className="card" aria-labelledby="contact-name">
        <header className="card-head">
          <Badge />
          <div>
            <h3 className="app-h" id="contact-name">Rémi Pelloux</h3>
            <p className="app-lead">CTO and co-founder, OpenPro</p>
          </div>
        </header>
        <p className="muted" style={{ margin: "0 0 6px" }}>LinkedIn is the fastest way. I read every message that is not a sales pitch.</p>
        {CHANNELS.map((channel) => <Channel key={channel.name} {...channel} />)}
        <dl className="sysinfo channel" style={{ gridTemplateColumns: "auto 1fr" }}>
          <dt>Location</dt><dd>Nice, France · born in Antibes</dd>
          <dt>Languages</dt><dd>French (native), English (professional), Italian (intermediate)</dd>
        </dl>
        <div className="btn-row">
          <button type="button" className="btn ghost btn-small" onClick={() => openApp("map")}>See Antibes on the map</button>
        </div>
      </article>
    </div>
  );
}
