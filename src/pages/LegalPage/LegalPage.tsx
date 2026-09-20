import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Copyright as CopyrightIcon, HardDrive, LockKeyhole, ShieldCheck } from 'lucide-react'
import { routes } from '@/routes/routes'
import styles from './LegalPage.module.css'

const EFFECTIVE_DATE = 'September 19, 2026'

export function TermsPage() {
  return <LegalDocument title="Terms and Conditions" eyebrow="Legal" summary="Rules for accessing and using PocketArc." icon={<ShieldCheck size={20}/>}>
    <ImportantNotice title="Personal and educational use only">
      PocketArc is a private portfolio demonstration intended for personal, non-commercial, and educational evaluation. Unless an accompanying license or written permission expressly allows it, the website, catalog files, game files, artwork, saves, screenshots, and other protected materials must not be copied, mirrored, republished, uploaded, sold, sublicensed, or redistributed.
    </ImportantNotice>

    <LegalSection number="01" title="Acceptance of these terms">
      <p>By accessing or using PocketArc, you agree to these Terms and the <Link to={routes.privacy}>Privacy Policy</Link>. If you do not agree, do not use the application or access its game catalog.</p>
      <p>These Terms apply to the PocketArc interface, locally installed Progressive Web App, bundled runtime, optional catalog, and any files you import or create while using the application.</p>
    </LegalSection>

    <LegalSection number="02" title="Limited permitted use">
      <p>You may use PocketArc only for private evaluation, portfolio review, education, testing, preservation activities permitted by applicable law, and personal gameplay using material you are legally entitled to access.</p>
      <p>No ownership interest is transferred to you. Access to a file through PocketArc does not grant permission to reproduce, distribute, publicly perform, publish, reverse engineer, or commercially exploit that file.</p>
    </LegalSection>

    <LegalSection number="03" title="Copyright and other protected material">
      <p>PocketArc may display names, artwork, software, game data, and other material protected by copyright, trademark, or related rights. Those rights remain with their respective owners. PocketArc is an independent project and is not endorsed by Nintendo, Game Freak, The Pokémon Company, Atari, Rockstar Games, or other identified rights holders unless expressly stated.</p>
      <p>The project is intended to demonstrate local-first web technology and emulator integration. Describing the project as educational or non-commercial is a statement of purpose, not a legal conclusion that every use qualifies as fair use or another copyright exception. Copyright exceptions depend on the facts and the law that applies to you.</p>
      <p>If material has been included under permission or a separate license, that permission or license controls. All other rights are reserved by their respective owners.</p>
    </LegalSection>

    <LegalSection number="04" title="Strict non-redistribution rule">
      <p>You must not extract or distribute protected ROM data or other catalog material from PocketArc. In particular, you may not:</p>
      <ul>
        <li>mirror, host, seed, publish, or offer game files to another person;</li>
        <li>circumvent technical restrictions to obtain material for redistribution;</li>
        <li>package PocketArc with protected game data for another website, application, archive, or repository;</li>
        <li>sell, rent, monetize, or use the protected material in advertising or another commercial service; or</li>
        <li>represent that you own or are authorized to license third-party names, artwork, code, or game content.</li>
      </ul>
      <p>This restriction does not override rights expressly granted by an applicable open-source or content license. EmulatorJS, mGBA, and other third-party software remain governed by their own licenses.</p>
    </LegalSection>

    <LegalSection number="05" title="User-imported ROMs and files">
      <p>You are responsible for every ROM, save, cover image, cheat code, backup, and other file you import. Only import material you created, own, or have lawful permission to possess and use. PocketArc does not verify your ownership or license.</p>
      <p>User-imported ROMs remain in the browser's IndexedDB storage and are not uploaded by PocketArc. You must not use the application to infringe rights, distribute unlawful copies, evade access controls, or violate applicable law.</p>
    </LegalSection>

    <LegalSection number="06" title="Local data and backups">
      <p>Your library, saves, save states, screenshots, settings, and play history are primarily stored on your device. Browser data can be removed by private-browsing rules, storage pressure, browser settings, profile deletion, device loss, or application errors.</p>
      <p>You are responsible for exporting backups of data you want to preserve. PocketArc does not promise that local data will always remain available or recoverable.</p>
    </LegalSection>

    <LegalSection number="07" title="Open-source emulator software">
      <p>PocketArc uses EmulatorJS and the mGBA core. Those components are provided under their respective open-source licenses, available from the application's Settings page and bundled license files. Nothing in these Terms reduces rights granted by those licenses.</p>
      <p>PocketArc does not create or replace the emulator core and does not provide a warranty that every ROM, browser, controller, save format, or device will work.</p>
    </LegalSection>

    <LegalSection number="08" title="Prohibited conduct">
      <p>You may not interfere with the application, introduce malicious code, attempt unauthorized access to another person's device or data, abuse hosting infrastructure, remove rights notices, falsely imply affiliation with a rights holder, or use PocketArc for unlawful activity.</p>
    </LegalSection>

    <LegalSection number="09" title="No warranty">
      <p>PocketArc is provided “as is” and “as available,” without warranties of uninterrupted operation, compatibility, accuracy, merchantability, fitness for a particular purpose, or non-infringement, to the fullest extent permitted by applicable law.</p>
      <p>Emulation, save conversion, browser storage, experimental features, and third-party content can fail. Keep independent backups and stop using the application if you are not comfortable with those risks.</p>
    </LegalSection>

    <LegalSection number="10" title="Limitation of responsibility">
      <p>To the fullest extent permitted by applicable law, the project owner is not responsible for lost saves, lost files, device or browser problems, interrupted access, indirect loss, or claims resulting from your imported content, redistribution, or violation of third-party rights.</p>
      <p>Nothing in these Terms excludes liability that cannot lawfully be excluded. Consumer rights that apply in your jurisdiction remain unaffected.</p>
    </LegalSection>

    <LegalSection number="11" title="Changes, suspension, and removal">
      <p>PocketArc, its catalog, and these Terms may change or be withdrawn. Access may be restricted or removed to protect users, comply with a legal request, address a rights claim, maintain security, or discontinue the project. Updated terms apply from the effective date shown on this page.</p>
    </LegalSection>

    <LegalSection number="12" title="Rights concerns and contact">
      <p>If you own rights in material displayed through PocketArc and believe it should be removed, contact the project owner through the portfolio contact channel from which this demonstration was shared. Include the material, the right you claim, the relevant URL, and a reliable way to reply.</p>
      <p>For general background on copyright exceptions, consult the <a href="https://www.copyright.gov/fair-use/" target="_blank" rel="noreferrer">U.S. Copyright Office Fair Use Index</a> or qualified legal counsel. Laws vary by location.</p>
    </LegalSection>
  </LegalDocument>
}

