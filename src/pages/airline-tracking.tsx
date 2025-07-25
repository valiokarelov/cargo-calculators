import React, { useState, useMemo } from 'react';

// Sample airline data - you can expand this to 200 airlines
const airlines = [
  { id: 1, name: "001 AA American Airlines", url: "https://www.aacargo.com/AACargo/tracking" },
  { id: 2, name: "003 2C CMA CGM Air Cargo", url: "https://pathfinder.digitalfactory.aero/#/" },
  { id: 3, name: "006 DL Delta Airlines", url: "https://www.deltacargo.com/Cargo/" },
  { id: 4, name: "014 AC Air Canada", url: "https://www.aircanada.com/cargo/tracking" },
  { id: 5, name: "016 UA United Airlines", url: "https://www.unitedcargo.com/en/us/track/index.html" },
  { id: 6, name: "020 LH Lufthansa Cargo", url: "https://www.lufthansa-cargo.com/en/eservices/etracking" },
  { id: 7, name: "023 FX FedEx", url: "https://www.fedex.com/fedextrack/" },
  { id: 8, name: "027 AS Alaska Airlines", url: "https://www.alaskacargo.com/" },
  { id: 9, name: "043 KA Dragonair", url: "https://www.cathaycargo.com/en-us/track-and-trace.html" },
  { id: 10, name: "044 AR Aerolineas Argentinas", url: "https://cargo.aerolineas.com.ar/en-us" },
  { id: 11, name: "045 LA LAN Airlines (LATAM)", url: "https://www.latamcargo.com/en/" },
  { id: 12, name: "047 TP TAP Portugal", url: "https://www.tapcargo.com/pt" },
  { id: 13, name: "050 OA Olympic Airways", url: "https://www.olympicair.com/en/customerhelp/" },
  { id: 14, name: "053 EI Aer Lingus", url: "https://www.iagcargo.com/en/home/" },
  { id: 15, name: "055 AZ ITA Airways Cargo (AlItalia)", url: "https://booking.ita-airways-cargo.com/#/trackAndTrace" },
  { id: 16, name: "057 AF Air France Cargo", url: "https://www.afklcargo.com/mycargo/shipment/singlesearch" },
  { id: 17, name: "061 HM Air Seychelles", url: "https://www.airseychelles.com/en/cargo" },
  { id: 18, name: "064 OK Czech Airlines", url: "https://www.skyteam.com/en/cargo/track-shipment/" },
  { id: 19, name: "065 SV Saudi Arabian Airline", url: "https://www.saudiacargo.com/" },
  { id: 20, name: "071 ET Ethiopian Airlines", url: "https://cargo.ethiopianairlines.com/" },
  { id: 21, name: "072 GF Gulf Air", url: "https://www.gulfair.com/cargo" },
  { id: 22, name: "074 KL KLM Cargo", url: "https://www.afklcargo.com/mycargo/shipment/singlesearch" },
  { id: 23, name: "075 IB Iberia", url: "https://www.iagcargo.com/" },
  { id: 24, name: "076 ME Middle East Airlines", url: "https://www.mea.com.lb/english/Plan-and-Book/Cargo" },
  { id: 25, name: "077 MS Egyptair", url: "http://egyptair-cargo.com/home.htm" },
  { id: 26, name: "079 PR Philippine Airlines", url: "https://cargo.pal.com.ph/Account/PRLogin.cshtml#tracking" },
  { id: 27, name: "080 LO LOT Polish Airlines", url: "https://cargo-tracking.lot.com/" },
  { id: 28, name: "081 QF Qantas Airways", url: "https://freight.qantas.com/online-tracking.html" },
  { id: 29, name: "082 SN Brussels Airlines", url: "https://www.freight.aero/tracking.asp" },
  { id: 30, name: "083 SA South African Airways", url: "https://www.flysaa.com/about-us/leading-carrier/saa-cargo/track-a-shipment" },
  { id: 31, name: "086 NZ Air New Zealand", url: "https://www.airnewzealandcargo.com/cargo-track-and-trace" },
  { id: 32, name: "091 I5 AirAsia India", url: "https://airasiaindia.cargoflash.com/Tracking/AWB" },
  { id: 33, name: "096 IR Iran Air", url: "https://www.freight.aero/tracking.asp" },
  { id: 34, name: "098 AI Air India", url: "https://www.airindia.com/in/en/book/cargo/cargo-tracking.html" },
  { id: 35, name: "105 AY Finnair", url: "https://cargo.finnair.com/api/offerandorder/#/home/find-offer" },
  { id: 36, name: "106 BW Caribbean Airlines", url: "https://cargo.caribbean-airlines.com/#/track" },
  { id: 37, name: "108 FI Icelandair", url: "http://www.icelandaircargo.com/tools/track-and-trace/" },
  { id: 38, name: "114 LY EL AL", url: "https://www.elal.com/en/Cargo/Pages/Online-Tracking.aspx" },
  { id: 39, name: "115 JU Air Serbia (JAT)", url: "https://www.freight.aero/tracking.asp" },
  { id: 40, name: "117 SK SAS-Scandinavian Airlines System", url: "https://www.sascargo.com/en/Booking/Track-Shipment" },
  { id: 41, name: "118 DT TAAG Angola Airlines", url: "https://www.freight.aero/tracking.asp" },
  { id: 42, name: "124 AH Air Algerie", url: "https://www.freight.aero/tracking.asp" },
  { id: 43, name: "125 BA British Airways", url: "https://www.iagcargo.com/en/home" },
  { id: 44, name: "125 EI Aer Lingus Cargo", url: "https://www.iagcargo.com/en/home" },
  { id: 45, name: "126 GA Garuda Indonesia", url: "http://cargo.garuda-indonesia.com/" },
  { id: 46, name: "127 G3 Gol Airlines (VRG Linhas Aéreas)", url: "https://servicos.gollog.com.br/Home/Inicio" },
  { id: 47, name: "129 MP Martinair Cargo", url: "https://www.afklcargo.com/mycargo/shipment/singlesearch" },
  { id: 48, name: "130 5F Fly One", url: "https://pathfinder.digitalfactory.aero/" }, 
  { id: 49, name: "131 JL Japan Airlines", url: "http://www.jal.co.jp/en/jalcargo/inter/awb/" },
  { id: 50, name: "133 LR LACSA Airlines of Costa Rica", url: "http://www.aviancacargo.com/" },
  { id: 51, name: "134 AV Avianca Cargo", url: "https://www.aviancacargo.com/" },
  { id: 52, name: "137 T8 MCS Aerocarga de Mexico", url: "http://www.mcs-aerocarga.com/trackingMam.php?Idioma=Ing" },
  { id: 53, name: "139 AM Aeromexico Cargo", url: "https://www.skyteamcargo.com/" },
  { id: 54, name: "140 LI LIAT Airlines", url: "http://www.liat.com/navSource.html?page_id=159" },
  { id: 55, name: "141 FZ flydubai cargo", url: "http://prdcgofz.mercator.com/skychain/app?service=page/nwp:Trackshipmt" },
  { id: 56, name: "142 KF Air Belgium", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 57, name: "145 UC LAN Chile Cargo", url: "http://www.lancargo.com/" },
  { id: 58, name: "147 AT Royal Air Maroc", url: "https://www.freight.aero/tracking.asp" },
  { id: 59, name: "155 ES DHL Aviation", url: "https://aviationcargo.dhl.com/" },
  { id: 60, name: "157 QR Qatar Airways", url: "https://www.qrcargo.com/s/track-your-shipment" },
  { id: 61, name: "160 CX Cathay Pacific Airways", url: "http://www.cathaypacificcargo.com/usrapps/eServices/track/track.aspx" },
  { id: 62, name: "172 CV Cargolux Airlines", url: "https://www.cargolux.com/track-and-Trace" },
  { id: 63, name: "173 HA Hawaiian Airlines", url: "https://hawaiian.smartkargo.com/" },
  { id: 64, name: "174 4L LAS Cargo", url: "https://lascargo.com/en/tracking-en/" },
  { id: 65, name: "176 EK Emirates", url: "http://www.skycargo.com/" },
  { id: 66, name: "180 KE Korean Air", url: "http://cargo.koreanair.com/" },
  { id: 67, name: "183 RG VARIG ", url: "http://apps.traxon.com/rg042.htm" },
  { id: 68, name: "186 SW Air Namibia", url: "https://www.strike.aero/" },
  { id: 69, name: "189 JX Starlux Cargo", url: "https://www.starluxcargo.com/" },
  { id: 70, name: "199 TU Tunisair", url: "http://prdcgotu.mercator.com/skychain/app?service=page/nwp:Trackshipmt" },
  { id: 71, name: "202 TA TACA", url: "http://www.aviancacargo.com" },
  { id: 72, name: "203 5J Cebu Air", url: "https://cebu.smartkargo.com/" }, 
  { id: 73, name: "205 NH ANA All Nippon Cargo", url: "https://www.anacargo.jp/en/int/" },
  { id: 74, name: "214 PK Pakistan Int´l Airlines", url: "https://www.freight.aero/tracking.asp" },
  { id: 75, name: "217 TG Thai Airways", url: "https://chorus.thaicargo.com/skychain/app?service=page/nwp:Trackshipmt" },
  { id: 76, name: "228 UK TATA SIA Airlines/Vistara Cargo", url: "https://www.airvistara.com/trip/cargo-services" },
  { id: 77, name: "229 KU Kuwait Airways", url: "https://www.kuwaitairways.com/en/cargo/tracking" },
  { id: 78, name: "230 CM Copa Airlines Cargo", url: "http://www.copacargo.com/" },
  { id: 79, name: "232 MH Malaysian Airline System", url: "http://www.maskargo.com/" },
  { id: 80, name: "235 TK Turkish Airlines", url: "https://www.turkishcargo.com/en/online-services/shipment-tracking" },
  { id: 81, name: "239 MK Air Mauritius", url: "https://www.airmauritius.com/cargo/track-shipment" },
  { id: 82, name: "242 4E Stabo Air", url: "https://www.freight.aero/tracking.asp" },
  { id: 83, name: "244 TN Air Tahiti Nui", url: "https://www.airtahitinui.com/nz-en/online-cargo-tracking" },
  { id: 84, name: "250 HY Uzbekistan Airways", url: "https://ebooking.champ.aero/trace/HY/trace.asp" },
  { id: 85, name: "254 0J Jet Club", url: "http://www.strike.aero/" },
  { id: 86, name: "020 LH Lufthansa", url: "https://lufthansa-cargo.com/eservices/etracking" },
  { id: 87, name: "258 MD Air Madagascar", url: "http://195.64.139.84/datacair.com/track-trace/index.php" },
  { id: 88, name: "260 FJ Fiji Airways", url: "https://track.champ.aero/fj" },
  { id: 89, name: "262 U6 Ural Airlines Cargo", url: "https://cargo.uralairlines.ru/en/services/tracking/" },
  { id: 90, name: "272 K4 Kalitta Air", url: "http://www.kalittaair.com/tracking" },
  { id: 91, name: "281 RO Tarom", url: "https://www.freight.aero/tracking.asp" },
  { id: 92, name: "284 W6 Wizz Air", url: "http://www.utl-log.com/waybill" },
  { id: 93, name: "288 LD Air Hong Kong", url: "http://www.hactl.com/en-US/Home.aspx" },
  { id: 94, name: "297 CI China Airlines", url: "https://cargo.china-https://icargowebportal.china-airlines.com/icargoneoportal/app/#/app" },
  { id: 95, name: "301 5S Global Aviation and Services", url: "https://globalairt.com/cargo/" },
  { id: 96, name: "302 OO Sky West Airlines", url: "https://www.deltacargo.com/Cargo/" },
  { id: 97, name: "312 6E IndiGo CarGo", url: "https://6ecargo.goindigo.in/FrmAWBTracking.aspx" },
  { id: 98, name: "321 QP Starlight Airlines", url: "http://www.starlightairline.com/track_shipment.aspx" },
  { id: 99, name: "324 SC Shandong Airlines", url: "http://cargo.shandongair.com.cn/sc/public/index.aspx?strCul=en" },
  { id: 100, name: "328 DY Norwegian Air Shuttle", url: "http://www.norwegiancargo.com/" },
  { id: 101, name: "331 S4 SATA International", url: "http://www.sata.pt/en/other-services/cargo-tracking" },
  { id: 102, name: "345 NC Northern Air Cargo / StratAir", url: "https://www.stratair.net/shipment-tracking/" },
  { id: 103, name: "350 YP Air Premia", url: "https://pathfinder.digitalfactory.aero/#/" },
  { id: 104, name: "354 CO Cobaltair", url: "http://www.aiacargo.com/" },
  { id: 105, name: "355 E7 Estafeta Carga Aerea", url: "http://www.estafeta.com/services/cargo/air-cargo/tracking.aspx" },
  { id: 106, name: "356 C8 Cargolux Italia", url: "https://www.cargolux.com/track-and-Trace" },
  { id: 107, name: "369 5Y Atlas Air", url: "https://www.atlasair.com/" },
  { id: 108, name: "375 3K Jetstar Asia Airways", url: "http://jetstar.cargovision.ca/" },
  { id: 109, name: "377 WW WOW Air", url: "http://tracecargo.info/track.php" },
  { id: 110, name: "378 KX Cayman Airways", url: "http://www.newcaymancargo.com/" },
  { id: 111, name: "390 A3 Aegean Airlines", url: "http://en.aegeanair.com/travel-information/cargo-services/" },
  { id: 112, name: "403 PO Polar Air Cargo", url: "http://www.polaraircargo.com/" },
  { id: 113, name: "406 5X UPS Air Cargo", url: "https://www.ups.com/aircargo/using/services/actracking/actracking.html" },
  { id: 114, name: "416 N8 National Air Cargo", url: "https://www.nationalaircargo.com/track/" },
  { id: 115, name: "417 E6 Bringer Air Cargo", url: "http://www.bringeraircargo.com/tracking/" },
  { id: 116, name: "423 ER DHL Aviation/DHL Airways", url: "https://aviationcargo.dhl.com/" },
  { id: 117, name: "439 ZI Aigle Azur", url: "http://www.network-airline.com/" },
  { id: 118, name: "456 CB TransCaribbean Cargo", url: "https://www.tccargo.us/en/tracking-2/" },
  { id: 119, name: "459 WB RwandAir", url: "https://www.rwandair.com/business-solutions/cargo-tracking/" },
  { id: 120, name: "462 XL LAN Ecuador", url: "http://www.lancargo.com/" },
  { id: 121, name: "463 ZP Silk Way Airlines", url: "https://www.freight.aero/tracking.asp" },
  { id: 122, name: "465 KC Air Astana", url: "https://www.freight.aero/tracking.asp" },
  { id: 123, name: "473 SE XL Airways France", url: "https://www.wfs.aero/tracking-page/" },
  { id: 124, name: "479 ZH Shenzhen Airlines", url: "https://cargo.shenzhenair.com/" },
  { id: 125, name: "485 8V Astral Aviation", url: "https://network-airline.com/" },
  { id: 126, name: "489 W8 Cargojet Airways", url: "https://apps.cargojet.com/ords/f?p=102:857" },
  { id: 127, name: "490 HC Air Senegal", url: "https://airsenegal.smartkargo.com/Login.aspx" },
  { id: 128, name: "501 7L Silk Way West Airlines", url: "http://www.silkwaywest.com/" },
  { id: 129, name: "503 CD Corendon Airlines", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 130, name: "506 N0 Norse Atlantic Airways", url: "https://norsetracking.awery.com/" },
  { id: 131, name: "508 QJ Jet Airways Inc.", url: "http://www.jet-airways.com/" },
  { id: 132, name: "510 VZ Airclass Lineas Aereas", url: "https://www.freight.aero/tracking.asp" },
  { id: 133, name: "512 RJ Royal Jordanian", url: "http://rj-cargo.com/track-and-trace" },
  { id: 134, name: "514 G9 Air Arabia", url: "https://airarabia-g9.ibsplc.aero/icargoneoportal/app/main/#/app" },
  { id: 135, name: "525 B7 Uni Airways", url: "http://www.brcargo.com/ec_web/Default.aspx" },
  { id: 136, name: "526 WN Southwest Airlines", url: "https://www.swacargo.com/swacargo_com_ui/manage/tracking" },
  { id: 137, name: "530 T0 Trans American Airways/TACA Peru", url: "http://www.aviancacargo.com/" },
  { id: 138, name: "536 Z0 Norse Atlantic UK", url: "https://norsetracking.awery.com/" }, 
  { id: 139, name: "537 W5 Mahan Airlines", url: "http://mahan-cargo.com/en/#Page6"   },
  { id: 140, name: "539 TH Raya Airways", url: "https://cargo.rayaairways.com/Tracki  ng/AWB/" },
  { id: 141, name: "542 T5 Turkmenistan Airlines", url: "https://tua-cargo.crane.aer  o/cargo-tracking" },
  { id: 142, name: "543 JK Aerolinea Del Caribe / Aercaribe", url: "https://pathfinder.digitalfactory.aero/#/" },
  { id: 143, name: "549 M3 ABSA Cargo Airline / LATAM Cargo Brasil", url: "http://www.latamcargo.com/" },
  { id: 144, name: "555 SU Aeroflot", url: "https://www.skyteam.com/en/cargo/track-shipment/" },
  { id: 145, name: "560 P3 Cargologicair", url: "http://www.cargologicair.com/cargo-tracking/" },
  { id: 146, name: "566 PS Ukraine Int´l Airlines", url: "https://www.freight.aero/tracking.asp" },
  { id: 147, name: "572 9U Air Moldova", url: "http://www.airmoldova.md/cargo-check-en/" },
  { id: 148, name: "574 4W Allied Air", url: "https://network-airline.com/" },
  { id: 149, name: "575 7C Coyne Airways", url: "http://www.coyneair.com/" },
  { id: 150, name: "576 KY Skylease Cargo", url: "http://www.skyleasecargo.com/" },
  { id: 151, name: "577 AD Azul Cargo", url: "https://azulcargoexpress.smartkargo.com/" },
  { id: 152, name: "580 RU AirBridge Cargo", url: "http://www.airbridgecargo.com/en/tracking/" },
  { id: 153, name: "585 2Y My Indo Airlines", url: "https://www.myindoairlines.com/" },
  { id: 154, name: "589 9W Jet Airways", url: "http://cargo.jetairways.com/cargoview/" },
  { id: 155, name: "596 DD Nok Air", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 156, name: "603 UL SriLankan Cargo", url: "https://srilankancargo.ibsplc.aero/icargoneoportal/app/main/#/app" },
  { id: 157, name: "607 EY ETIHAD Airways", url: "http://www.etihadcargo.com/" },
  { id: 158, name: "612 TB TUI Airlines", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 159, name: "615 QY DHL Aviation / European Air Transport", url: "https://aviationcargo.dhl.com/" },
  { id: 160, name: "618 SQ Singapore Airlines", url: "http://www.siacargo.com/ccn/ShipmentTrack.aspx" },
  { id: 161, name: "622 MO Calm Air", url: "https://cargo.calmair.com/WebContent/EN/CargoTracking" },
  { id: 162, name: "623 FB Bulgaria Air", url: "http://195.64.139.84/datacair.com/track-trace/index.php" },
  { id: 163, name: "624 PC Pegasus Cargo", url: "http://www.pegasuscargo.com/en/default.aspx" },
  { id: 164, name: "628 B2 Belavia Belarusian Airlines", url: "https://en.belavia.by/carriage_of_cargo/tracking/" },
  { id: 165, name: "629 MI Silk Air", url: "http://www.siacargo.com/" },
  { id: 166, name: "630 DK Sunclass Airlines", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 167, name: "631 GL Air Greenland", url: "https://www.airgreenland.com/cargo/tracking-awb/" },
  { id: 168, name: "635 IY Yemenia Yemen Airways", url: "https://yemenia.com/cargo" },
  { id: 169, name: "636 BP Air Botswana", url: "https://www.freight.aero/tracking.asp" },
  { id: 170, name: "643 KM Air Malta", url: "https://www.freight.aero/tracking.asp" },
  { id: 171, name: "644 4S Solar Cargo", url: "http://solarcargo.cargolink.aero/tracking/" },
  { id: 172, name: "649 TS Air Transat", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 173, name: "656 PX Air Niugini", url: "http://prdcgopx.mercator.com/skychain/app?service=page/nwp:Trackshipmt" },
  { id: 174, name: "657 BT Air Baltic", url: "https://www.airbaltic.com/en/cargo/online-services" },
  { id: 175, name: "658 X8 Airmax Cargo", url: "http://www.airmaxcargo.com.pe/AirsisWeb/tracking.xhtml" },
  { id: 176, name: "672 BI Royal Brunei Airlines", url: "https://www.flyroyalbrunei.com/rba/cargospot/" },
  { id: 177, name: "675 NX Air Macau", url: "http://119.254.234.112/nx/PublicEng/index.aspx?strCul=en" },
  { id: 178, name: "687 KH Aloha Air Cargo", url: "http://www.alohaaircargo.com/shipment-tracking/" },
  { id: 179, name: "695 BR Eva Airways", url: "https://www.brcargo.com/NEC_WEB/Tracking/QuickTracking/Index" },
  { id: 180, name: "699 UW Uni-Top Airlines", url: "http://www.uni-top.com:8081/CargoTracking/queryWaybill.aspx" },
  { id: 181, name: "700 5C Challenge Airlines IL", url: "https://www.challenge-group.com/tracking/" },
  { id: 182, name: "703 NO Neos SPA", url: "https://world-cs.de/" },
  { id: 183, name: "706 KQ Kenya Airways", url: "http://www.kqcargo.com/" },
  { id: 184, name: "711 MR ACTC", url: "https://www.utopiax.org/" },
  { id: 185, name: "716 MB MNG Airlines", url: "https://www.mngairlines.com/" },
  { id: 186, name: "724 LX Swiss", url: "https://www.swissworldcargo.com/track_n_trace" },
  { id: 187, name: "729 QT Tampa Airlines", url: "https://www.aviancacargo.com/" },
  { id: 188, name: "731 MF XiamenAir", url: "https://cargo.xiamenair.com/Cargo/English/Search.html?status=1" },
  { id: 189, name: "737 SP SATA Air Acores", url: "http://www.sata.pt/en/other-services/cargo-tracking" },
  { id: 190, name: "738 VN Vietnam Airlines", url: "https://track.champ.aero/vn" },
  { id: 191, name: "744 X7 Challenge Airlines BE", url: "https://www.challenge-group.com/tracking/" },
  { id: 192, name: "752 X6 Challenge Airlines MT", url: "https://www.challenge-group.com/tracking/" },
  { id: 193, name: "754 TB Jetairfly", url: "http://web.ana-aviation.com/" },
  { id: 194, name: "756 3V ASL Airlines Belgium", url: "https://www.aslairlines.be/" },
  { id: 195, name: "762 DI Norwegian Air UK", url: "https://www.norwegiancargo.com/" },
  { id: 196, name: "771 J2 Azerbaijan Airlines", url: "https://www.azal.az/en/information/cargo/" },
  { id: 197, name: "774 FM Shanghai Airlines", url: "http://cargo2.ceair.com/mu/" },
  { id: 198, name: "775 SG SpiceJet", url: "https://www.spicexpress.com/" },
  { id: 199, name: "781 MU China Eastern Airlines", url: "http://cargo2.ceair.com/mu/" },
  { id: 200, name: "783 E9 Iberojet / Evelop Airlines", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 201, name: "784 CZ China Southern Airlines", url: "https://tang.csair.com/EN/WebFace/Tang.WebFace.Cargo/AgentAwbBrower.aspx?lan=en-us" },
  { id: 202, name: "803 AE Mandarin Airlines", url: "http://www.mandarin-airlines.com/cargo_new/index.htm" },
  { id: 203, name: "805 4X Mercury Americas", url: "https://www.mercuryamericas.com/tracking.html" },
  { id: 204, name: "806 7C Jeju Air", url: "https://cargo.jejuair.net/cargo/main.do" },
  { id: 205, name: "807 AK AirAsia Berhad", url: "https://airasia.smartkargo.com/FrmAWBTracking.aspx" },
  { id: 206, name: "810 M6 Amerijet International", url: "https://www.amerijet.com/" },
  { id: 207, name: "816 OD Malindo Airways", url: "http://cargo.malindoair.com/AWBTracking.aspx" },
  { id: 208, name: "817 S6 SAC South American Airways", url: "http://www.southamericanairways.com/tracking_summary.asp" },
  { id: 209, name: "826 GS TianJin Airlines", url: "https://www.hnacargo.com/Portal2/AwbSearch.aspx" },
  { id: 210, name: "827 R4 RUS Aviation", url: "http://www.rusaviation.com/#e&tracking&" },
  { id: 211, name: "828 RH Hong Kong Air Cargo", url: "https://www.hkaircargo.com/" },
  { id: 212, name: "829 PG Bangkok Airways", url: "https://icargonet.ibsplc.aero/pgportal/portal/trackshipments?&trkTxnValue=829-" },
  { id: 213, name: "831 OU Croatia Airlines", url: "https://www.freight.aero/tracking.asp" },
  { id: 214, name: "832 GB ABX Air", url: "http://www.stratair.net/#!/tracking/" },
  { id: 215, name: "838 WS Westjet Cargo", url: "https://cargo.westjet.com/Tracking.aspx?Culture=EN" },
  { id: 216, name: "843 D7 AirAsia", url: "https://airasia.smartkargo.com/FrmAWBTracking.aspx" },
  { id: 217, name: "851 HX Hong Kong Airlines", url: "https://www.hkaircargo.com/" },
  { id: 218, name: "865 M7 MASAir", url: "https://masair.smartkargo.com/Login.aspx" },
  { id: 219, name: "871 Y8 Suparana / Jinpeng / Yangtze River Express Airlines", url: "https://www.hnacargo.com/Portal2/AwbSearch.aspx" },
  { id: 220, name: "873 6R AeroUnion", url: "https://www.aerounion.com.mx/icargoauportal/portal/trackshipments?&trkTxnValue=873-" },
  { id: 221, name: "876 3U Sichuan Airlines", url: "https://cargonest.sal-sichuanair.com/login" },
  { id: 222, name: "880 HU Hainan Airlines", url: "https://www.hnacargo.com/Portal2/Index.aspx" },
  { id: 223, name: "881 DE Condor Flugdienst", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 224, name: "901 B1 TAB Transportes Aereos Bolivianos", url: "https://www.tabairlines.com/" },
  { id: 225, name: "910 WY Oman Air", url: "https://omanair.smartkargo.com/" },
  { id: 226, name: "921 O3 SF Airlines", url: "https://www.sf-airlines.com/sfa/en/index.html" },
  { id: 227, name: "923 SS Corsair", url: "https://pathfinder.digitalfactory.aero/" },
  { id: 228, name: "932 VS Virgin Atlantic", url: "https://www.virginatlanticcargo.com/gb/en.html" },
  { id: 229, name: "933 KZ Nippon Cargo Airlines", url: "https://www.nca.aero/e/index.html" },
  { id: 230, name: "936 D0 DHL Aviation", url: "https://aviationcargo.dhl.com/" },
  { id: 231, name: "946 V4 Vensecar Internacional", url: "https://aviationcargo.dhl.com/aviationcargo/" },
  { id: 232, name: "957 JJ LATAM Airlines Brasil / TAM Linhas Aereas", url: "https://www.latamcargo.com/en/trackshipment" },
  { id: 233, name: "958 7I Insel Air Cargo", url: "http://www.inselaircargo.com/Tracking.2561" },
  { id: 234, name: "960 OV Estonian Air", url: "http://www.sychene.com/Tracking.aspx" },
  { id: 235, name: "961 LQ Lanmei Airlines", url: "https://corp.cambodia-airports.aero/en/cargo/phnom-penh-cargo-tracking" },
  { id: 236, name: "976 L7 LATAM Cargo Colombia", url: "https://www.latamcargo.com/en/trackshipment" },
  { id: 237, name: "978 VJ Vietjet", url: "https://cargo.vietjetair.com/" },
  { id: 238, name: "988 OZ Asiana Airlines", url: "https://www.asianacargo.com/tracking/viewTraceAirWaybill.do" },
  { id: 239, name: "992 D5 DHL Aero Expreso", url: "https://aviationcargo.dhl.com/" },
  { id: 240, name: "994 KJ Air Incheon", url: "http://www.air-incheon.com/tracking.php" },
  { id: 241, name: "996 UX Air Europa Cargo", url: "http://www.aireuropacargo.com/" },
  { id: 242, name: "997 BG Biman Bangladesh", url: "https://www.freight.aero/tracking.asp" },
  { id: 243, name: "999 CA Air China Cargo", url: "https://www.airchinacargo.com/cargo_en/gz" }
  // Add more airlines here to reach 200...
];

const AirlineTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAirlines = useMemo(() => {
    if (!searchTerm) return airlines;
    return airlines.filter(airline =>
      airline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <main className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => window.history.back()} 
            className="text-blue-600 hover:text-blue-800 underline mb-4 inline-block bg-none border-none cursor-pointer"
          >
            &larr; Back to tools
          </button>
          <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
            <span className="text-4xl">✈️</span>
            Airline Tracking
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search airlines by code or name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pl-10 pr-10 border-2 border-blue-200 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-black"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{airlines.length}</div>
            <div className="text-sm text-blue-500">Total Airlines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredAirlines.length}</div>
            <div className="text-sm text-blue-500">Visible</div>
          </div>
        </div>

        {/* Airlines Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          {filteredAirlines.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>No airlines found matching your search.</p>
              <button
                onClick={clearSearch}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div 
              className="grid gap-1 max-h-80 overflow-y-auto p-2"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'
              }}
            >
              {filteredAirlines.map((airline) => (
                <a
                  key={airline.id}
                  href={airline.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 flex items-center min-h-10"
                >
                  <div className="flex-1 truncate">
                    <div className="font-bold text-xs text-blue-800 mb-0.5">
                      {airline.name.split(' ')[0]} {airline.name.split(' ')[1]}
                    </div>
                    <div className="text-xs text-blue-600 truncate">
                      {airline.name.split(' ').slice(2).join(' ')}
                    </div>
                  </div>
                  <div className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-blue-600">
          <p>Click on any airline to visit their cargo tracking page</p>
        </div>
      </div>
    </main>
  );
};

export default AirlineTracking;