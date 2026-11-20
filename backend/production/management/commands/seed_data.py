"""
Idempotent demo content for the studio website.

Usage:
    python manage.py seed_data          # create or update demo content
    python manage.py seed_data --reset  # wipe catalogue tables first (briefs are kept)
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from production.models import CrewMember, PortfolioFilm, ProductionCategory, ProductionService

UNSPLASH = "https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1600&q=80"
UNSPLASH_PORTRAIT = "https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=800&h=1000&q=80"


def img(photo_id: str) -> str:
    return UNSPLASH.format(id=photo_id)


CATEGORIES = [
    {
        "slug": "reklamne-spoty",
        "name": "Reklamné spoty (TV & Online)",
        "short_summary": "Kampane s príbehom, ktoré predávajú – od kreatívneho námetu až po finálny master pre TV aj online.",
        "icon_name": "megaphone",
    },
    {
        "slug": "firemne-videa",
        "name": "Firemné a brand videá",
        "short_summary": "Náborové, imidžové a PR videá, ktoré ukážu ľudí, hodnoty a ambície vašej značky.",
        "icon_name": "building",
    },
    {
        "slug": "event-aftermovies",
        "name": "Event a konferenčné aftermovies",
        "short_summary": "Atmosféra konferencií, festivalov a firemných podujatí zhustená do pár strhujúcich minút.",
        "icon_name": "spark",
    },
    {
        "slug": "social-media-reels",
        "name": "Social Media & Reels produkcia",
        "short_summary": "Vertikálny obsah 9:16 pre Instagram, TikTok a YouTube Shorts – rýchly, natívny a v sériách.",
        "icon_name": "phone",
    },
    {
        "slug": "produktove-gastro-videa",
        "name": "Produktové a gastro videá",
        "short_summary": "Detailné makro zábery, svetlo a pohyb, vďaka ktorým produkt alebo jedlo doslova vystúpi z obrazovky.",
        "icon_name": "box",
    },
    {
        "slug": "dronove-zabery",
        "name": "Letecké zábery dronom (FPV & Cinema)",
        "short_summary": "Certifikované kinematografické a FPV lety – od majestátnych panorám po adrenalínové prelety.",
        "icon_name": "drone",
    },
]

FILMS = [
    {
        "slug": "kampan-premiova-prazirena-kavy",
        "title": "TV a online kampaň pre prémiovú slovenskú pražiareň kávy",
        "client_name": "Zrnko & Para Roasters",
        "client_sector": "Gastro / FMCG",
        "category": "reklamne-spoty",
        "production_year": 2026,
        "duration_timecode": "00:45",
        "camera_gear": "RED Komodo 6K • Anamorphic Lenses • Laowa Probe Macro",
        "filming_days": 2,
        "video_embed_url": "https://www.youtube.com/embed/PVGeM40dABA",
        "thumbnail_url": img("1495474472287-4d71bcdd2085"),
        "creative_brief": (
            "Pražiareň vstupovala do celoslovenskej distribúcie a potrebovala kampaň, ktorá vysvetlí, "
            "prečo sa oplatí zaplatiť za šálku viac. Cieľom bolo vybudovať prémiové vnímanie značky "
            "a podporiť predaj predplatného v e-shope – v TV, na YouTube aj na sociálnych sieťach."
        ),
        "execution_summary": (
            "Postavili sme príbeh „od zrnka po prvý dúšok“ s dôrazom na remeslo. Natáčali sme v pražiarni "
            "a v ateliéri s riadeným svetlom – anamorfné objektívy dodali obrazu filmový charakter, makro "
            "sonda Laowa zachytila detail praženia aj krémy espressa. Výsledkom je 45-sekundový TV spot, "
            "15-sekundové cutdowny a vertikálne verzie, ktoré zvýšili konverzie predplatného o 38 %."
        ),
        "deliverables_tags": ["4K Master 16:9", "TV spot 30\" + 15\"", "9:16 Reels verzie", "Color Grading", "Sound Design"],
        "is_featured": True,
        "display_order": 1,
    },
    {
        "slug": "naborove-brand-video-technologicky-lider",
        "title": "Náborové a brand video pre technologického lídra",
        "client_name": "Nordvolt Systems",
        "client_sector": "IT & Engineering",
        "category": "firemne-videa",
        "production_year": 2026,
        "duration_timecode": "02:10",
        "camera_gear": "Sony FX6 • Sigma Cine Primes • DJI RS 4 Pro",
        "filming_days": 2,
        "video_embed_url": "https://www.youtube.com/embed/R6MlUcmOul8",
        "thumbnail_url": img("1559136555-9303baea8ebd"),
        "creative_brief": (
            "Rýchlo rastúca technologická firma potrebovala do 6 mesiacov obsadiť 40 pozícií vývojárov "
            "a inžinierov. Klasické inzeráty nefungovali – kandidáti nevedeli, aké je to v tíme naozaj pracovať."
        ),
        "execution_summary": (
            "Namiesto korporátnych fráz sme dali slovo ľuďom. Dokumentárnym prístupom sme natočili rozhovory "
            "so šiestimi členmi tímu a doplnili ich o autentické zábery z vývoja a firemného života. "
            "Hlavné video doplnila séria krátkych portrétov pre LinkedIn. Počet relevantných reakcií "
            "na inzeráty vzrástol v prvom kvartáli 2,4-násobne."
        ),
        "deliverables_tags": ["4K Master 16:9", "6× LinkedIn portrét", "Titulky SK / EN", "Color Grading"],
        "is_featured": True,
        "display_order": 2,
    },
    {
        "slug": "aftermovie-medzinarodna-konferencia-bratislava",
        "title": "Aftermovie z medzinárodnej konferencie v Bratislave",
        "client_name": "Danube Tech Summit",
        "client_sector": "Konferencie & Eventy",
        "category": "event-aftermovies",
        "production_year": 2025,
        "duration_timecode": "01:45",
        "camera_gear": "2× Sony FX3 • Sony G Master Zoom • DJI Mini 4 Pro",
        "filming_days": 2,
        "video_embed_url": "https://www.youtube.com/embed/Y-rmzh0PI3c",
        "thumbnail_url": img("1505373877841-8d25f7d46678"),
        "creative_brief": (
            "Dvojdňová konferencia s 1 200 účastníkmi a 40 rečníkmi z celej Európy. Organizátor potreboval "
            "aftermovie, ktoré presvedčí partnerov a sponzorov o účasti na ďalšom ročníku, a sériu "
            "krátkych videí ešte počas podujatia."
        ),
        "execution_summary": (
            "Nasadili sme dvojčlenný kamerový tím a mobilnú strižňu priamo na mieste. Highlight Reels "
            "z prvého dňa boli online ešte v ten večer, finálne aftermovie sme dodali do 72 hodín. "
            "Rytmický strih, zvukové momenty z pódia a zábery z dronu nad Dunajom vytvorili video, "
            "ktoré sa stalo hlavným predajným nástrojom pre sponzorov ďalšieho ročníka."
        ),
        "deliverables_tags": ["4K Master 16:9", "Same-day Reels", "Rozhovory s rečníkmi", "Licencovaná hudba"],
        "is_featured": True,
        "display_order": 3,
    },
    {
        "slug": "seria-reels-sportova-znacka",
        "title": "Séria dynamických Reels spotov pre športovú značku",
        "client_name": "Velopeak Sport",
        "client_sector": "Šport & Lifestyle",
        "category": "social-media-reels",
        "production_year": 2026,
        "duration_timecode": "00:20",
        "camera_gear": "Sony FX3 • FPV Cinewhoop • Vertikálny rig 9:16",
        "filming_days": 1,
        "video_embed_url": "https://www.youtube.com/embed/UXqq0ZvbOnk",
        "thumbnail_url": img("1517649763962-0c623066013b"),
        "creative_brief": (
            "Cyklistická značka uvádzala novú kolekciu dresov a potrebovala na mesiac dopredu "
            "pripravený obsah pre Instagram a TikTok – rýchly, energický a natívny pre vertikálny formát."
        ),
        "execution_summary": (
            "Za jeden natáčací deň s amatérskym pelotónom sme vytvorili 12 vertikálnych spotov. "
            "FPV cinewhoop letel len pár centimetrov nad asfaltom medzi jazdcami, vertikálny rig "
            "zaručil kompozíciu bez orezávania. Kampaň dosiahla 1,8 milióna organických zhliadnutí."
        ),
        "deliverables_tags": ["12× Reels 9:16", "TikTok verzie", "Dynamické titulky", "Sound Design"],
        "is_featured": True,
        "display_order": 4,
    },
    {
        "slug": "letecky-film-vysoke-tatry",
        "title": "Letecký imidžový film pre horské resorty vo Vysokých Tatrách",
        "client_name": "Tatra Peaks Resorts",
        "client_sector": "Cestovný ruch",
        "category": "dronove-zabery",
        "production_year": 2025,
        "duration_timecode": "03:05",
        "camera_gear": "DJI Inspire 3 • Zenmuse X9-8K Air • FPV Cinelifter",
        "filming_days": 4,
        "video_embed_url": "https://player.vimeo.com/video/22439234",
        "thumbnail_url": img("1492691527719-9d1e07e534b4"),
        "creative_brief": (
            "Sieť horských hotelov chcela imidžový film pre zahraničné veľtrhy a web, ktorý ukáže "
            "Tatry v celej ich mohutnosti – vo všetkých ročných obdobiach a za úsvitu aj súmraku."
        ),
        "execution_summary": (
            "Počas štyroch natáčacích dní rozložených do troch sezón sme lietali s DJI Inspire 3 "
            "v rozlíšení 8K a FPV dronom pre dynamické prelety nad hrebeňmi. Všetky lety prebehli "
            "v súlade s povoleniami Dopravného úradu a správy TANAP-u. Film je dnes súčasťou "
            "veľtržných expozícií v Nemecku, Poľsku a Rakúsku."
        ),
        "deliverables_tags": ["8K Master", "4K HDR verzia", "Stock knižnica záberov", "Color Grading"],
        "is_featured": True,
        "display_order": 5,
    },
    {
        "slug": "launch-spot-premiovy-elektromobil",
        "title": "Launch spot pre uvedenie prémiového elektromobilu",
        "client_name": "Auto Volta Slovakia",
        "client_sector": "Automotive",
        "category": "reklamne-spoty",
        "production_year": 2025,
        "duration_timecode": "01:00",
        "camera_gear": "ARRI Alexa Mini LF • Cooke Anamorphic/i • Russian Arm",
        "filming_days": 3,
        "video_embed_url": "https://www.youtube.com/embed/mN0zPOpADL4",
        "thumbnail_url": img("1503376780353-7e6692767b70"),
        "creative_brief": (
            "Importér potreboval na uvedenie nového modelu na slovenský trh spot s kvalitou "
            "globálnych kampaní, no s lokálnym príbehom a lokáciami."
        ),
        "execution_summary": (
            "Natáčali sme na horských cestách pri Donovaloch a v nočnej Bratislave. Car-to-car "
            "zábery z ramena Russian Arm, anamorfné objektívy Cooke a precízny color grading "
            "v DaVinci Resolve vytvorili obraz na úrovni zahraničných kampaní. Spot bežal v TV, "
            "v kinách a ako pre-roll na YouTube."
        ),
        "deliverables_tags": ["4K DCP pre kiná", "TV spot 60\" + 30\"", "YouTube pre-roll", "Dolby 5.1 mix"],
        "is_featured": False,
        "display_order": 6,
    },
    {
        "slug": "gastro-video-michelinska-restauracia",
        "title": "Gastro video pre degustačné menu reštaurácie",
        "client_name": "Restaurant Lumen",
        "client_sector": "Gastronómia",
        "category": "produktove-gastro-videa",
        "production_year": 2026,
        "duration_timecode": "01:15",
        "camera_gear": "Sony FX6 • Laowa 24mm Probe • Robotický motion-control slider",
        "filming_days": 1,
        "video_embed_url": "https://www.youtube.com/embed/WhWc3b3KhnY",
        "thumbnail_url": img("1414235077428-338989a2e8c0"),
        "creative_brief": (
            "Fine-dining reštaurácia predstavovala nové sezónne degustačné menu a chcela video, "
            "ktoré prenesie atmosféru večera a remeselnú precíznosť kuchyne na web aj sociálne siete."
        ),
        "execution_summary": (
            "Kombinovali sme dokumentárne zábery z kuchyne s presnými motion-control prejazdmi "
            "nad hotovými chodmi. Teplé, nízko kľúčované svetlo a spomalené detaily vytvorili "
            "zmyslový zážitok. Rezervácie degustačného menu sa po spustení kampane vypredali na 6 týždňov dopredu."
        ),
        "deliverables_tags": ["4K Master 16:9", "Spomalené zábery 120 fps", "9:16 Reels verzie", "Color Grading"],
        "is_featured": False,
        "display_order": 7,
    },
    {
        "slug": "aftermovie-hudobny-festival",
        "title": "Oficiálne aftermovie letného hudobného festivalu",
        "client_name": "Riverside Sound Festival",
        "client_sector": "Kultúra & Festivaly",
        "category": "event-aftermovies",
        "production_year": 2025,
        "duration_timecode": "02:30",
        "camera_gear": "3× Sony FX3 • Sigma Art Primes • DJI Inspire 3",
        "filming_days": 3,
        "video_embed_url": "https://www.youtube.com/embed/eRsGyueVLvQ",
        "thumbnail_url": img("1470229722913-7c0e2dbbafd3"),
        "creative_brief": (
            "Trojdňový festival s 25 000 návštevníkmi potreboval aftermovie, ktoré spustí predaj "
            "early-bird vstupeniek na ďalší ročník hneď po skončení podujatia."
        ),
        "execution_summary": (
            "Tri kamerové tímy pokryli pódiá, backstage aj život v areáli, dron zachytil "
            "pulzujúci dav za súmraku. Aftermovie sme dodali do piatich dní a pomohlo vypredať "
            "prvú vlnu vstupeniek za rekordných 48 hodín."
        ),
        "deliverables_tags": ["4K Master 16:9", "Denné recapy 9:16", "Licencovaná hudba", "Sound Design"],
        "is_featured": False,
        "display_order": 8,
    },
]

SERVICES = [
    {
        "slug": "tvorba-reklamnych-spotov-na-kluc",
        "title": "Tvorba reklamných spotov na kľúč",
        "category": "reklamne-spoty",
        "short_description": "TV a online spoty od kreatívneho námetu cez casting až po finálny master pre vysielanie.",
        "detailed_description": (
            "Postaráme sa o celý proces – od kreatívnej koncepcie a scenára cez výber lokácií, casting "
            "a réžiu až po postprodukciu a dodanie vo formátoch pre TV, kino aj digitál. Pracujeme "
            "s cinema kamerami RED a ARRI, anamorfnými objektívmi a skúseným filmovým štábom."
        ),
        "included_phases": [
            "Kreatívny námet, scenár a storyboard",
            "Výber lokácií, casting hercov a réžia",
            "Natáčanie cinema technikou a profesionálnym svietením",
            "Strih, DaVinci Resolve color grading a mastering zvuku",
            "Cutdowny 15\" / 6\" a verzie pre sociálne siete",
        ],
        "typical_delivery_time": "3 – 5 týždňov",
        "starting_price_eur": Decimal("4900"),
        "is_featured": True,
        "display_order": 1,
    },
    {
        "slug": "firemne-naborove-pr-videa",
        "title": "Firemné, náborové a PR videá",
        "category": "firemne-videa",
        "short_description": "Videá, ktoré predstavia vašu firmu, ľudí a hodnoty – pre web, nábor aj investorov.",
        "detailed_description": (
            "Imidžové videá, náborové kampane, rozhovory s vedením, produktové prezentácie či interná "
            "komunikácia. Pomôžeme s námetom aj prípravou ľudí pred kamerou, aby pôsobili prirodzene."
        ),
        "included_phases": [
            "Úvodný workshop a kreatívny námet",
            "Scenár a príprava rozhovorov",
            "Natáčanie so štábom, svetlami a zvukom",
            "Strih, motion grafika a titulky",
            "Color grading a finálny export pre web a LinkedIn",
        ],
        "typical_delivery_time": "2 – 3 týždne",
        "starting_price_eur": Decimal("1900"),
        "is_featured": True,
        "display_order": 2,
    },
    {
        "slug": "mesacna-produkcia-obsahu-socialne-siete",
        "title": "Mesačná produkcia obsahu pre sociálne siete (Reels / TikTok)",
        "category": "social-media-reels",
        "short_description": "Pravidelný balík vertikálnych videí – plánovanie, natáčanie a strih v jednom.",
        "detailed_description": (
            "Spoločne pripravíme obsahový plán na mesiac, natočíme ho počas jedného až dvoch "
            "produkčných dní a dodáme sériu Reels a TikTokov s titulkami, hudbou a trendovými formátmi."
        ),
        "included_phases": [
            "Obsahová stratégia a mesačný plán",
            "Scenáre a hooky pre jednotlivé videá",
            "Natáčanie vo vertikálnom formáte 9:16",
            "Dynamický strih, titulky a sound design",
        ],
        "typical_delivery_time": "1 – 2 týždne",
        "starting_price_eur": Decimal("1200"),
        "is_featured": True,
        "display_order": 3,
    },
    {
        "slug": "eventove-aftermovies-livestreaming",
        "title": "Eventové aftermovies a livestreaming",
        "category": "event-aftermovies",
        "short_description": "Aftermovies, same-day edity a viackamerový livestream konferencií a podujatí.",
        "detailed_description": (
            "Zachytíme atmosféru vášho podujatia a premeníme ju na video, ktoré predáva ďalší ročník. "
            "Ponúkame aj same-day edity premietané ešte počas eventu a profesionálny viackamerový livestream."
        ),
        "included_phases": [
            "Príprava shot-listu a harmonogramu",
            "Viackamerové natáčanie a záznam zvuku",
            "Same-day Reels priamo z podujatia",
            "Strih aftermovie, color grading a licencovaná hudba",
        ],
        "typical_delivery_time": "3 – 7 dní",
        "starting_price_eur": Decimal("1400"),
        "is_featured": True,
        "display_order": 4,
    },
    {
        "slug": "certifikovane-letecke-zabery-dronom",
        "title": "Certifikované letecké zábery kinematografickým a FPV dronom",
        "category": "dronove-zabery",
        "short_description": "8K letecké zábery a FPV prelety s certifikovanými pilotmi a povoleniami.",
        "detailed_description": (
            "Lietame s DJI Inspire 3 (8K RAW) a FPV dronmi pre dynamické prelety interiérmi aj exteriérmi. "
            "Naši piloti sú registrovaní u Dopravného úradu SR, máme poistenie zodpovednosti a vybavíme "
            "povolenia do riadených a chránených zón."
        ),
        "included_phases": [
            "Analýza lokality a vzdušného priestoru",
            "Vybavenie povolení a koordinácia letov",
            "Natáčanie cinema a FPV dronom",
            "Stabilizácia, color grading a dodanie záberov",
        ],
        "typical_delivery_time": "1 – 2 týždne",
        "starting_price_eur": Decimal("690"),
        "is_featured": True,
        "display_order": 5,
    },
    {
        "slug": "produktove-gastro-videa-postprodukcia",
        "title": "Produktové a gastro videá s profesionálnou postprodukciou",
        "category": "produktove-gastro-videa",
        "short_description": "Ateliérové produktové videá, makro detaily a gastro zábery pre e-shopy aj kampane.",
        "detailed_description": (
            "V našom ateliéri s riadeným svetlom natočíme produkty v ich najlepšom svetle – s makro "
            "objektívmi, motion-control sliderom a spomalenými zábermi. Postprodukciu, retuš a color "
            "grading robíme v DaVinci Resolve v kalibrovanom prostredí."
        ),
        "included_phases": [
            "Styling a príprava produktov",
            "Ateliérové svietenie a motion-control zábery",
            "Makro a spomalené zábery až 240 fps",
            "Strih, retuš, color grading a export pre e-shop",
        ],
        "typical_delivery_time": "1 – 2 týždne",
        "starting_price_eur": Decimal("890"),
        "is_featured": False,
        "display_order": 6,
    },
]

CREW = [
    {
        "full_name": "Mgr. art. Lukáš Kováč",
        "role_title": "Režisér & Kreatívny producent",
        "bio": (
            "Absolvent réžie na VŠMU, viac ako 12 rokov tvorí reklamné spoty pre slovenské aj "
            "medzinárodné značky. Verí, že aj 30-sekundový spot musí mať príbeh, ktorý si divák zapamätá."
        ),
        "specialty_gear": "Réžia, scenáristika, kreatívna koncepcia",
        "photo_url": UNSPLASH_PORTRAIT.format(id="1507003211169-0a1dd7228f2d"),
        "display_order": 1,
    },
    {
        "full_name": "Bc. Petra Horváthová",
        "role_title": "Kameramanka / DOP",
        "bio": (
            "Hlavná kameramanka s citom pre svetlo a kompozíciu. Natáčala reklamy, dokumenty aj "
            "hudobné klipy; špecializuje sa na anamorfnú optiku a prácu s prirodzeným svetlom."
        ),
        "specialty_gear": "RED Komodo 6K, ARRI Alexa Mini LF, anamorfná optika",
        "photo_url": UNSPLASH_PORTRAIT.format(id="1438761681033-6461ffad8d80"),
        "display_order": 2,
    },
    {
        "full_name": "Martin Šimko",
        "role_title": "Senior strihač & Colorist",
        "bio": (
            "Certifikovaný DaVinci Resolve trainer s viac ako 400 dokončenými projektmi. Rytmus "
            "strihu a farebný charakter obrazu sú pre neho rovnako dôležité ako samotný príbeh."
        ),
        "specialty_gear": "DaVinci Resolve Studio, Adobe Premiere Pro, After Effects",
        "photo_url": UNSPLASH_PORTRAIT.format(id="1500648767791-00dcc994a43e"),
        "display_order": 3,
    },
    {
        "full_name": "Ing. Zuzana Novotná",
        "role_title": "Výkonná producentka",
        "bio": (
            "Drží v rukách rozpočty, harmonogramy a komunikáciu s klientmi. Vďaka nej každá "
            "produkcia beží načas, v rozpočte a bez stresu na strane klienta."
        ),
        "specialty_gear": "Produkcia, rozpočty, lokácie a povolenia",
        "photo_url": UNSPLASH_PORTRAIT.format(id="1544005313-94ddf0286df2"),
        "display_order": 4,
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovým obsahom štúdia (idempotentne)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Pred naplnením zmaže portfólio, služby, štáb a kategórie (dopyty zostávajú).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            PortfolioFilm.objects.all().delete()
            ProductionService.objects.all().delete()
            CrewMember.objects.all().delete()
            ProductionCategory.objects.all().delete()
            self.stdout.write(self.style.WARNING("Existujúci obsah bol zmazaný."))

        categories: dict[str, ProductionCategory] = {}
        for order, data in enumerate(CATEGORIES, start=1):
            data = dict(data)
            slug = data.pop("slug")
            categories[slug], _ = ProductionCategory.objects.update_or_create(
                slug=slug, defaults={**data, "display_order": order}
            )

        for data in FILMS:
            data = dict(data)
            slug = data.pop("slug")
            data["category"] = categories[data["category"]]
            PortfolioFilm.objects.update_or_create(slug=slug, defaults=data)

        for data in SERVICES:
            data = dict(data)
            slug = data.pop("slug")
            data["category"] = categories[data["category"]]
            ProductionService.objects.update_or_create(slug=slug, defaults=data)

        for data in CREW:
            data = dict(data)
            CrewMember.objects.update_or_create(full_name=data.pop("full_name"), defaults=data)

        self.stdout.write(
            self.style.SUCCESS(
                f"Hotovo: {ProductionCategory.objects.count()} kategórií, "
                f"{PortfolioFilm.objects.count()} filmov, "
                f"{ProductionService.objects.count()} služieb, "
                f"{CrewMember.objects.count()} členov štábu."
            )
        )