export function CopyrightPage() {
  return <LegalDocument title="Copyright & Disclaimer" eyebrow="Copyright" summary="Important restrictions on copying, redistribution, and use of protected material." icon={<CopyrightIcon size={20}/>}>
    <ImportantNotice title="Do not copy or redistribute protected material">
      PocketArc is presented as a personal, non-commercial, educational, and portfolio demonstration. Unless you own the relevant rights or have express permission, you must not copy, download for redistribution, mirror, publish, sell, sublicense, share, or otherwise distribute game files, artwork, branding, software, or other protected material available through this project.
    </ImportantNotice>

    <LegalSection number="01" title="Purpose of this project">
      <p>PocketArc demonstrates offline-first web application architecture, local browser storage, responsive controls, Progressive Web App behavior, and integration with EmulatorJS and the mGBA core.</p>
      <p>The project is intended for education, technical evaluation, personal use, and portfolio review. It is not a ROM distribution service, storefront, commercial gaming platform, or source of licenses to third-party content.</p>
    </LegalSection>

    <LegalSection number="02" title="Third-party rights">
      <p>Game names, characters, artwork, logos, audiovisual material, ROM data, and related intellectual property may be protected by copyright, trademark, and other laws. Those rights belong to their respective owners.</p>
      <p>PocketArc is an independent project. References to third-party games or companies are descriptive and do not imply sponsorship, endorsement, partnership, or ownership.</p>
    </LegalSection>

    <LegalSection number="03" title="No license is granted">
      <p>Viewing, testing, or accessing material through PocketArc does not transfer ownership and does not grant permission to reproduce, distribute, publicly display, modify, monetize, or create derivative works from that material.</p>
      <p>Any permission applicable to a particular file must come from its rights holder or an accompanying license. Where a separate license exists, its terms control.</p>
    </LegalSection>

    <LegalSection number="04" title="Educational-use disclaimer">
      <p>Describing PocketArc as educational, personal, non-commercial, or a portfolio project explains its intended purpose. Those descriptions do not automatically make every use lawful, establish fair use, or create an exception to copyright law.</p>
      <p>Copyright exceptions vary by jurisdiction and depend on the specific facts. You are responsible for ensuring that your access, imported files, screenshots, backups, and other use comply with applicable law and any relevant license.</p>
    </LegalSection>

    <LegalSection number="05" title="Strict non-distribution requirement">
      <p>Do not use PocketArc or its files to:</p>
      <ul>
        <li>copy or distribute ROMs or other protected game data without authorization;</li>
        <li>upload, mirror, seed, archive, or republish protected files on another service;</li>
        <li>sell, rent, license, bundle, or monetize protected content;</li>
        <li>remove copyright, trademark, attribution, or license notices;</li>
        <li>circumvent access controls to obtain material for copying or redistribution; or</li>
        <li>claim ownership of third-party content or imply authorization that you do not have.</li>
      </ul>
    </LegalSection>

    <LegalSection number="06" title="User-imported material">
      <p>Only import a ROM, save, cover image, cheat code, or other file if you created it, own it, or have lawful permission to possess and use it. You remain responsible for every file you import.</p>
      <p>Imported files are designed to remain in your browser's local storage. Local storage is a privacy feature; it is not permission to copy protected material or distribute it to another person.</p>
    </LegalSection>

    <LegalSection number="07" title="Open-source components">
      <p>EmulatorJS, mGBA, and other third-party software components remain governed by their own open-source licenses. This disclaimer does not restrict rights expressly granted by those licenses.</p>
      <p>Project-specific restrictions on protected game content must not be interpreted as replacing or reducing the permissions provided by an applicable software or content license.</p>
    </LegalSection>

    <LegalSection number="08" title="Removal requests and questions">
      <p>If you are a rights holder and believe material displayed through PocketArc infringes your rights, contact the project owner through the portfolio contact channel from which this demonstration was shared. Identify the protected work, the relevant PocketArc URL or file, your claimed rights, and a reliable way to reply.</p>
      <p>Material may be restricted or removed while a good-faith rights concern is reviewed. For legal advice about copyright or permitted use, consult a qualified professional in your jurisdiction.</p>
    </LegalSection>

    <LegalSection number="09" title="Related policies">
      <p>This page should be read together with the <Link to={routes.terms}>Terms and Conditions</Link> and <Link to={routes.privacy}>Privacy Policy</Link>. If a separate license or written permission applies to particular material, that license or permission controls for that material.</p>
    </LegalSection>
  </LegalDocument>
}

