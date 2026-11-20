import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, IconComponent, RevealDirective],
  templateUrl: './about.page.html',
  styleUrl: './about.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly site = SITE_CONFIG;
  protected readonly phoneHref = `tel:${SITE_CONFIG.contact.producerPhone.replace(/\s+/g, '')}`;
  protected readonly crew = inject(ApiService).crewResource();
  protected readonly openFaq = signal<number | null>(0);

  protected readonly principles = [
    {
      icon: 'film',
      title: 'Príbeh pred technikou',
      text: 'Najdrahšia kamera nezachráni slabý nápad. Každý projekt začíname otázkou: čo má divák cítiť a čo má urobiť?',
    },
    {
      icon: 'aperture',
      title: 'Remeslo v každom zábere',
      text: 'Svetlo, kompozícia, rytmus strihu a farba. Detaily, ktoré divák nevidí, no okamžite ich cíti.',
    },
    {
      icon: 'shield',
      title: 'Produkcia bez stresu',
      text: 'Jasný rozpočet, harmonogram a jeden kontakt. Termíny držíme a o všetkom viete vopred.',
    },
  ] as const;

  protected readonly faq: readonly FaqItem[] = [
    {
      question: 'Koľko stojí výroba firemného videa?',
      answer:
        'Jednoduché firemné video s kompaktným tímom začína približne na 1 900 € bez DPH. Štandardná produkcia so štábom, svetlami a 1 – 2 natáčacími dňami sa pohybuje medzi 3 500 – 7 000 €. Presný rozpočet závisí od rozsahu, počtu lokácií a postprodukcie – orientačnú cenu si môžete okamžite vypočítať v našej kalkulačke.',
    },
    {
      question: 'Ako dlho trvá dodanie hotového videa?',
      answer:
        'Eventové aftermovies dodávame zvyčajne do 3 – 7 dní, Reels už v deň podujatia. Firemné videá trvajú 2 – 3 týždne a reklamné spoty 3 – 5 týždňov od schválenia scenára. Ak máte pevný termín, prispôsobíme mu harmonogram.',
    },
    {
      question: 'Pomôžete nám aj s nápadom a scenárom?',
      answer:
        'Áno, a radi. Kreatívny námet, scenár a storyboard sú bežnou súčasťou našich produkcií. Stačí nám povedať cieľ, publikum a kde bude video bežať – zvyšok navrhneme a doladíme spolu s vami.',
    },
    {
      question: 'Koľko kôl pripomienok je v cene?',
      answer:
        'V cene sú dve kolá pripomienok k strihu. Pri reklamných spotoch schvaľujete aj scenár, storyboard a casting ešte pred natáčaním, takže vo finále nečakajú žiadne prekvapenia.',
    },
    {
      question: 'Môžete lietať s dronom v meste alebo v chránenom území?',
      answer:
        'Naši piloti sú registrovaní u Dopravného úradu SR a sme poistení. Lety v riadených zónách (napr. Bratislava) a v národných parkoch vybavujeme na základe povolení – stačí nám dať vedieť s dostatočným predstihom.',
    },
    {
      question: 'Komu patria práva na hotové video?',
      answer:
        'Po úhrade získavate licenciu na neobmedzené použitie videa na dohodnutých kanáloch. Hudbu licencujeme z profesionálnych knižníc, takže video môžete bez obáv zverejniť na YouTube, sociálnych sieťach aj v TV.',
    },
  ];

  constructor() {
    inject(SeoService).update(
      'O štúdiu a tím',
      'Spoznajte náš tím – režiséra, kameramanku, strihača & coloristu a výkonnú producentku. Filozofia štúdia a odpovede na časté otázky.',
    );
  }

  protected toggleFaq(index: number): void {
    this.openFaq.update((current) => (current === index ? null : index));
  }
}
