/* LoveBot — eingebettete Befehlsdaten (Fallback).
   GENERIERT aus registry/commands.json — nicht von Hand editieren!
   Build: node scripts/build-registry.mjs · 2026-10-21 */
window.LOVEBOT_COMMANDS = [
  {
    "emoji": "🐣",
    "title": "START",
    "slug": "start",
    "cmds": [
      {
        "cmd": "menu",
        "usage": "$menu / $help",
        "desc": "Komplettes Befehls-Informationsmenü",
        "aliases": [
          "help"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "menunew",
        "usage": "$menunew",
        "desc": "Interaktives Single-Select-Menü",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "me",
        "usage": "$me [@user] / $me info|economy|progression|activity",
        "desc": "Dein Profil + fremde Profile per @Mention oder Reply — kompakt + ausführlich mit Economy, Progression, Activity; $me @user zeigt das Profil einer anderen Person",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "whois",
        "usage": "$whois @user",
        "desc": "Öffentlich freigegebenes Profil einer Person ansehen; Privatsphäre-Einstellungen werden beachtet",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "register",
        "usage": "$register",
        "desc": "Anmeldung Name.Alter.Status.Stadt",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "girl",
        "usage": "$girl",
        "desc": "Geschlecht im eigenen Profil als Mädchen speichern",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "boy",
        "usage": "$boy",
        "desc": "Geschlecht im eigenen Profil als Junge speichern",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "setbday",
        "usage": "$setbday TT.MM.JJJJ",
        "desc": "Geburtstag im Profil speichern; Alter wird automatisch berechnet",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "owner",
        "usage": "$owner",
        "desc": "Owner-Kontakt + Visitenkarte",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "love",
        "usage": "$love / $loveprofile / $liebe",
        "desc": "Dein Beziehungs-Panel ❤️",
        "aliases": [
          "loveprofile",
          "liebe"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "socials",
        "usage": "$socials / $links / $links",
        "desc": "Love- & Social-Links 🔗",
        "aliases": [
          "links"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "privacy",
        "usage": "$privacy [stadt|alter|profil an|aus] / $datenschutz",
        "desc": "Privatsphäre steuern 🔒",
        "aliases": [
          "datenschutz"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "unregister",
        "usage": "$unregister → $unregister confirm <code> / $abmelden / $deleteme",
        "desc": "Account selbst löschen: Warnung, Code, Bestätigung, Backup, Events-Anonymisierung 🗑️",
        "aliases": [
          "abmelden",
          "deleteme"
        ],
        "perms": "all",
        "cooldown": 10
      },
      {
        "cmd": "account",
        "usage": "$account / $acc",
        "desc": "Account-Übersicht — Level, Kupfer, Achievements, Inventar",
        "aliases": [
          "acc"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "settings",
        "usage": "$settings [economy an|aus] / $einstellungen",
        "desc": "Einstellungen — Benachrichtigungen, Privacy, Economy-Sichtbarkeit",
        "aliases": [
          "einstellungen"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "🧰",
    "title": "ALLGEMEIN",
    "slug": "allgemein",
    "cmds": [
      {
        "cmd": "ping",
        "usage": "$ping [url | full | nospeed] / $pong / $latenz",
        "desc": "🏓 Ping auf maxichen.de + maxichen.de, Netzwerk & Bot (echte Messwerte)",
        "aliases": [
          "pong",
          "latenz"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "speed",
        "usage": "$speed / $speedtest / $internetspeed",
        "desc": "Großer Internet-Speedtest 🚀",
        "aliases": [
          "speedtest",
          "internetspeed"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "system",
        "usage": "$system / $stats / $sys",
        "desc": "Uptime, Nutzer, Gruppen, RAM",
        "aliases": [
          "stats",
          "sys"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "id",
        "usage": "$id",
        "desc": "Chat-/Gruppen-/Deine IDs",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "username",
        "usage": "$username",
        "desc": "Sender- & Host-Username",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "bio",
        "usage": "$bio / $status",
        "desc": "Bio / Status",
        "aliases": [
          "status"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "devices",
        "usage": "$devices",
        "desc": "Geräte des Kontakts",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "url",
        "usage": "$url",
        "desc": "Link-Analyse",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "hash",
        "usage": "$hash",
        "desc": "Hash berechnen",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "i3",
        "usage": "$i3",
        "desc": "Nachrichten-Debug-Tabelle",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "i4",
        "usage": "$i4",
        "desc": "Komplette Nachricht inklusive Sender-, Kanal- und Newsletter-ID als Code",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "m7",
        "usage": "$m7",
        "desc": "Sendet eine Newsletter-Admin-Einladung für den LoveBot-Kanal inkl. Live-Infos (Abonnenten, Verifizierung, Erstellungsdatum) in den aktuellen Chat",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "i2",
        "usage": "$i2 / $fetch / $i2output",
        "desc": "Code einer zitierten Nachricht",
        "aliases": [
          "fetch",
          "i2output"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "profile",
        "usage": "$profile [@user] / $profil",
        "desc": "Profil ansehen — anderer oder dein eigenes 👤 (kein Alter, keine IDs)",
        "aliases": [
          "profil"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "info",
        "usage": "$info / $info me / $botinfo",
        "desc": "Bot-Info; „me“ zeigt die eigene Account-Übersicht",
        "aliases": [
          "botinfo"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "prodmenu",
        "usage": "$prodmenu / $resendthisprodmenu",
        "desc": "Produktmenü im Chat anzeigen",
        "aliases": [
          "resendthisprodmenu"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "💍",
    "title": "LIEBE & HERZEN",
    "slug": "liebe",
    "cmds": [
      {
        "cmd": "marry",
        "usage": "$marry @user / $heiraten / $propose",
        "desc": "Antrag mit Buttons — 2 Min. gültig, nur der Adressat darf antworten 💍",
        "aliases": [
          "heiraten",
          "propose"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "divorce",
        "usage": "$divorce / $scheidung",
        "desc": "Scheidung einreichen 💔",
        "aliases": [
          "scheidung"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "ship",
        "usage": "$ship @user @user / $lovetest / $loveometer",
        "desc": "Love-o-Meter 💘",
        "aliases": [
          "lovetest",
          "loveometer"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "kiss",
        "usage": "$kiss @user / $kuss",
        "desc": "Küssen 💋",
        "aliases": [
          "kuss"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "hug",
        "usage": "$hug @user / $umarmen",
        "desc": "Umarmen 🤗",
        "aliases": [
          "umarmen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "slap",
        "usage": "$slap @user / $ohrfeige",
        "desc": "Ohrfeigen 🖐️",
        "aliases": [
          "ohrfeige"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "compliment",
        "usage": "$compliment @user / $lob / $kompliment",
        "desc": "Kompliment 🌹",
        "aliases": [
          "lob",
          "kompliment"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "flirt",
        "usage": "$flirt @user",
        "desc": "Flirt-Spruch funken 😘",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "anmachen",
        "usage": "$anmachen @user",
        "desc": "Jemanden anmachen 😏",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "compat",
        "usage": "$compat @user",
        "desc": "Kompatibilität checken 💯",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "confess",
        "usage": "$confess <text> / $geständnis",
        "desc": "Anonymes Geständnis 🤫",
        "aliases": [
          "geständnis"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "confesslove",
        "usage": "$confesslove @user <text>",
        "desc": "Liebe gestehen 💌",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "dateidee",
        "usage": "$dateidee",
        "desc": "Idee für ein Date 💡",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "lovecalc",
        "usage": "$lovecalc @user",
        "desc": "Love-Calculator 💕",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "romantic",
        "usage": "$romantic / $romantisch",
        "desc": "Romantik-Modus 💐",
        "aliases": [
          "romantisch"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "breakup",
        "usage": "$breakup @user / $trennung",
        "desc": "Trennung einreichen 💔",
        "aliases": [
          "trennung"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "marryaccept",
        "usage": "$marryaccept / $marryyes",
        "desc": "Heiratsantrag annehmen ✅",
        "aliases": [
          "marryyes"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "marrydeny",
        "usage": "$marrydeny / $marryno",
        "desc": "Heiratsantrag ablehnen ❌",
        "aliases": [
          "marryno"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "goodmorning",
        "usage": "$goodmorning / $gutenmorgen / $morgen",
        "desc": "Guten-Morgen-Gruß 🌅",
        "aliases": [
          "gutenmorgen",
          "morgen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "goodnight",
        "usage": "$goodnight / $gutenacht / $nacht",
        "desc": "Gute-Nacht-Gruß 🌙",
        "aliases": [
          "gutenacht",
          "nacht"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "nachtzitat",
        "usage": "$nachtzitat / $nightquote / $nq",
        "desc": "Nächtliches Zitat ✨",
        "aliases": [
          "nightquote",
          "nq"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "mood",
        "usage": "$mood [stimmung] / $stimmung",
        "desc": "Deine Stimmung 🎭",
        "aliases": [
          "stimmung"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "partner",
        "usage": "$partner",
        "desc": "Kurzinfo zu deinem Partner 💞",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "dailylove",
        "usage": "$dailylove / $tagesliebe / $liebeimpuls",
        "desc": "Täglicher Love-Impuls 🌹",
        "aliases": [
          "tagesliebe",
          "liebeimpuls"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "liebescheck",
        "usage": "$liebescheck @user",
        "desc": "Süßer Zufalls-Kompatibilitäts-Report des Tages",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "kuschelvorschlag",
        "usage": "$kuschelvorschlag",
        "desc": "Zufallsvorschlag für ein Kuschel-/Date-Ritual",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "komplimentgenerator",
        "usage": "$komplimentgenerator @user",
        "desc": "Generiert ein zufälliges Kompliment",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "💤",
    "title": "AFK & PROFIL",
    "slug": "afk",
    "cmds": [
      {
        "cmd": "afk",
        "usage": "$afk <grund>",
        "desc": "AFK-Status setzen",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "afk off",
        "usage": "$afk off",
        "desc": "AFK beenden",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "afklist",
        "usage": "$afklist",
        "desc": "Alle aktuell AFK",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "check",
        "usage": "$check",
        "desc": "ID/JID/LID prüfen",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "check2",
        "usage": "$check2",
        "desc": "WhatsApp-Ban-Check",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "jid",
        "usage": "$jid @user",
        "desc": "JID auflösen 🆔",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "lid",
        "usage": "$lid @user / $jidlid",
        "desc": "LID auflösen 🆔",
        "aliases": [
          "jidlid"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "ids",
        "usage": "$ids @user",
        "desc": "JID + LID zusammen 🆔",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "👥",
    "title": "GRUPPE & MODERATION",
    "slug": "gruppe",
    "cmds": [
      {
        "cmd": "tagall",
        "usage": "$tagall / $all",
        "desc": "Alle Mitglieder erwähnen",
        "aliases": [
          "all"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "hidetag",
        "usage": "$hidetag <text>",
        "desc": "Unsichtbar alle taggen 🫥",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "poll",
        "usage": "$poll Frage|A|B",
        "desc": "WhatsApp-Umfrage 📊",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "see",
        "usage": "$see / $seestatus / $viewstatus",
        "desc": "Status reposten 📲",
        "aliases": [
          "seestatus",
          "viewstatus"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "tagadmin",
        "usage": "$tagadmin / $admins",
        "desc": "Admins erwähnen",
        "aliases": [
          "admins"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "groups",
        "usage": "$groups",
        "desc": "Gruppen-Tabelle",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "groupinfo",
        "usage": "$groupinfo / $gcinfo / $ginfo / $group",
        "desc": "Riesiger Gruppenbericht: Info, Top, Economy und Gruppenstatus 👥",
        "aliases": [
          "gcinfo",
          "ginfo",
          "group"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "acheck",
        "usage": "$acheck / $admincheck / $allcheck",
        "desc": "Rollen-Check: alle + Bot 🔍",
        "aliases": [
          "admincheck",
          "allcheck"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rules",
        "usage": "$rules <text>",
        "desc": "Regeln anzeigen / setzen",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "gi",
        "usage": "$gi / $features / $featurelist / $gruppenfeatures",
        "desc": "Alle Features + Status 🎛️",
        "aliases": [
          "features",
          "featurelist",
          "gruppenfeatures"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "an",
        "usage": "$an <feature> / $anschalten / $einschalten / $enable",
        "desc": "Feature einschalten ✅",
        "aliases": [
          "anschalten",
          "einschalten",
          "enable"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "aus",
        "usage": "$aus <feature> / $abschalten / $ausschalten / $disable",
        "desc": "Feature ausschalten ❌",
        "aliases": [
          "abschalten",
          "ausschalten",
          "disable"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "autodl",
        "usage": "$autodl on|off / $autodownload",
        "desc": "Auto-Download (YT/TikTok/IG) 📥",
        "aliases": [
          "autodownload"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "setup",
        "usage": "$setup",
        "desc": "Owner: Bot aktivieren + Beschreibung",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "addmeta",
        "usage": "$addmeta",
        "desc": "Meta AI in die Gruppe einladen 🤖",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "kickmeta",
        "usage": "$kickmeta",
        "desc": "Meta AI aus der Gruppe entfernen 🤖",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "activate",
        "usage": "$activate",
        "desc": "Bot aktivieren",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "deactivate",
        "usage": "$deactivate",
        "desc": "Bot deaktivieren",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "kickall",
        "usage": "$kickall",
        "desc": "Nicht-Admins entfernen (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "demoteall",
        "usage": "$demoteall",
        "desc": "Alle Admins in der Gruppe entadminen (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "promoteall",
        "usage": "$promoteall",
        "desc": "Alle Mitglieder in der Gruppe zu Admins machen (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sss",
        "usage": "$sss <name>",
        "desc": "Neue Community-Gruppe erstellen (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "welcome",
        "usage": "$welcome on|off",
        "desc": "Willkommensnachricht",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "goodbye",
        "usage": "$goodbye on|off",
        "desc": "Abschiedsnachricht",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "kick",
        "usage": "$kick <on|off|@user>",
        "desc": "Kick-Nachricht / Nutzer kicken",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "promote",
        "usage": "$promote <on|off|@user>",
        "desc": "Befördern / Nachricht",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "demote",
        "usage": "$demote <on|off|@user>",
        "desc": "De-adminen / Nachricht",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "joinreq",
        "usage": "$joinreq <approve|reject> <JID>",
        "desc": "Beitrittsanfragen annehmen oder ablehnen",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "save",
        "usage": "$save @user",
        "desc": "Gruppen-Admin vor Demote schützen (Hauptowner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "unsave",
        "usage": "$unsave @user / $unsafe",
        "desc": "Admin-Schutz aus save.json entfernen (Hauptowner)",
        "aliases": [
          "unsafe"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "savelist",
        "usage": "$savelist",
        "desc": "Geschützte Admins dieser Gruppe anzeigen (Hauptowner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "warn",
        "usage": "$warn @user <grund>",
        "desc": "Verwarnen",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "unwarn",
        "usage": "$unwarn @user",
        "desc": "Verwarnung entfernen",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "warns",
        "usage": "$warns @user / $warnings",
        "desc": "Verwarnungen anzeigen",
        "aliases": [
          "warnings"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "add",
        "usage": "$add <nummer>",
        "desc": "Nutzer hinzufügen",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "link",
        "usage": "$link / $grouplink",
        "desc": "Gruppen-Einladungslink",
        "aliases": [
          "grouplink"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "revoke",
        "usage": "$revoke / $revokelink",
        "desc": "Einladungslink zurückziehen",
        "aliases": [
          "revokelink"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "setname",
        "usage": "$setname <name> / $gname",
        "desc": "Gruppenname ändern",
        "aliases": [
          "gname"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "setdesc",
        "usage": "$setdesc <text> / $gdesc",
        "desc": "Beschreibung ändern",
        "aliases": [
          "gdesc"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "delete",
        "usage": "$delete / $del",
        "desc": "Zitierte Nachricht löschen",
        "aliases": [
          "del"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "lock",
        "usage": "$lock / $unlock",
        "desc": "Gruppe sperren 🔒 (Admin)",
        "aliases": [
          "unlock"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "am",
        "usage": "$am / $gadmin",
        "desc": "Group Center: Übersicht, Security, XP, Economy 👥",
        "aliases": [
          "gadmin"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "members",
        "usage": "$members / $mitglieder",
        "desc": "Mitgliederliste mit Admins 👥",
        "aliases": [
          "mitglieder"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gxp",
        "usage": "$gxp",
        "desc": "Group-XP, Nachrichten, Aktivität 🏆",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "glevel",
        "usage": "$glevel / $gstufe",
        "desc": "Gruppen-Level + Fortschritt 👥",
        "aliases": [
          "gstufe"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gtop",
        "usage": "$gtop [xp|messages|games]",
        "desc": "Top-Mitglieder (xp/messages/games) 🏆",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gsettings",
        "usage": "$gsettings <feature> <on|off>",
        "desc": "Gruppen-Einstellungen (Admins) ⚙️",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "ggoal",
        "usage": "$ggoal / $gziele",
        "desc": "Tages-/Wochen-Ziele der Gruppe 🎯",
        "aliases": [
          "gziele"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "gevent",
        "usage": "$gevent [multi minuten]",
        "desc": "Group-Events (XP-Multiplikator) 🔥",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "gaudit",
        "usage": "$gaudit / $glog",
        "desc": "Gruppen-Audit-Log 🧾",
        "aliases": [
          "glog"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "geconomy",
        "usage": "$geconomy / $gkasse",
        "desc": "Gruppenkasse + Verlauf 💰",
        "aliases": [
          "gkasse"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "gdonate",
        "usage": "$gdonate <betrag> / $gspenden",
        "desc": "Kupfer an Gruppenkasse spenden 💰",
        "aliases": [
          "gspenden"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gban",
        "usage": "$gban @user [grund]",
        "desc": "Gruppen-Ban (Admins, lokal) 🚫",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "gunban",
        "usage": "$gunban @user",
        "desc": "Gruppen-Entbannung ✅",
        "aliases": [],
        "perms": "admin",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "🛡️",
    "title": "ADMIN & VERIFIKATION",
    "slug": "admin",
    "cmds": [
      {
        "cmd": "dsgvo",
        "usage": "$dsgvo accept/reject / $dsgvo✅ / $dsgvo❌",
        "desc": "DSGVO-Zustimmung",
        "aliases": [
          "dsgvo✅",
          "dsgvo❌"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "kill",
        "usage": "$kill @user",
        "desc": "Spielerisch vor Liebe umhauen 💘",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "cookie",
        "usage": "$cookie accept/necessary/reject",
        "desc": "Cookie-/Speicher-Zustimmung (Tabelle wie im Web-Cookie-Banner)",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "verify",
        "usage": "$verify accept/reject / $verify✅ / $verify❌",
        "desc": "Verifizierung",
        "aliases": [
          "verify✅",
          "verify❌"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "ban",
        "usage": "$ban <id|@user> <grund>",
        "desc": "Botweiter Bann: Kontakt blockieren und die Person aus allen Gruppen werfen; keine PN (Owner) 🚫",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "unban",
        "usage": "$unban <id|@user> <grund> / $unbann",
        "desc": "Botban aufheben und Kontakt entsperren; keine PN, Gruppenbeitritt nicht automatisch (Owner) 🔓",
        "aliases": [
          "unbann"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "banlist",
        "usage": "$banlist",
        "desc": "Wütende Übersicht aller botweit gesperrten Accounts (Owner) 🔥",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "block",
        "usage": "$block <nr|@user>",
        "desc": "Blockieren (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "unblock",
        "usage": "$unblock <nr|@user>",
        "desc": "Entblockieren (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "blocklist",
        "usage": "$blocklist / $blocked",
        "desc": "Blocklist anzeigen (Owner)",
        "aliases": [
          "blocked"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "badword",
        "usage": "$badword add|remove|list|on|off / $badwords",
        "desc": "Badword-Filter (Owner) 🤬",
        "aliases": [
          "badwords"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "blockcase",
        "usage": "$blockcase <befehl> <grund>",
        "desc": "Sperrt einen Befehl bot-weit für alle außer den Owner (Owner) 🚫",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "opencase",
        "usage": "$opencase <befehl>",
        "desc": "Entsperrt einen zuvor mit $blockcase gesperrten Befehl (Owner) 🔓",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "listbc",
        "usage": "$listbc",
        "desc": "Listet alle aktuell gesperrten Befehle mit Grund & Details auf (Owner) 📋",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "fp",
        "usage": "$fp",
        "desc": "Fake Payment",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sleep",
        "usage": "$sleep / $schlaf",
        "desc": "Versetzt Bot und Website in den Schlafmodus; nur der Hauptowner kann ihn wecken 💤",
        "aliases": [
          "schlaf"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "aufstehen",
        "usage": "$aufstehen / $wake / $wakeup",
        "desc": "Weckt Bot und Website aus dem Schlafmodus (nur Hauptowner) 🌅",
        "aliases": [
          "wake",
          "wakeup"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "offline",
        "usage": "$offline <grund>",
        "desc": "Aktiviert den globalen Wartungsmodus — Bot nur noch für den Owner, Website für alle gesperrt mit Grund-Anzeige (Owner) 🛠️",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "online",
        "usage": "$online",
        "desc": "Beendet den globalen Wartungsmodus — Bot & Website wieder für alle offen (Owner) ✅",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "mute",
        "usage": "$mute @user [zeit] [grund] / $stumm",
        "desc": "Owner: User stummschalten — Nachrichten werden gelöscht. Ohne Zeit = permanent. Zeit: 30s/10m/2h/1d/2w.",
        "aliases": [
          "stumm"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "unmute",
        "usage": "$unmute @user / $entstummen",
        "desc": "Owner: Stummschaltung aufheben.",
        "aliases": [
          "entstummen"
        ],
        "perms": "admin",
        "cooldown": 3
      },
      {
        "cmd": "mutelist",
        "usage": "$mutelist / $stummliste",
        "desc": "Owner: Liste aller gemuteten User mit Restdauer.",
        "aliases": [
          "stummliste"
        ],
        "perms": "admin",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "🎨",
    "title": "MEDIEN",
    "slug": "medien",
    "cmds": [
      {
        "cmd": "audio",
        "usage": "$audio <modul>",
        "desc": "Audio-Effekte",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "play",
        "usage": "$play <link|song>",
        "desc": "Media / Song laden",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "typing",
        "usage": "$typing <text> / $loading / $loadingnow",
        "desc": "Lade-Animation",
        "aliases": [
          "loading",
          "loadingnow"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "loadingaiimg",
        "usage": "$loadingaiimg [label]",
        "desc": "Owner: experimentelle Meta-AI-Bild-Ladekarte (Demo, erzeugt kein Bild)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "loadingaivid",
        "usage": "$loadingaivid [label]",
        "desc": "Owner: experimentelle Meta-AI-Video-Ladekarte (Demo, erzeugt kein Video)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "kanal",
        "usage": "$kanal [status | on | off | test] / $channelrelay / $kanalspiegel",
        "desc": "Kanal-Spiegel: alle Kanal-Posts (Bild/Audio/Sticker/Text) automatisch weiterleiten 📡",
        "aliases": [
          "channelrelay",
          "kanalspiegel"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "toimg",
        "usage": "$toimg / $sticker2img",
        "desc": "Zitierten Sticker als Bild ausgeben 🖼️",
        "aliases": [
          "sticker2img"
        ],
        "perms": "all",
        "cooldown": 5
      },
      {
        "cmd": "tomp3",
        "usage": "$tomp3 / $toaudio / $mp3",
        "desc": "Zitiertes Video als MP3 ausgeben 🎵",
        "aliases": [
          "toaudio",
          "mp3"
        ],
        "perms": "all",
        "cooldown": 5
      },
      {
        "cmd": "tomp4",
        "usage": "$tomp4 / $video / $audio2video",
        "desc": "Zitierte Audio als MP4 mit Standbild ausgeben 🎬",
        "aliases": [
          "video",
          "audio2video"
        ],
        "perms": "all",
        "cooldown": 5
      },
      {
        "cmd": "sticker",
        "usage": "$sticker / $stiker / $s",
        "desc": "Zitiertes Bild als Sticker erstellen 🎨 (Pack: LoveBot)",
        "aliases": [
          "stiker",
          "s"
        ],
        "perms": "all",
        "cooldown": 5
      }
    ]
  },
  {
    "emoji": "🎰",
    "title": "SLOT & SPASS",
    "slug": "spass",
    "cmds": [
      {
        "cmd": "slot",
        "usage": "$slot / $spin",
        "desc": "Slot-Machine (App-Look mit Sound)",
        "aliases": [
          "spin"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "slotmini",
        "usage": "$slotmini",
        "desc": "Mini-Slot",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "dice",
        "usage": "$dice / $dice2",
        "desc": "Würfeln",
        "aliases": [
          "dice2"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "coin",
        "usage": "$coin / $münze",
        "desc": "Münzwurf",
        "aliases": [
          "münze"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "random",
        "usage": "$random <a-b>",
        "desc": "Zufallszahl",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "truth",
        "usage": "$truth",
        "desc": "Wahrheit oder…",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "dare",
        "usage": "$dare",
        "desc": "Pflicht…",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "8ball",
        "usage": "$8ball <frage> / $achtball / $frage / $magie",
        "desc": "Magic 8-Ball 🎱",
        "aliases": [
          "achtball",
          "frage",
          "magie"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rps",
        "usage": "$rps stein|papier|schere / $schere",
        "desc": "Schere-Stein-Papier ✊✋✌️",
        "aliases": [
          "schere"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "witz",
        "usage": "$witz / $joke",
        "desc": "Zufälliger Witz 😂",
        "aliases": [
          "joke"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "fakt",
        "usage": "$fakt / $fact / $hundefakt / $katzenfakt",
        "desc": "Zufälliger Fakt 🧠",
        "aliases": [
          "fact",
          "hundefakt",
          "katzenfakt"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "lovequote",
        "usage": "$lovequote / $liebeszitat",
        "desc": "Ein liebevoller Gedanke für den Chat 💌",
        "aliases": [
          "liebeszitat"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "herzensfrage",
        "usage": "$herzensfrage / $herzfrage",
        "desc": "Liebevolle Gesprächsfrage für die Gruppe 🌸",
        "aliases": [
          "herzfrage"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "roast",
        "usage": "$roast @user",
        "desc": "Roasten 🔥",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "eod",
        "usage": "$eod / $entwederoder",
        "desc": "Entweder-oder 🤔",
        "aliases": [
          "entwederoder"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "nie",
        "usage": "$nie / $niehabeich / $neverhaveiever",
        "desc": "Nie habe ich … 🙊",
        "aliases": [
          "niehabeich",
          "neverhaveiever"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "quiz",
        "usage": "$quiz",
        "desc": "Quiz-Frage 🧠",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "reverse",
        "usage": "$reverse <text>",
        "desc": "Text umkehren",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "flip",
        "usage": "$flip <text>",
        "desc": "Text auf den Kopf",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "kaset",
        "usage": "$kaset / $toy",
        "desc": "Mini-Slot-Variante 🎰",
        "aliases": [
          "toy"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "tarot",
        "usage": "$tarot",
        "desc": "Zieht eine zufällige Tarotkarte mit Deutung",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "wortkette",
        "usage": "$wortkette <wort>",
        "desc": "Findet ein Folgewort für das Wortketten-Spiel",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "anagram",
        "usage": "$anagram <wort>",
        "desc": "Mischt die Buchstaben eines Wortes zum Rätseln",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "palindrom",
        "usage": "$palindrom <text>",
        "desc": "Prüft, ob ein Text ein Palindrom ist",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "mathequiz",
        "usage": "$mathequiz",
        "desc": "Kleine Kopfrechenaufgabe zum Mitraten",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "duell",
        "usage": "$duell @user",
        "desc": "Zufalls-Duell zwischen dir und einer anderen Person",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "wuerfelduell",
        "usage": "$wuerfelduell @user / $würfelduell",
        "desc": "Würfelduell 1-6 gegen eine andere Person",
        "aliases": [
          "würfelduell"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "sternzeichen",
        "usage": "$sternzeichen TT.MM.[JJJJ]",
        "desc": "Berechnet das Sternzeichen aus einem Geburtsdatum",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "emoji",
        "usage": "$emoji <text>",
        "desc": "Übersetzt einzelne Wörter in passende Emojis",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "shipname",
        "usage": "$shipname <name1> & <name2>",
        "desc": "Spaßiger Kompatibilitäts-Prozentrechner für zwei Namen",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "entscheide",
        "usage": "$entscheide <A> | <B> | <C> / $entscheiden / $waehle / $wahl / $choice",
        "desc": "🌸 Zwischen Möglichkeiten entscheiden",
        "aliases": [
          "entscheiden",
          "waehle",
          "wahl",
          "choice"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "glück",
        "usage": "$glück [neu] / $glueck / $glueckskeks / $spruch",
        "desc": "🍀 Ein freundlicher Spruch für heute",
        "aliases": [
          "glueck",
          "glueckskeks",
          "spruch"
        ],
        "perms": "all",
        "cooldown": 5
      },
      {
        "cmd": "kampf",
        "usage": "$kampf @user / $battle",
        "desc": "Kampf-Simulation zwischen dir und einem anderen Namen",
        "aliases": [
          "battle"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "teams",
        "usage": "$teams <a, b, c> / $teamlosen",
        "desc": "Lost Teams aus einer Namensliste aus",
        "aliases": [
          "teamlosen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "zahlenraten",
        "usage": "$zahlenraten <1-100> / $zahlenrate",
        "desc": "Zahl erraten mit Serie und Rekord",
        "aliases": [
          "zahlenrate"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "ttt",
        "usage": "$ttt <1-9> / $tictactoe",
        "desc": "Tic-Tac-Toe gegen Love 💜 mit Punktestand",
        "aliases": [
          "tictactoe"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "connect4",
        "usage": "$connect4 <1-7> / $viergewinnt / $4gewinnt",
        "desc": "Vier gewinnt gegen Love 💜 — Stein in die Spalte fallen lassen",
        "aliases": [
          "viergewinnt",
          "4gewinnt"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "mastermind",
        "usage": "$mastermind [1234|status|stop]",
        "desc": "4-stelligen Code aus Ziffern 1–6 knacken 🧠 — 10 Versuche",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "blackjack",
        "usage": "$bj <einsatz> [hit|stand] / $bj",
        "desc": "Blackjack 21 gegen Love 🂱 — nur Spielchips, kein echtes Geld",
        "aliases": [
          "bj"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "zungenbrecher",
        "usage": "$zungenbrecher / $ztb",
        "desc": "Zungenbrecher — dreimal schnell gesagt 👅",
        "aliases": [
          "ztb"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "sprueche",
        "usage": "$sprueche",
        "desc": "Sprichwort des Tages 📜 — stabil pro Tag",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "motivation",
        "usage": "$motivation [kurz] / $motiviert",
        "desc": "Kleiner Motivations-Kick ⚡",
        "aliases": [
          "motiviert"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "💰",
    "title": "ECONOMY",
    "slug": "economy",
    "cmds": [
      {
        "cmd": "daily",
        "usage": "$daily",
        "desc": "Tägliche Belohnung — Kupfer-Serie mit Boni + XP (Level-Ups möglich)",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "work",
        "usage": "$work / $arbeiten",
        "desc": "Arbeiten gehen 💼 — Kupfer + 10 XP 💼",
        "aliases": [
          "arbeiten"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gamble",
        "usage": "$gamble <einsatz|all> / $bet / $wetten",
        "desc": "Kupfer wetten 🎰",
        "aliases": [
          "bet",
          "wetten"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "balance",
        "usage": "$balance / $coins / $wallet / $geld",
        "desc": "Wallet anzeigen 💰",
        "aliases": [
          "coins",
          "wallet",
          "geld"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "top",
        "usage": "$top [ level | xp | weekly | monthly | group ] / $leaderboard / $rangliste / $lb",
        "desc": "Top 10 mit Filtern: Level, Lifetime-XP, Wochen-/Monats-XP & Gruppen-Rangliste 🏆",
        "aliases": [
          "leaderboard",
          "rangliste",
          "lb"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "level",
        "usage": "$level [ @user ] / $lvl / $lv",
        "desc": "Dein komplettes Level-Profil: Level, Prestige, Rang, Titel, XP-Balken & Quellen (+ @user für andere) 📈",
        "aliases": [
          "lvl",
          "lv"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "xp",
        "usage": "$xp / $x",
        "desc": "Dein XP-Kompaktstatus: Level, Balken, Tages-/Wochen-/Monats-XP & Verlauf 💜",
        "aliases": [
          "x"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rank",
        "usage": "$rank [ weekly | monthly | group ] [ @user ] / $rang",
        "desc": "Dein Rang (oder @user) — global/weekly/monthly/group, mit Wochen-Trend 🏅",
        "aliases": [
          "rang"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "progress",
        "usage": "$progress / $fortschritt",
        "desc": "Dein Fortschritt: Level-Balken, Meilenstein-Roadmap, Prestige & alle Ziele 📈",
        "aliases": [
          "fortschritt"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "activity",
        "usage": "$activity / $aktivitaet / $aktivität",
        "desc": "Deine Aktivität: XP-Perioden, aktive Tage/Wochen/Monate & Trends 📅",
        "aliases": [
          "aktivitaet",
          "aktivität"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "records",
        "usage": "$records / $rekorde",
        "desc": "Deine persönlichen Rekorde: Level, Tages-XP, Streak & mehr 🏆",
        "aliases": [
          "rekorde"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "milestones",
        "usage": "$milestones / $meilensteine",
        "desc": "Meilensteine: Level, Lifetime-XP & Streak-Marken ✅/🔒 🎯",
        "aliases": [
          "meilensteine"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "mystats",
        "usage": "$mystats / $stats me / $mystat",
        "desc": "Deine persönlichen Stats: Nachrichten, Spiele, Social & Claims 📊",
        "aliases": [
          "mystat"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "xpsources",
        "usage": "$xpsources / $xpquellen / $xq",
        "desc": "Deine XP-Quellen-Anteile: woher deine Lifetime-XP kommen 📊",
        "aliases": [
          "xpquellen",
          "xq"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "weekly",
        "usage": "$weekly / $woche",
        "desc": "Wochen-Report: 7-Tage-Historie, bester Tag, neue Achievements 🗓️",
        "aliases": [
          "woche"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "monthly",
        "usage": "$monthly / $monat",
        "desc": "Monats-Report: 30-Tage-Historie & neue Achievements 📆",
        "aliases": [
          "monat"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "prestige",
        "usage": "$prestige",
        "desc": "Prestige-Karte: Zyklus, Rest-XP, Belohnungen & Truhe 👑",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "compare",
        "usage": "$compare @user / $vergleich",
        "desc": "Fairer Profil-Vergleich: Level, XP, Streak, Badges ⚔️",
        "aliases": [
          "vergleich"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "bank",
        "usage": "$bank [claim]",
        "desc": "Bank & Zinsen — Kontostand, Kapazität, Tageszins abholen",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "deposit",
        "usage": "$deposit <betrag|all> / $einzahlen",
        "desc": "Einzahlen Wallet → Bank (mit Kapazität)",
        "aliases": [
          "einzahlen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "withdraw",
        "usage": "$withdraw <betrag|all> / $abheben / $auszahlen",
        "desc": "Abheben Bank → Wallet",
        "aliases": [
          "abheben",
          "auszahlen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "economy",
        "usage": "$economy / $eco",
        "desc": "Economy-Überblick — Wallet, Bank, Verdienst, Serie",
        "aliases": [
          "eco"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "transactions",
        "usage": "$transactions [anzahl] / $transaktionen / $tx",
        "desc": "Transaktions-Verlauf (neueste zuerst)",
        "aliases": [
          "transaktionen",
          "tx"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "report",
        "usage": "$report <day|week|month|year|all> / $reports / $berichte",
        "desc": "Zentraler Report — XP + Kupfer + Aktivität + Rang",
        "aliases": [
          "reports",
          "berichte"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "yearly",
        "usage": "$yearly / $jahr",
        "desc": "Jahres-Report: 12 Monate, stärkster Monat, Achievements",
        "aliases": [
          "jahr"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rich",
        "usage": "$rich / $reichsten / $reich",
        "desc": "Reichsten-Liste (Wallet + Bank)",
        "aliases": [
          "reichsten",
          "reich"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "📡",
    "title": "SESSION-CENTER (OWNER)",
    "slug": "session",
    "cmds": [
      {
        "cmd": "sessions",
        "usage": "$sessions",
        "desc": "Alle Sessions mit Status & Uptime 📡 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "session",
        "usage": "$session <id> / $sessioninfo / $sessionstatus",
        "desc": "Details einer Session (Owner)",
        "aliases": [
          "sessioninfo",
          "sessionstatus"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionstats",
        "usage": "$sessionstats <id>",
        "desc": "Nachrichten/Befehle pro Min, RAM, Reconnects (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionhealth",
        "usage": "$sessionhealth",
        "desc": "Health-Check aller Sessions 🩺 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionlogs",
        "usage": "$sessionlogs / $sessionactivity",
        "desc": "Letzte Session-Aktivität 📜 (Owner)",
        "aliases": [
          "sessionactivity"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "newsession",
        "usage": "$newsession <name>",
        "desc": "Neue Session anlegen 🆕 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "startsession",
        "usage": "$startsession <id>",
        "desc": "Gespawnte Session starten 🚀 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "restartsession",
        "usage": "$restartsession <id> / $reloadsession / $reconnectsession",
        "desc": "Session neu starten 🔄 (Owner)",
        "aliases": [
          "reloadsession",
          "reconnectsession"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "killsession",
        "usage": "$killsession <id> / $stopsession",
        "desc": "Verbindung stoppen — Credentials bleiben 🛑 (Owner)",
        "aliases": [
          "stopsession"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "delsession",
        "usage": "$delsession <id>",
        "desc": "Aus Registry entfernen 🗑️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionname",
        "usage": "$sessionname <id> <name> / $sessionrename",
        "desc": "Session umbenennen ✏️ (Owner)",
        "aliases": [
          "sessionrename"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessiondefault",
        "usage": "$sessiondefault <id>",
        "desc": "Standard-Session setzen ⭐ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionqr",
        "usage": "$sessionqr / $sessioncode / $sessionpair",
        "desc": "Wo QR/Pairing-Code erscheinen 📱 (Owner)",
        "aliases": [
          "sessioncode",
          "sessionpair"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionprofile",
        "usage": "$sessionprofile <id>",
        "desc": "Profil: Präfix, Theme, Feature-Overrides ⚙️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionset",
        "usage": "$sessionset <id> <key> <wert>",
        "desc": "prefix/language/theme/mode setzen (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionfeature",
        "usage": "$sessionfeature <id> <f> <on|off|inherit>",
        "desc": "Feature-Override pro Session 🧩 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionclone",
        "usage": "$sessionclone <id> <name>",
        "desc": "Session klonen — nur Profil, nie Credentials 🧬 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionexport",
        "usage": "$sessionexport <id> / $sessionbackup",
        "desc": "Registry-Export als JSON 📦 (Owner)",
        "aliases": [
          "sessionbackup"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionmaintenance",
        "usage": "$sessionmaintenance <id> <on|off>",
        "desc": "Wartungsmodus 🛠️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionevents",
        "usage": "$sessionevents <id>",
        "desc": "Events einer Session 📜 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionerrors",
        "usage": "$sessionerrors <id>",
        "desc": "Fehler einer Session 🐞 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessiongroups",
        "usage": "$sessiongroups <id>",
        "desc": "Gruppen-Zähler 👥 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionmessages",
        "usage": "$sessionmessages <id>",
        "desc": "Nachrichten-Zähler 💬 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessioncommands",
        "usage": "$sessioncommands <id>",
        "desc": "Befehls-Zähler ⚡ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "pausesession",
        "usage": "$pausesession <id>",
        "desc": "Pausieren ⏸️ — Credentials bleiben (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "resumesession",
        "usage": "$resumesession <id>",
        "desc": "Session reaktivieren ▶️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionautostart",
        "usage": "$sessionautostart <id> <on|off>",
        "desc": "Auto-Start nach Neustart ⚡ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessiontags",
        "usage": "$sessiontags <id> <tags…>",
        "desc": "Tags setzen 🏷️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionenv",
        "usage": "$sessionenv <id> <prod|test|dev>",
        "desc": "Environment setzen 🧪 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "fleet",
        "usage": "$fleet",
        "desc": "Fleet: Managed vs Running vs Paused 📡 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "restartfailed",
        "usage": "$restartfailed",
        "desc": "Fehlgeschlagene Sessions neu starten 🔄 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "orphansessions",
        "usage": "$orphansessions / $sessionorphans",
        "desc": "Phantom-Ordner finden 👻 (Owner)",
        "aliases": [
          "sessionorphans"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "cmdinfo",
        "usage": "$cmdinfo <befehl>",
        "desc": "Registry-Info zu einem Befehl (Aliase, Rechte, Usage) 📚 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "cmdsuche",
        "usage": "$cmdsuche <begriff> / $cmdsearch",
        "desc": "Befehle in der Registry durchsuchen 🔎 (Owner)",
        "aliases": [
          "cmdsearch"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "pairing",
        "usage": "$pairing",
        "desc": "Wo Pairing-Codes erscheinen (nur Terminal/Dashboard — nie im Chat) 🔐 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "sessionusers",
        "usage": "$sessionusers <id>",
        "desc": "Nutzer-Übersicht einer Session 👥 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "💖",
    "title": "LOVEPLUS (NEU)",
    "slug": "loveplus",
    "cmds": [
      {
        "cmd": "relationship",
        "usage": "$relationship / $beziehung / $couple / $paare / $ehe",
        "desc": "Eure Beziehung: Tage, Love-XP, Treue, Jahrestag ❤️",
        "aliases": [
          "beziehung",
          "couple",
          "paare",
          "ehe"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "lovebonus",
        "usage": "$lovebonus / $hearts",
        "desc": "Täglicher Love-Bonus + Streak 🔥 (Paare: doppel!)",
        "aliases": [
          "hearts"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "coupletop",
        "usage": "$coupletop / $lovetop",
        "desc": "Die stärksten Paare des Bots 💞",
        "aliases": [
          "lovetop"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "pet",
        "usage": "$pet create <name> / $haustier",
        "desc": "Haustier adoptieren 🐶 (kostenlos!)",
        "aliases": [
          "haustier"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "pet status",
        "usage": "$pet",
        "desc": "Wie geht es deinem Haustier? 🐾",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "pet feed",
        "usage": "$pet feed",
        "desc": "Füttern 🍖 · Spielen 🎾 · Schlafen 😴",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "pet name",
        "usage": "$pet name <name>",
        "desc": "Haustier umbenennen ✏️",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "shop",
        "usage": "$shop / $laden",
        "desc": "Love-Shop: Rosen, Teddys, Ringe 🛍️",
        "aliases": [
          "laden"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "buy",
        "usage": "$buy <item> / $kaufen",
        "desc": "Item kaufen (z. B. $buy rose) 🛒",
        "aliases": [
          "kaufen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "inv",
        "usage": "$inv / $inventory / $inventar",
        "desc": "Dein Inventar 📦",
        "aliases": [
          "inventory",
          "inventar"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gift",
        "usage": "$gift @user <item> / $schenken",
        "desc": "Geschenk verschenken 🎁",
        "aliases": [
          "schenken"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "pay",
        "usage": "$pay @user <betrag> / $transfer / $überweisen",
        "desc": "Kupfer überweisen 🪙",
        "aliases": [
          "transfer",
          "überweisen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rob",
        "usage": "$rob @user / $raub",
        "desc": "Kupfer rauben (40% Chance, 1h Cooldown) 😈",
        "aliases": [
          "raub"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "letter",
        "usage": "$letter @user [stil] / $liebesbrief",
        "desc": "Liebesbrief 💌 (romantisch/suess/lustig)",
        "aliases": [
          "liebesbrief"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "achievements",
        "usage": "$achievements [ all ] / $erfolge",
        "desc": "Deine Erfolge 🏆 (120 Achievements, 14 Kategorien, 5 Tiers — all zeigt Fortschritt & Gesperrtes)",
        "aliases": [
          "erfolge"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "hangman",
        "usage": "$hangman [buchstabe|status|stop] / $galgen / $galgenmann",
        "desc": "Galgenmännchen rund um die Liebe 🪢 — Wörter raten, 9 Fehler erlaubt",
        "aliases": [
          "galgen",
          "galgenmann"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "riddle",
        "usage": "$riddle [antwort|tipp] / $raetsel",
        "desc": "Rätsel-Runde mit Kupfer-Belohnung 🧠",
        "aliases": [
          "raetsel"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "wouldyou",
        "usage": "$wouldyou / $wuerdestdu / $würdestdu",
        "desc": "Würdest du eher …? 🤔",
        "aliases": [
          "wuerdestdu",
          "würdestdu"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "horoskop",
        "usage": "$horoskop <zeichen> / $horoscope",
        "desc": "Tageshoroskop 🔮",
        "aliases": [
          "horoscope"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "couplestats",
        "usage": "$couplestats / $paarestats",
        "desc": "Couple-Stats: Love-XP, Level, Streak 💑",
        "aliases": [
          "paarestats"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "anniversary",
        "usage": "$anniversary / $jahrestag",
        "desc": "Jahrestag + Meilensteine 📅",
        "aliases": [
          "jahrestag"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rewards",
        "usage": "$rewards / $belohnungen",
        "desc": "Level-Rewards & Meilensteine + Truhen + Reward-Historie 🎁",
        "aliases": [
          "belohnungen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "notif",
        "usage": "$notif [typ] [an|aus] / $notifications",
        "desc": "Benachrichtigungs-Einstellungen (Level-Up, Streak, Daily …) 🔔",
        "aliases": [
          "notifications"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "badges",
        "usage": "$badges",
        "desc": "Deine Badge-Vitrine: 39 Badges in 6 Bereichen, mit Stufen & Fortschritt 🏅",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "reward",
        "usage": "$reward claim [ id ]",
        "desc": "Truhen ansehen & abholen — einmalig, kein Doppel-Claim 🎁",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "🌐",
    "title": "INTERNET & FAKTEN",
    "slug": "fakten",
    "cmds": [
      {
        "cmd": "wiki",
        "usage": "$wiki <begriff>",
        "desc": "Wikipedia (de) 📖",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "catfact",
        "usage": "$catfact",
        "desc": "Katzen-Fakt 🐱",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "dogfact",
        "usage": "$dogfact",
        "desc": "Hunde-Fakt 🐶",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "github",
        "usage": "$github owner/repo",
        "desc": "Repo-Infos 🐙",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "remind",
        "usage": "$remind <zeit> <text>",
        "desc": "Erinnerung ⏰",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "advice",
        "usage": "$advice / $lebensrat",
        "desc": "Zufälliger Lebensrat (adviceslip.com)",
        "aliases": [
          "lebensrat"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "chucknorris",
        "usage": "$chucknorris",
        "desc": "Zufälliger Chuck-Norris-Witz (api.chucknorris.io)",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "kanye",
        "usage": "$kanye",
        "desc": "Zufälliges Zitat (api.kanye.rest)",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "langeweile",
        "usage": "$activity",
        "desc": "Zufällige Aktivität gegen Langeweile 🎲",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "iss",
        "usage": "$iss",
        "desc": "Aktuelle Live-Position der ISS im Orbit",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "meineip",
        "usage": "$meineip / $meinip",
        "desc": "Öffentliche IP-Adresse des Bot-Servers",
        "aliases": [
          "meinip"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "githubzen",
        "usage": "$githubzen",
        "desc": "Zufälliger GitHub-Design-Leitsatz",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "http",
        "usage": "$http <code> / $httpcode / $statuscode / $code",
        "desc": "🌐 HTTP-Statuscode erklären (alle offiziellen Codes, z. B. $http 404)",
        "aliases": [
          "httpcode",
          "statuscode",
          "code"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "👑",
    "title": "OWNER TOOLS",
    "slug": "ownertools",
    "cmds": [
      {
        "cmd": "addowner",
        "usage": "$addowner @user <name> / $addowmer",
        "desc": "Zusatz-Owner eintragen 👑",
        "aliases": [
          "addowmer"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "delowner",
        "usage": "$delowner @user / $delowner <name> / $delowmer / $removeowner",
        "desc": "Zusatz-Owner per Erwähnung oder Name entfernen",
        "aliases": [
          "delowmer",
          "removeowner"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "ownerlist",
        "usage": "$ownerlist / $ownerliste",
        "desc": "Alle Owner anzeigen",
        "aliases": [
          "ownerliste"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "bc",
        "usage": "$bc <text>",
        "desc": "Broadcast an alle Gruppen 📢",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "setppbot",
        "usage": "$setppbot / $setbotpp / $setpp",
        "desc": "Bot-Profilbild setzen 🖼️",
        "aliases": [
          "setbotpp",
          "setpp"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "setbotname",
        "usage": "$setbotname <name>",
        "desc": "Bot-Namen ändern 🏷️",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "leave",
        "usage": "$leave / $out / $botleave",
        "desc": "Gruppe verlassen 🚪",
        "aliases": [
          "out",
          "botleave"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "setrang",
        "usage": "$setrang @user <rang> / $setrank",
        "desc": "Rang vergeben 👑 (Owner)",
        "aliases": [
          "setrank"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "getrang",
        "usage": "$getrang @user",
        "desc": "Rang abfragen 🔎 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "delrang",
        "usage": "$delrang @user",
        "desc": "Rang entfernen 🗑️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "removerang",
        "usage": "$removerang @user",
        "desc": "Rang entfernen (alternative Variante) 🗑️ (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "rangs",
        "usage": "$rangs",
        "desc": "Alle Ränge anzeigen 🏅 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "cleartmp",
        "usage": "$cleartmp",
        "desc": "Temp-Dateien aufräumen 🧹 (Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "givexp",
        "usage": "$givexp @user <anzahl> <grund>",
        "desc": "XP geben (Owner, auditiert, mit Rollback) 🛠️",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "takexp",
        "usage": "$takexp @user <anzahl> <grund>",
        "desc": "XP abziehen ohne Level-Down (Owner, auditiert) 🛠️",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "xprollback",
        "usage": "$xprollback @user",
        "desc": "Letztes Admin-Adjust rückgängig (Owner, auditiert) ↩️",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "unlockach",
        "usage": "$unlockach @user <achievement-id> / $unlockachievement",
        "desc": "Achievement manuell vergeben (Owner, auditiert) 🔓",
        "aliases": [
          "unlockachievement"
        ],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "givecoins",
        "usage": "$givecoins @person <anzahl> [bank] <grund>",
        "desc": "Kupfer geben (Owner, auditiert, mit Rollback)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "takecoins",
        "usage": "$takecoins @person <anzahl> [bank] <grund>",
        "desc": "Kupfer abziehen (Owner, auditiert, mit Rollback)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "coinrollback",
        "usage": "$coinrollback @person",
        "desc": "Kupfer-Adjust rückgängig (Owner, auditiert)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "effect",
        "usage": "$effect / $efect / $effekt",
        "desc": "Baut die Hello-Kitty-Baby-Community: Name, Beschreibung, Bild + Gruppen in der Community (NUR Haupt-Owner)",
        "aliases": [
          "efect",
          "effekt"
        ],
        "perms": "owner",
        "cooldown": 15
      },
      {
        "cmd": "bl",
        "usage": "$bl",
        "desc": "Fügt den Haupt-Owner zu allen möglichen Gruppen hinzu, sendet Gruppenlinks privat und lässt den Bot Gruppen mit zugestelltem Link verlassen (NUR Haupt-Owner)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 60
      },
      {
        "cmd": "ao",
        "usage": "$ao [alle|aus] / $autoapprove / $joinauto",
        "desc": "Genehmigt jede Beitrittsanfrage automatisch: in der Community des Chats, in dieser Gruppe, oder mit »alle« überall (NUR Haupt-Owner)",
        "aliases": [
          "autoapprove",
          "joinauto"
        ],
        "perms": "owner",
        "cooldown": 10
      },
      {
        "cmd": "bd",
        "usage": "$bd / $bdoff / $joinapprovaloff",
        "desc": "Deaktiviert die Beitrittsanfrage-Genehmigung in den Einstellungen aller Gruppen der Community, in der der Befehl fällt (NUR Haupt-Owner)",
        "aliases": [
          "bdoff",
          "joinapprovaloff"
        ],
        "perms": "owner",
        "cooldown": 10
      },
      {
        "cmd": "gb",
        "usage": "$gb / $gbsettings / $groupsettings",
        "desc": "Setzt die Gruppen-Einstellungen aller Community-Gruppen: Bearbeiten nur Admins, Schreiben alle, Hinzufügen alle, Verlauf an, Genehmigung aus (NUR Haupt-Owner)",
        "aliases": [
          "gbsettings",
          "groupsettings"
        ],
        "perms": "owner",
        "cooldown": 10
      },
      {
        "cmd": "holiday",
        "usage": "$holiday [status|liste|test] / $feiertag / $geburtstag",
        "desc": "🎂🎄 Geburtstage & Feiertage: Stand, alle Termine oder Probelauf (nur Owner)",
        "aliases": [
          "feiertag",
          "geburtstag"
        ],
        "perms": "owner",
        "cooldown": 5
      },
      {
        "cmd": "stil",
        "usage": "$stil [neutral|happy|aus|kitty an|aus|deko an|aus] / $style / $botstil",
        "desc": "🎀 Stil des Bots: sachlich oder fröhlich, pinker Mädchen-Stil, Schleife (nur Owner)",
        "aliases": [
          "style",
          "botstil"
        ],
        "perms": "owner",
        "cooldown": 5
      },
      {
        "cmd": "autoreaktion",
        "usage": "$autoreaktion an|aus / $autoreact / $reaktionen",
        "desc": "🔇 Automatische Emoji-Reaktionen ein- oder ausschalten (nur Owner)",
        "aliases": [
          "autoreact",
          "reaktionen"
        ],
        "perms": "owner",
        "cooldown": 5
      }
    ]
  },
  {
    "emoji": "🧭",
    "title": "ALLTAG & WEB",
    "slug": "alltag",
    "cmds": [
      {
        "cmd": "wetter",
        "usage": "$wetter <stadt> / $weather",
        "desc": "Wetter live (Open-Meteo) 🌤️",
        "aliases": [
          "weather"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "währung",
        "usage": "$währung <betrag> <von> [nach] / $waehrung / $currency / $cur / $wechselkurs",
        "desc": "Währungen umrechnen (EZB-Kurse) 💱",
        "aliases": [
          "waehrung",
          "currency",
          "cur",
          "wechselkurs"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "übersetze",
        "usage": "$übersetze <sprache> <text> / $uebersetze / $translate / $tr",
        "desc": "Text übersetzen (MyMemory) 🌍",
        "aliases": [
          "uebersetze",
          "translate",
          "tr"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "qr",
        "usage": "$qr <text> / $qrcode",
        "desc": "QR-Code erzeugen (goqr.me) 🔳",
        "aliases": [
          "qrcode"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "kurz",
        "usage": "$kurz <url> / $kuerz / $short / $shorten / $tiny",
        "desc": "Link kürzen (TinyURL/is.gd) 🔗",
        "aliases": [
          "kuerz",
          "short",
          "shorten",
          "tiny"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "passwort",
        "usage": "$passwort [länge] / $password / $pw / $pwd",
        "desc": "Sicheres Zufalls-Passwort 🔐",
        "aliases": [
          "password",
          "pw",
          "pwd"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "🧰",
    "title": "WERKZEUGE & UTILITIES",
    "slug": "tools",
    "cmds": [
      {
        "cmd": "date",
        "usage": "$date / $today",
        "desc": "Datum & Uhrzeit",
        "aliases": [
          "today"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "calc",
        "usage": "$calc <ausdruck>",
        "desc": "Rechner",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "b64",
        "usage": "$b64 <text>",
        "desc": "Base64 en-/dekodieren",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "upper",
        "usage": "$upper <text>",
        "desc": "GROSSBUCHSTABEN",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "lower",
        "usage": "$lower <text>",
        "desc": "kleinbuchstaben",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "length",
        "usage": "$length <text> / $len",
        "desc": "Zeichen-/Wortanzahl",
        "aliases": [
          "len"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "invisible",
        "usage": "$invisible",
        "desc": "Unsichtbare Zeile",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "quote",
        "usage": "$quote / $zitat",
        "desc": "Zitat des Tages",
        "aliases": [
          "zitat"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "say",
        "usage": "$say <text>",
        "desc": "Bot spricht für dich",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "pfp",
        "usage": "$pfp @user / $profilepic",
        "desc": "Profilbild anzeigen",
        "aliases": [
          "profilepic"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "type",
        "usage": "$type <jid>",
        "desc": "JID-Typ prüfen",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "gits",
        "usage": "$gits / $repo",
        "desc": "Nützliche GitHub-Repos",
        "aliases": [
          "repo"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "join",
        "usage": "$join <link>",
        "desc": "Gruppe beitreten",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      },
      {
        "cmd": "bmi",
        "usage": "$bmi <kg> <cm>",
        "desc": "Berechnet deinen Body-Mass-Index",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "countdown",
        "usage": "$countdown TT.MM.JJJJ",
        "desc": "Zeigt die Tage bis zu einem Datum",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "tagderwoche",
        "usage": "$tagderwoche TT.MM.JJJJ",
        "desc": "Berechnet den Wochentag eines Datums",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "zeitzone",
        "usage": "$zeitzone <stadt>",
        "desc": "Zeigt die aktuelle Uhrzeit in einer Zeitzone",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "notiz",
        "usage": "$notiz [liste|loeschen <Nr>|alle loeschen|<Text>] / $notizen / $note",
        "desc": "📝 Persönliche Notizen anlegen, ansehen und loeschen",
        "aliases": [
          "notizen",
          "note"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "erinner",
        "usage": "$erinner [liste|loeschen <Nr>|<Zeitpunkt> - <Text>] / $erinnerung / $reminder",
        "desc": "⏰ Erinnerung stellen (in 10 Minuten, morgen 9:30, 12.03. 18:00)",
        "aliases": [
          "erinnerung",
          "reminder"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "umfrage",
        "usage": "$umfrage [Frage | Antwort 1 | Antwort 2 | stimme <Nr> | ergebnis | ende] / $abstimmung / $vote",
        "desc": "📊 Umfrage starten, abstimmen und auswerten",
        "aliases": [
          "abstimmung",
          "vote"
        ],
        "perms": "all",
        "cooldown": 4
      },
      {
        "cmd": "rechner",
        "usage": "$rechner <Term> / $rechne / $mathe",
        "desc": "🧮 Terme ausrechnen (Klammern, Potenzen, Wurzel, pi)",
        "aliases": [
          "rechne",
          "mathe"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "umrechnen",
        "usage": "$umrechnen <Zahl> <von> in <zu> / $umrechne / $convert / $einheit / $einheiten",
        "desc": "📐 Einheiten umrechnen (Länge, Gewicht, Temperatur, Zeit)",
        "aliases": [
          "umrechne",
          "convert",
          "einheit",
          "einheiten"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "teile",
        "usage": "$teile <Betrag> <Personen> [Trinkgeld %] / $splitten / $rechnung",
        "desc": "💶 Rechnung gerecht aufteilen",
        "aliases": [
          "splitten",
          "rechnung"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "farbe",
        "usage": "$farbe <Hex|RGB|Name> / $color / $colour",
        "desc": "🎨 Farbe erklären: Hex, RGB, HSL und passende Schriftfarbe",
        "aliases": [
          "color",
          "colour"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "prozent",
        "usage": "$prozent <Rechnung> / $procent / $prozentrechnung",
        "desc": "📊 Prozent rechnen (19 % von 84 · 12 von 80 · 84 + 19 %)",
        "aliases": [
          "procent",
          "prozentrechnung"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "ascii",
        "usage": "$ascii <text> / $banner",
        "desc": "Text als großes ASCII-Banner",
        "aliases": [
          "banner"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "rot13",
        "usage": "$rot13 <text>",
        "desc": "Buchstaben um 13 Stellen verschieben (umkehrbar)",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "umkehren",
        "usage": "$umkehren <text> / $spiegel",
        "desc": "Text rückwärts ausgeben",
        "aliases": [
          "spiegel"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "wortzaehler",
        "usage": "$wortzaehler <text> / $wortzahl",
        "desc": "Wörter, Zeichen und Sätze zählen",
        "aliases": [
          "wortzahl"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "promille",
        "usage": "$promille <ml> <%> <kg> [h]",
        "desc": "Promille schätzen (Widmark) — nur Schätzung, mit Warnung",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "stopuhr",
        "usage": "$stopuhr [start|stop|status|reset] / $stoppuhr",
        "desc": "Stoppuhr mit Start, Stop, Status und Reset ⏱️",
        "aliases": [
          "stoppuhr"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "alter",
        "usage": "$alter <geburtsdatum>",
        "desc": "Exaktes Alter in Jahren/Monaten/Tagen + Tage bis zum Geburtstag 🎂",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "todo",
        "usage": "$todo [text|fertig <nr>|del <nr>|clear]",
        "desc": "Persönliche Aufgabenliste mit Erledigt-Status ✅",
        "aliases": [],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "changelog",
        "usage": "$changelog / $neu",
        "desc": "Was ist neu im Bot? Die letzten Änderungen 🆕",
        "aliases": [
          "neu"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "kw",
        "usage": "$kw / $kalenderwoche",
        "desc": "Kalenderwoche mit Wochen- und Jahres-Fortschritt 📅",
        "aliases": [
          "kalenderwoche"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "farbverlauf",
        "usage": "$farbverlauf [alle] / $gradient",
        "desc": "CSS-Farbverlauf zum Kopieren 🎨 — 12 Paletten",
        "aliases": [
          "gradient"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "✨",
    "title": "FULL-UPDATE 2026",
    "slug": "fullupdate",
    "cmds": [
      {
        "cmd": "münzwurf",
        "usage": "$münzwurf / $muenzwurf",
        "desc": "Kopf oder Zahl — der Münzwurf entscheidet 🪙",
        "aliases": [
          "muenzwurf"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "würfel",
        "usage": "$würfel [anzahl] / $wuerfel",
        "desc": "Würfeln — 1–6 Würfel gleichzeitig 🎲",
        "aliases": [
          "wuerfel"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "scheresteinpapier",
        "usage": "$scheresteinpapier <schere|stein|papier> / $sps / $steinpapierschere",
        "desc": "Schere-Stein-Papier gegen den Bot ✂️🪨📄",
        "aliases": [
          "sps",
          "steinpapierschere"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "wahrheitoderpflicht",
        "usage": "$wahrheitoderpflicht [@user] / $wop",
        "desc": "Wahrheit oder Pflicht — der Klassiker 🎭",
        "aliases": [
          "wop"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "mantra",
        "usage": "$mantra / $affirmation / $affirmationen",
        "desc": "Positives Mantra für den Tag 🕯️",
        "aliases": [
          "affirmation",
          "affirmationen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "lottoschein",
        "usage": "$lottoschein / $lotto",
        "desc": "Lotto-Tipp: 6 aus 49 + Superzahl 🎟️",
        "aliases": [
          "lotto"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "zufallszahl",
        "usage": "$zufallszahl [min] [max] / $zufall",
        "desc": "Zufallszahl zwischen zwei Werten 🔢",
        "aliases": [
          "zufall"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "morse",
        "usage": "$morse <text> / $morsen",
        "desc": "Text in Morsecode umwandeln 📡",
        "aliases": [
          "morsen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "schicksal",
        "usage": "$schicksal [frage] / $omen",
        "desc": "Das Orakel antwortet 🔮",
        "aliases": [
          "omen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "geschenkidee",
        "usage": "$geschenkidee [für wen] / $geschenk",
        "desc": "Persönliche Geschenk-Idee 🎁",
        "aliases": [
          "geschenk"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "essen",
        "usage": "$essen / $kochen",
        "desc": "Essens-Idee für heute 🍽️",
        "aliases": [
          "kochen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "entspannung",
        "usage": "$entspannung / $entspanne / $atemuebung",
        "desc": "1-Minuten-Atemübung & Mini-Auszeit 🌿",
        "aliases": [
          "entspanne",
          "atemuebung"
        ],
        "perms": "all",
        "cooldown": 3
      }
    ]
  },
  {
    "emoji": "🎫",
    "title": "Support",
    "slug": "support",
    "cmds": [
      {
        "cmd": "ticket",
        "usage": "$ticket <anliegen> / $ticket info <id> / $support / $ticket erstellen",
        "desc": "Support-Ticket erstellen: $ticket <Anliegen> — Team antwortet per DM. info/answer/close für Team.",
        "aliases": [
          "support",
          "ticket erstellen"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "tickets",
        "usage": "$tickets [offen|geschlossen] / $ticketliste",
        "desc": "Team: Ticket-Übersicht (offen/geschlossen) mit Statistik.",
        "aliases": [
          "ticketliste"
        ],
        "perms": "all",
        "cooldown": 3
      },
      {
        "cmd": "setteam",
        "usage": "$setteam @person <rang>",
        "desc": "Owner: Rang vergeben ($setteam @person stellvertretender inhaber|admin|supporter|user)",
        "aliases": [],
        "perms": "owner",
        "cooldown": 3
      }
    ]
  }
];