export function PrivacyPage() {
  return <LegalDocument title="Privacy Policy" eyebrow="Privacy" summary="How PocketArc handles local game data and limited technical information." icon={<LockKeyhole size={20}/>}>
    <ImportantNotice title="Local-first by design">
      PocketArc does not require an account and does not intentionally upload user-imported ROMs, saves, save states, screenshots, cover images, cheat codes, or backups. These files remain in storage controlled by your browser unless you choose to export or delete them.
    </ImportantNotice>

    <LegalSection number="01" title="Scope">
      <p>This Policy explains how PocketArc handles information when you visit the website, install the PWA, import a game, play, change settings, create saves or screenshots, or use backup and restore features.</p>
    </LegalSection>

    <LegalSection number="02" title="Information stored on your device">
      <p>PocketArc may store the following information in IndexedDB and related browser storage:</p>
      <ul>
        <li>imported ROM files, filenames, file sizes, hashes, and game metadata;</li>
        <li>normal saves, save states, save-state previews, and screenshots;</li>
        <li>custom cover images, favorites, descriptions, and catalog installation status;</li>
        <li>settings for display, sound, keyboard, gamepad, touch controls, and accessibility;</li>
        <li>play sessions, last-played timestamps, and accumulated playtime; and</li>
        <li>backup manifests and files only when you explicitly create or restore them.</li>
      </ul>
      <p>This information is used to operate your local library, resume games, restore progress, remember preferences, and show storage usage. PocketArc does not use it for behavioral advertising or user profiling.</p>
    </LegalSection>

    <LegalSection number="03" title="Information sent over the network">
      <p>The application downloads its HTML, JavaScript, CSS, fonts, icons, manifest, service worker, EmulatorJS runtime, mGBA core, and catalog metadata from the hosting service. Catalog game files are requested only when you take an explicit action that requires installation or playback.</p>
      <p>User-imported game files and related local saves are not sent to PocketArc servers. PocketArc has no application account system, cloud synchronization, advertising SDK, or product analytics integration in this version.</p>
    </LegalSection>

    <LegalSection number="04" title="Hosting and standard request logs">
      <p>Even though PocketArc itself does not run analytics, the hosting provider and ordinary internet infrastructure may process technical request information such as IP address, approximate location derived from IP address, browser or device information, requested URL, timestamps, diagnostics, and security logs.</p>
      <p>When PocketArc is hosted on Vercel, that processing is governed by the <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">Vercel Privacy Notice</a>. PocketArc does not receive your locally stored ROM or save contents through ordinary static hosting requests.</p>
    </LegalSection>

    <LegalSection number="05" title="Offline caching">
      <p>The service worker caches the application shell and emulator runtime so the installed application can open offline. Imported ROMs remain in IndexedDB rather than the Workbox application cache. Catalog ROMs are not automatically precached with the application shell.</p>
      <p>Removing the PWA icon alone may not erase browser storage. Use PocketArc's storage controls or your browser's site-data settings when you want to remove local information.</p>
    </LegalSection>

    <LegalSection number="06" title="Browser and device capabilities">
      <p>PocketArc may request or use browser capabilities including persistent storage, fullscreen, Screen Wake Lock, Gamepad API access, vibration, file selection, local downloads, and audio playback. These capabilities support features you choose to use and are subject to your browser and operating-system controls.</p>
      <p>PocketArc does not require camera, microphone, contacts, precise location, or notification permission for normal gameplay.</p>
    </LegalSection>

    <LegalSection number="07" title="Sharing and disclosure">
      <p>PocketArc does not sell personal information. It does not intentionally share local library contents with advertisers, data brokers, social networks, or analytics providers. Technical requests may still be handled by the hosting provider and its infrastructure as described above.</p>
      <p>Information may be preserved or disclosed when required by applicable law, a valid legal process, or a necessary response to security abuse or a rights claim.</p>
    </LegalSection>

    <LegalSection number="08" title="Retention and your controls">
      <p>Local information generally remains until you delete an individual game or save, use Clear All Local Data, clear site storage in your browser, remove the relevant browser profile, or the browser evicts data. Exported files remain wherever you choose to save them.</p>
      <p>You can inspect storage usage, export saves or backups, delete games and screenshots, reset settings, and erase PocketArc's local database from within the application. A full deletion cannot be undone unless you created a usable backup.</p>
    </LegalSection>

    <LegalSection number="09" title="Security and device access">
      <p>Keeping game data local reduces transmission, but no browser storage is guaranteed to be secure or permanent. Anyone with access to your unlocked device, browser profile, exported backup, or downloaded save may be able to access that data.</p>
      <p>Use device security, keep your browser updated, avoid importing untrusted files, and store backups in a location appropriate for their sensitivity.</p>
    </LegalSection>

    <LegalSection number="10" title="Children's privacy">
      <p>PocketArc does not knowingly request names, email addresses, account profiles, or other direct identifiers from children. A parent or guardian should supervise use where required and should decide whether locally stored game material is appropriate.</p>
    </LegalSection>

    <LegalSection number="11" title="International use and legal rights">
      <p>Privacy and data-protection rights vary by location. Because most PocketArc data stays inside your browser, the application's deletion and export controls are the primary way to manage it. Hosting providers may offer separate rights-request processes for information they control.</p>
    </LegalSection>

    <LegalSection number="12" title="Policy changes and contact">
      <p>This Policy may be updated when features, hosting, or legal requirements change. Material revisions will receive a new effective date. Continued use after an update means the revised Policy applies to later activity.</p>
      <p>For questions or requests concerning PocketArc, contact the project owner through the portfolio contact channel from which this demonstration was shared. For hosting-provider data, use the contact and rights-request methods in that provider's privacy notice.</p>
    </LegalSection>
  </LegalDocument>
}

function LegalDocument({ children, eyebrow, icon, summary, title }: { children: ReactNode; eyebrow: string; icon: ReactNode; summary: string; title: string }) {
  return <main className={styles.page}>
    <header className={styles.hero}><div className={styles.icon} aria-hidden="true">{icon}</div><p className="code">{eyebrow}</p><h1>{title}</h1><p className={styles.summary}>{summary}</p><p className={styles.effective}>Effective {EFFECTIVE_DATE}</p></header>
    <div className={styles.document}>{children}</div>
    <aside className={styles.localNote}><HardDrive size={18}/><div><strong>Your library stays local</strong><p>Imported ROMs, saves, screenshots, and settings remain in this browser unless you explicitly export them.</p></div></aside>
  </main>
}

function ImportantNotice({ children, title }: { children: ReactNode; title: string }) {
  return <aside className={styles.notice}><AlertTriangle size={18}/><div><h2>{title}</h2><p>{children}</p></div></aside>
}

function LegalSection({ children, number, title }: { children: ReactNode; number: string; title: string }) {
  return <section className={styles.section}><div className={styles.sectionHeading}><span>{number}</span><h2>{title}</h2></div><div className={styles.sectionBody}>{children}</div></section>
}
